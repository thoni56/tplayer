<template>
    <v-container id="player" fluid style="padding-top: 0">
        <v-row>
            <v-col class="pt-0">
                <Filtering
                    ref="filtering"
                    @remove-hotkey-listener="removeKeylistener"
                    @install-hotkey-listener="installKeylistener"
                />
                <TuneDisplay />
                <Playbar :secondsPlayed="timePlayed" :secondsTotal="timeTotal" />
                <PlayerControls
                    :playing="playing"
                    @previous-tune="previousTune"
                    @skip-backward="skipBackward"
                    @play-pause="playOrPause"
                    @next-tune="nextTune"
                    @skip-forward="skipForward"
                    @play-timeout="setPlayTimeout"
                    @shuffle-tunes-toggle="toggleShuffle"
                />
                <TuneList @click="loadSelectedTuneAndPlay" />
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { TuneInfo } from '@/models/TuneInfo';
import Filtering from '@/views/Filtering.vue';
import TuneList from '@/components/TuneList.vue';
import TuneDisplay from '@/components/TuneDisplay.vue';
import PlayerControls from '@/components/PlayerControls.vue';
import Playbar from '@/components/Playbar.vue';
import scrollIntoView from 'scroll-into-view-if-needed';

function sleep(millis: number): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, millis));
}

let self: Player;

const fadeStep = 0.1;
const fadeTime = 100;
async function fadeOut() {
    while (audio.volume > fadeStep) {
        audio.volume -= fadeStep;
        await sleep(fadeTime);
    }
    audio.volume = 0;
    audio.pause();
    self.playing = false;
}

async function fadeIn() {
    await audio.play();
    while (audio.volume < 1 - fadeStep) {
        audio.volume += fadeStep;
        await sleep(fadeTime);
    }
    audio.volume = 1;
    self.playing = true;
}

function timerForPlayedTime() {
    self.timePlayed = audio.currentTime;
    setTimeout(timerForPlayedTime, 333);
}

const audio = new Audio();

export interface FilteringInterface extends Vue {
    changeBpm(n: number): void;
}

@Component({
    components: {
        Filtering,
        TuneDisplay,
        PlayerControls,
        Playbar,
        TuneList,
    },
})
export default class Player extends Vue {
    get currentTunes(): TuneInfo[] {
        return this.$store.getters.filteredTunes;
    }

    public playing = false;
    public timePlayed = 0;
    public timeTotal = 0;

    private playTimeout: number = 0;
    private playTimeoutInhibited: boolean = false;

    private shuffle: boolean = false;
    private currentShufflePartition: number = 0;
    private shufflePartitionCount: number = 4;

    get selectedTune() {
        return this.$store.state.tunes.selectedTune;
    }

    public mounted() {
        self = this;
        audio.addEventListener('playing', () => {
            self.timeTotal = audio.duration;
        });
        audio.addEventListener('ended', () => {
            self.nextTune();
        });

        setTimeout(timerForPlayedTime, 300);
        setTimeout(() => self.checkTimeout(), 400);

        this.setUpHotkeys();
    }

    public beforeDestroyed() {
        this.tearDownHotkeys();
    }

    // Public events
    public async playOrPause() {
        if (this.playing) {
            await this.pauseTune();
        } else {
            await this.playSelectedTune();
        }
    }

    public async nextTune() {
        await this.advanceTune(+1);
    }

    public async previousTune() {
        await this.advanceTune(-1);
    }

    private async playSelectedTune() {
        // Have to have an actual tune selected...
        if (!this.anyTuneSelected()) this.nextTune();
        await fadeIn(); // Start playing
    }

    private checkTimeout() {
        if (
            !this.playTimeoutInhibited &&
            this.playTimeout > 0 &&
            this.timePlayed >= this.playTimeout
        ) {
            this.playTimeoutInhibited = true;
            self.nextTune();
        }
        setTimeout(() => self.checkTimeout(), 400);
    }

    private async pauseTune() {
        await fadeOut();
    }

    private async advanceTune(direction: number) {
        if (this.currentTunes.length > 0) {
            if (this.shuffle) {
                await this.moveToTune(this.randomTune());
            } else {
                if (this.anyTuneSelected()) {
                    const indexOfPlayingTune = this.currentTunes.findIndex(
                        (tune) => tune === this.selectedTune
                    );
                    if (direction > 0) {
                        this.pickNextTune(indexOfPlayingTune);
                    } else {
                        this.pickPreviousTune(indexOfPlayingTune);
                    }
                } else {
                    await this.moveToTune(0);
                }
            }
        }
    }

    private async pickNextTune(indexOfPlayingTune: number) {
        if (indexOfPlayingTune === -1) {
            // If not found, the list has changed so start from beginning
            if (this.currentTunes.length > 0) {
                await this.moveToTune(0);
            }
        } else {
            if (indexOfPlayingTune < this.currentTunes.length - 1) {
                // More songs to play, so just pick next
                await this.moveToTune(indexOfPlayingTune + 1);
            } else {
                // At last song, restart from beginning
                await this.moveToTune(0);
            }
        }
    }

