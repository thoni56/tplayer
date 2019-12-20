<template>
  <v-container id="player" fluid style="padding-top:0;">
    <v-layout column>
      <v-layout column>
        <v-layout>
          <TuneDisplay :tune="playingTune" />
        </v-layout>
        <v-layout>
          <Playbar
            :secondsPlayed="timePlayed"
            :secondsTotal="timeTotal"
            :playingTune="playingTune"
          />
        </v-layout>
      </v-layout>
    </v-layout>
    <v-layout column>
      <PlayerControls
        :playing="playing"
        @play-track="playTrack"
        @pause-track="pauseTrack"
        @next-track="nextTrack"
      />
      <TuneList
        :tunes="currentTunes"
        :playingTune="playingTune"
        :onClick="setTune"
        :onDblClick="setTuneAndPlay"
        style="height:30vh;"
      />
    </v-layout>
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
      self.nextTrack();
    });

    setTimeout(remainingTimer, 200);
  }

  // Public events
  public async playTrack() {
    if (this.currentTunes.length === 0) {
      return;
    }
    await fadeIn(); // async
  }

  public async pauseTrack() {
    await fadeOut(); // async
  }

  public async nextTrack() {
    if (this.playingTune.file !== "") {
      const playingIndex = this.currentTunes.findIndex(
        tune => tune === this.playingTune
      );
      if (playingIndex < this.currentTunes.length - 1) {
        const wasPlaying = this.playing;
        if (this.playing) await fadeOut();
        this.timePlayed = 0;
        await this.loadTune(playingIndex + 1);
        this.timeTotal = this.currentTunes[playingIndex].duration!;
        if (wasPlaying) await this.playTrack();
        await sleep(2000);
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
  public setTuneAndPlay(id: string) {
    this.setTune(id);
    this.playTrack();
  }

  // Internal functions
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
