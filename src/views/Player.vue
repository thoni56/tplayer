<template>
  <v-container id="player" fluid style="padding-top:0;">
    <v-row>
      <v-col class="pt-0">
        <TuneDisplay />
        <Playbar :secondsPlayed="timePlayed" :secondsTotal="timeTotal" />
        <PlayerControls
          :playing="playing"
          @previous-tune="previousTune"
          @play-pause="playOrPause"
          @next-tune="nextTune"
          @play-timeout="setPlayTimeout"
          @shuffle-tunes-toggle="toggleShuffle"
        />
        <TuneList
          @click="loadSelectedTuneAndPlay"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { TuneInfo } from "@/models/TuneInfo";
import TuneList from "@/components/TuneList.vue";
import TuneDisplay from "@/components/TuneDisplay.vue";
import PlayerControls from "@/components/PlayerControls.vue";
import Playbar from "@/components/Playbar.vue";

function sleep(millis: number): Promise<any> {
  return new Promise(resolve => setTimeout(resolve, millis));
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
  setTimeout(timerForPlayedTime, 200);
}

const audio = new Audio();

@Component({
  components: {
    TuneDisplay,
    PlayerControls,
    Playbar,
    TuneList
  }
})
export default class Player extends Vue {

  get currentTunes(): TuneInfo[] {
    return this.$store.getters.filteredTunes;
  }

  public playing = false;
  public timePlayed = 0;
  public timeTotal = 0;
  private keyListener: any;

  private playTimeout: number = 0;
  private playTimer!: ReturnType<typeof setTimeout>;

  private shuffle: boolean = false;
  private currentShufflePartition: number = 0;
  private shufflePartitionCount: number = 4;

  get selectedTune() {
    return this.$store.state.selectedTune;
  }

  public mounted() {
    self = this;
    audio.addEventListener("playing", () => {
      self.timeTotal = audio.duration;
    });
    audio.addEventListener("ended", () => {
      self.nextTune();
    });

    setTimeout(timerForPlayedTime, 200);
    this.setUpShortkeys();
  }

  public beforeDestroyed() {
    this.tearDownShortkeys();
  }

  // Public events
  public playOrPause() {
    if (this.playing) {
      this.pauseTune();
    } else {
      this.playSelectedTune();
    }
  }

  public async playSelectedTune() {
    // Have to have an actual tune selected...
    if (this.selectedTune.file === "")
      return;
    await fadeIn(); // Start playing

    clearTimeout(this.playTimer);
    if (this.playTimeout !== 0) {
      this.playTimer = setTimeout(
        () => self.checkTimeout(),
        400
      );
    }
  }

  public checkTimeout() {
    if (audio.currentTime < this.playTimeout) {
      this.playTimer = setTimeout(
        () => self.checkTimeout(),
        400
      );
    } else {
      self.nextTune();
    }
  }

  public async pauseTune() {
    await fadeOut();
  }

  public async nextTune() {
    if (this.shuffle) {
      this.moveToNextTune(this.randomTune(), 0);
    } else {
      if (this.anyTuneSelected()) {
        const playingIndex = this.currentTunes.findIndex(
          tune => tune === this.selectedTune
        );
        if (playingIndex === -1) {
          // If not found, the list has changed so pick any tune
          // in the new list
          this.moveToNextTune(
            this.randomBetween(0, this.currentTunes.length - 1),
            0
          );
        } else if (playingIndex < this.currentTunes.length - 1) {
          // More songs to play, so go to next
          this.moveToNextTune(playingIndex, +1);
        } else {
          // At last song, restart list
          this.moveToNextTune(0, 0);
        }
      }
    }
  }

  public async previousTune() {
    if (this.shuffle) {
      this.moveToNextTune(this.randomTune(), 0);
    } else {
      if (this.anyTuneSelected()) {
        const playingIndex = this.currentTunes.findIndex(
          tune => tune === this.selectedTune
        );
        if (playingIndex === -1) {
          // If not found, the list has changed so pick any tune
          // in the new list
          this.moveToNextTune(
            this.randomBetween(0, this.currentTunes.length - 1),
            0
          );
        } else if (playingIndex > 0) {
          this.moveToNextTune(playingIndex, -1);
        } else {
          this.moveToNextTune(this.currentTunes.length-1, 0);
        }
      }
    }
  }

  // Events:
  // select shuffle from PlayerControls
  public toggleShuffle() {
    this.shuffle = !this.shuffle;
  }

  // select timeout from PlayerControls
  public setPlayTimeout(seconds: number) {
    this.playTimeout = seconds;
  }

  // :click from TuneList
  // Expects a tune to be selected
  public async loadSelectedTuneAndPlay() {
    await fadeOut();
    this.loadSelectedTune();
    this.playSelectedTune();
  }

  // Internal functions
  private setUpShortkeys() {
    this.keyListener = (e: KeyboardEvent) => {
      e.preventDefault();
      switch (e.key) {
        case "p":
        case "ArrowLeft":
        case "BrowserBack":
          this.previousTune();
          break;
        case "n":
        case "ArrowRight":
        case "BrowserForward":
          this.nextTune();
          break;
        case " ":
        case "Enter":
          this.playOrPause();
          break;
        case "f":
          break;
        case "s":
          break;
        case "Unidentified":
        // Maybe "Menu" on Apple remote
      }
    };
    document.addEventListener("keydown", this.keyListener.bind(this));
  }

  private tearDownShortkeys() {
    document.removeEventListener("keydown", this.keyListener);
  }

  private anyTuneSelected(): boolean {
    return this.$store.state.selectedTune.file !== "";
  }

  private async moveToNextTune(playingIndex: number, direction: number) {
    const wasPlaying = this.playing;
    if (this.playing) await fadeOut();
    this.timePlayed = 0;
    const nextTuneToPlay = playingIndex + direction;
    this.$store.commit('selectTune', this.$store.getters.filteredTunes[nextTuneToPlay]);
    await this.loadSelectedTune();
    if (wasPlaying) await this.playSelectedTune();
  }

  // TODO: should we send in the index? We set the Vuex:selectedTune...
  // because we don't need the index in this function...
  // If not, this should be called loadSelectedSong()...
  private async loadSelectedTune() {
    const uri = (window as any).ipcRenderer.sendSync(
      "convertSongToUri",
      this.selectedTune.file
    );
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
    this.currentShufflePartition =
      this.currentShufflePartition % this.shufflePartitionCount;

    // Partition list of tunes into four sets of evenly distributed BPMs
    const tmin: TuneInfo = this.currentTunes.reduce(
      (t1: TuneInfo, t2: TuneInfo) => (t1.bpm! < t2.bpm! ? t1 : t2)
    );
    const tmax: TuneInfo = this.currentTunes.reduce(
      (t1: TuneInfo, t2: TuneInfo) => (t1.bpm! > t2.bpm! ? t1 : t2)
    );

    const bpmMin: number = tmin.bpm!;
    const bpmMax: number = tmax.bpm!;
    const bpmRange: number = bpmMax - bpmMin;
    const partitionSize: number = Math.floor(
      bpmRange / this.shufflePartitionCount
    );

    const partitionMin: number = bpmMin + currentPartition * partitionSize;
    const partitionMax: number = partitionMin + partitionSize;

    // Select a random tune in that partition
    const partition = this.currentTunes.filter(
      (t: TuneInfo) => t.bpm! >= partitionMin && t.bpm! <= partitionMax
    );
    const randomTune = partition[this.randomBetween(0, partition.length)];

    return this.currentTunes.findIndex(tune => tune.file === randomTune.file);
  }
}
</script>
