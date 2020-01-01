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
        />
        <TuneList
          :tunes="currentTunes"
          :playingTune="playingTune"
          :onClick="setTune"
          :onDblClick="setTuneAndPlay"
          style="height:32vh;"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from "vue-property-decorator";
import { TuneInfo } from "@/models/TuneInfo";
import TuneList from "@/components/TuneList.vue";
import TuneDisplay from "@/components/TuneDisplay.vue";
import PlayerControls from "@/components/PlayerControls.vue";
import Playbar from "@/components/Playbar.vue";

import { ipcRenderer } from "electron";

function sleep(millis: number): Promise<any> {
  return new Promise(resolve => setTimeout(resolve, millis));
}

let self: Player;

const fadeStep = 0.1;
const fadeTime = 50;
async function fadeOut() {
  while (audio.volume > fadeStep) {
    audio.volume -= fadeStep;
    await sleep(fadeTime);
  }
  audio.volume = 0;
  await audio.pause();
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

  public mounted() {
    self = this;
    audio.addEventListener("playing", () => {
      self.timeTotal = audio.duration;
    });
    audio.addEventListener("ended", () => {
      self.nextTune();
    });

    setTimeout(remainingTimer, 200);
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
    await fadeIn(); // async
  }

  public async pauseTune() {
    await fadeOut(); // async
  }

  public async nextTune() {
    if (this.anyTuneSelected()) {
      const playingIndex = this.currentTunes.findIndex(
        tune => tune === this.playingTune
      );
      if (playingIndex < this.currentTunes.length - 1) {
        this.moveToNextTune(playingIndex, +1);
      }
    }
  }

  public async previousTune() {
    if (this.anyTuneSelected()) {
      const playingIndex = this.currentTunes.findIndex(
        tune => tune === this.playingTune
      );
      if (playingIndex > 0) {
        this.moveToNextTune(playingIndex, -1);
      }
    }
  }

  // :onClick from TuneList
  public async setTune(id: string) {
    await fadeOut(); // async
    this.loadTune(this.currentTunes.findIndex(tune => tune.file === id));
    // This seems necessary to set the actual played time to zero
    await audio.play();
    await audio.pause();
  }

  // :onDblClick from TuneList
  public async setTuneAndPlay(id: string) {
    await fadeOut(); // async
    this.loadTune(this.currentTunes.findIndex(tune => tune.file === id));
    this.playTune();
  }

  // Internal functions
  private anyTuneSelected(): boolean {
    return this.playingTune.file !== "";
  }

  private async moveToNextTune(playingIndex: number, direction: number) {
    const wasPlaying = this.playing;
    if (this.playing) await fadeOut();
    this.timePlayed = 0;
    await this.loadTune(playingIndex + direction);
    this.timeTotal = this.currentTunes[playingIndex].duration!;
    if (wasPlaying) await this.playTune();
  }

  private async loadTune(index: number) {
    const uri = ipcRenderer.sendSync(
      "convertSongToUri",
      this.currentTunes[index].file
    );
    audio.src = uri;
    await audio.load();
    this.playing = false;
    this.playingTune = this.currentTunes[index];
    this.timePlayed = 0;
    this.timeTotal = audio.duration;
  }
}
</script>