    private async pickPreviousTune(indexOfPlayingTune: number) {
        if (indexOfPlayingTune === -1) {
            // If not found, the list has changed so play last tune
            if (this.currentTunes.length > 0) {
                await this.moveToTune(this.currentTunes.length - 1);
            }
        } else {
            if (indexOfPlayingTune > 0) {
                // More songs to play, so just pick previous
                await this.moveToTune(indexOfPlayingTune - 1);
            } else {
                // At first tune so move to end of list
                await this.moveToTune(this.currentTunes.length - 1);
            }
        }
    }

    // Events:

    public skipBackward() {
        if (this.playing) {
            audio.currentTime = Math.max(0, audio.currentTime - 10);
        }
    }

    public skipForward() {
        if (this.playing) {
            audio.currentTime = Math.min(audio.currentTime + 10, audio.duration - 10);
        }
    }

    // select shuffle from PlayerControls
    public toggleShuffle() {
        this.shuffle = !this.shuffle;
    }

    // select timeout from PlayerControls
    public setPlayTimeout(seconds: number) {
        this.playTimeout = seconds;
    }

    private faster() {
        const filtering = this.$refs.filtering as FilteringInterface;
        filtering.changeBpm(4);
    }

    private slower() {
        const filtering = this.$refs.filtering as FilteringInterface;
        filtering!.changeBpm(-3);
    }

    // :click from TuneList
    // Expects a tune to be selected
    public loadSelectedTuneAndPlay() {
        fadeOut().then(() => this.loadSelectedTune().then(() => this.playSelectedTune()));
    }

    // Hotkeys
    private keyListener(e: KeyboardEvent) {
        e.preventDefault();
        switch (e.key) {
            case 'p': // Previous
            case 'ArrowLeft':
            case 'BrowserBack':
                this.previousTune();
                break;
            case 'n': // Next
            case 'ArrowRight':
            case 'BrowserForward':
                this.nextTune();
                break;
            case ' ': // Toogle Play/Pause
            case 'Enter':
                this.playOrPause();
                break;
            case 'f': // Faster
            case 'PageUp':
                this.faster();
                break;
            case 's': // Slower
            case 'PageDown':
                this.slower();
                break;
            case 'Unidentified':
            // Maybe "Menu" on Apple remote
        }
    }

    public setUpHotkeys() {
        document.addEventListener('keyup', this.keyListener);
    }

    private tearDownHotkeys() {
        document.removeEventListener('keyup', this.keyListener);
    }

    public installKeylistener() {
        this.setUpHotkeys();
        console.log('Key listener installed!');
    }

    public removeKeylistener() {
        this.tearDownHotkeys();
        console.log('Key listener removed!');
    }

    private anyTuneSelected(): boolean {
        return this.selectedTune.file !== '';
    }

    private async moveToTune(nextIndexToPlay: number) {
        // Assumes the index is valid
        const wasPlaying = this.playing;
        if (this.playing) await fadeOut();
        this.$store.commit('tunes/SELECT_TUNE', this.currentTunes[nextIndexToPlay]);
        await this.loadSelectedTune();
        this.timePlayed = 0;
        if (wasPlaying) await this.playSelectedTune();
        this.playTimeoutInhibited = false;
        scrollIntoView(document.getElementById(this.currentTunes[nextIndexToPlay].file)!, {
            scrollMode: 'if-needed',
        });
    }

    // TODO: should we send in the index? We set the Vuex:selectedTune...
    // because we don't need the index in this function...
    // If not, this should be called loadSelectedSong()...
    private async loadSelectedTune() {
        const uri = await window.api.sendSync('convertSongToUri', this.selectedTune.file);
        audio.src = uri;
        audio.load();
        this.playing = false;
        this.timePlayed = 0;
        this.timeTotal = audio.duration;
    }

    private randomBetween(min: number, max: number): number {
        return min + Math.floor(Math.random() * Math.floor(max));
    }

    private randomTune(): number {
        // Round-robin over partitions
        const currentPartition: number = this.currentShufflePartition++;
        this.currentShufflePartition = this.currentShufflePartition % this.shufflePartitionCount;

        // Partition list of tunes into four sets of evenly distributed BPMs
        const tmin: TuneInfo = this.currentTunes.reduce((t1: TuneInfo, t2: TuneInfo) =>
            t1.bpm! < t2.bpm! ? t1 : t2
        );
        const tmax: TuneInfo = this.currentTunes.reduce((t1: TuneInfo, t2: TuneInfo) =>
            t1.bpm! > t2.bpm! ? t1 : t2
        );

        const bpmMin: number = tmin.bpm!;
        const bpmMax: number = tmax.bpm!;
        const bpmRange: number = bpmMax - bpmMin;
        const partitionSize: number = Math.floor(bpmRange / this.shufflePartitionCount);

        const partitionMin: number = bpmMin + currentPartition * partitionSize;
        const partitionMax: number = partitionMin + partitionSize;

        // Select a random tune in that partition
        const partition = this.currentTunes.filter(
            (t: TuneInfo) => t.bpm! >= partitionMin && t.bpm! <= partitionMax
        );
        const randomTune = partition[this.randomBetween(0, partition.length)];

        return this.currentTunes.findIndex((tune) => tune.file === randomTune.file);
    }
}
</script>
