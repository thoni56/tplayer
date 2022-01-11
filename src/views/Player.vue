<template>
  <v-container id="player" fluid style="padding-top:0;">
    <v-row>
      <v-col class="pt-0">
        <TuneDisplay :tune="playingTune" />
        <Playbar :secondsPlayed="timePlayed" :secondsTotal="timeTotal" :playingTune="playingTune" />
        <PlayerControls
          :playing="playing"
          @previous-tune="previousTune"
          @play-pause="playOrPause"
          @next-tune="nextTune"
          @play-timeout="setPlayTimeout"
          @shuffle-tunes-toggle="toggleShuffle"
        />
        <TuneList
          :tunes="currentTunes"
          :playingTune="playingTune"
          :onClick="setTune"
          :onDblClick="setTuneAndPlay"
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

function remainingTimer() {
  self.timePlayed = audio.currentTime;
  setTimeout(remainingTimer, 200);
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
  @Prop() public currentTunes!: TuneInfo[];

  public playing = false;
  public timePlayed = 0;
  public timeTotal = 0;
  public playingTune: TuneInfo = new TuneInfo("");
  private keyListener: any;

  private playTimeout: number = 0;
  private playTimer!: ReturnType<typeof setTimeout>;

  private shuffle: boolean = false;
  private currentShufflePartition: number = 0;
  private shufflePartitionCount: number = 4;

  public mounted() {
    self = this;
    audio.addEventListener("playing", () => {
      self.timeTotal = audio.duration;
    });
    audio.addEventListener("ended", () => {
      self.nextTune();
    });

    setTimeout(remainingTimer, 200);
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
      this.playTune();
    }
  }

  public async playTune() {
    if (this.currentTunes.length === 0) {
      return;
    }
    // If no tune selected we should pick any song in the list and play
    if (!this.anyTuneSelected()) {
      this.loadTune(this.randomBetween(0, this.currentTunes.length));
    }
    await fadeIn(); // async

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
        1000
      );
    } else {
      self.nextTune();
    }

  }

  public async pauseTune() {
    await fadeOut(); // async
  }

  public async nextTune() {
    if (this.shuffle) {
      this.moveToNextTune(this.randomTune(), 0);
    } else {
      if (this.anyTuneSelected()) {
        const playingIndex = this.currentTunes.findIndex(
          tune => tune === this.playingTune
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
          tune => tune === this.playingTune
        );
        if (playingIndex > 0) {
          this.moveToNextTune(playingIndex, -1);
        }
      }
    }
  }

  public toggleShuffle() {
    this.shuffle = !this.shuffle;
  }

  // :onClick from TuneList
  public async setTune(id: string) {
    await fadeOut(); // async
    this.loadTune(this.currentTunes.findIndex(tune => tune.file === id));
    // This seems necessary to set the actual played time to zero
    await audio.play();
    audio.pause();
  }

  // :onDblClick from TuneList
  public async setTuneAndPlay(id: string) {
    await fadeOut(); // async
    this.loadTune(this.currentTunes.findIndex(tune => tune.file === id));
    this.playTune();
  }

  public setPlayTimeout(seconds: number) {
    this.playTimeout = seconds;
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
    return this.playingTune.file !== "";
  }

  private async moveToNextTune(playingIndex: number, direction: number) {
    const wasPlaying = this.playing;
    if (this.playing) await fadeOut();
    this.timePlayed = 0;
    const nextTuneToPlay = playingIndex + direction;
    await this.loadTune(nextTuneToPlay);
    this.timeTotal = this.currentTunes[nextTuneToPlay].duration!;
    if (wasPlaying) await this.playTune();
  }

  private async loadTune(index: number) {
    const uri = (window as any).ipcRenderer.sendSync(
      "convertSongToUri",
      this.currentTunes[index].file
    );
    audio.src = uri;
    audio.load();
    this.playing = false;
    this.playingTune = this.currentTunes[index];
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
