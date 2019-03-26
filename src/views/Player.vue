<template>
  <v-container id="player" fluid>
    <v-layout column>
      <v-layout column>
        <v-layout>
          <Playdisplay :tune="tunes[tuneIndex]"/>
        </v-layout>
        <v-layout>
          <Playbar :secondsPlayed="timePlayed" :secondsTotal="timeTotal"/>
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
      <Tunes :tunes="tunes" :currentTune="currentTune" :onClick="setTune"/>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { TuneInfo } from "@/models/TuneInfo";
import Tunes from "@/components/Tunes.vue";
import Playdisplay from "@/components/Playdisplay.vue";
import PlayerControls from "@/components/PlayerControls.vue";
import Playbar from "@/components/Playbar.vue";

import { remote } from "electron";
import fs from "fs";
import { setTimeout } from "timers";
const dataurl = remote.require("dataurl");

async function convertSongToUri(filePath: string): Promise<string> {
  const songPromise = new Promise<string>((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(dataurl.convert({ data, mimetype: "audio/mp3" }));
    });
  });
  return await songPromise;
}

let self: Player;

const fadeStep = 0.1;
const fadeTime = 100;
async function stopPlaying() {
  // if (self.audio.volume > fadeStep) {
  //   self.audio.volume -= fadeStep;
  //   setTimeout(stopPlaying, fadeTime);
  // } else {
  //   self.audio.volume = 0;
  await self.audio.pause();
  // }
  self.playing = false;
}

async function startPlaying() {
  await self.audio.play();
  // if (self.audio.volume < 1 - fadeStep) {
  //   self.audio.volume += fadeStep;
  //   setTimeout(startPlaying, fadeTime);
  // } else {
  //   self.audio.volume = 1;
  // }
  self.playing = true;
}

function remainingTimer() {
  self.timePlayed = self.audio.currentTime;
  setTimeout(remainingTimer, 200);
}

@Component({
  components: {
    Playdisplay,
    PlayerControls,
    Playbar,
    Tunes
  }
})
export default class Player extends Vue {
  @Prop() public tunes!: TuneInfo[];

  public playing = false;
  public tuneIndex = 2;
  public insideTune = false;
  public timePlayed = 0;
  public timeTotal = 0;
  public audio = new Audio();
  private tuneLoaded = false;

  public mounted() {
    self = this;
    this.audio.addEventListener("playing", () => {
      self.timeTotal = self.audio.duration;
    });
    this.audio.addEventListener("ended", () => {
      self.insideTune = false;
      self.tuneIndex++;
      if (self.tuneIndex <= self.tunes.length) {
        self.playTrack();
      }
    });

    setTimeout(remainingTimer, 200);
  }

  // UI functions
  get currentTune() {
    if (this.tuneIndex < this.tunes.length) {
      return this.tunes[this.tuneIndex].file;
    } else {
      return undefined;
    }
  }

  // Public events
  public async playTrack() {
    if (this.tunes.length === 0) {
      return;
    }
    if (!this.insideTune) {
      await this.loadTune(this.tuneIndex);
    }
    startPlaying();
  }

  public pauseTrack() {
    stopPlaying();
  }

  public async nextTrack() {
    if (this.tuneIndex <= this.tunes.length - 1) {
      const wasPlaying = this.playing;
      if (this.playing) {
        stopPlaying();
      }
      this.tuneIndex++;
      await this.loadTune(this.tuneIndex);
      if (wasPlaying) startPlaying();
    }
  }

  public setTune(id: string) {
    this.loadTune(this.tunes.findIndex(tune => tune.file == id));
  }

  // Internal functions
  private async loadTune(index: number) {
    const uri = await convertSongToUri(this.tunes[index].file!);
    self.audio.src = uri;
    await self.audio.load();
    this.insideTune = true;
    this.tuneIndex = index;
    this.tuneLoaded = true;
    this.playing = false;
  }
}
</script>
