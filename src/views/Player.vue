<template>
  <v-container>
    <PlayerControls v-on:play-track="playTrack" @pause-track="pauseTrack"/>
    <Playbar :secondsPlayed="timePlayed" :secondsTotal="timeTotal"/>
    <Tunes :tunes="tunes" :currentTune="currentTune"/>
    <audio/>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { TuneInfo } from "@/models/TuneInfo";
import Tunes from "@/components/Tunes.vue";
import PlayerControls from "@/components/PlayerControls.vue";
import Playbar from "@/components/Playbar.vue";

import { remote } from "electron";
import fs from "fs";
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

const audio = new Audio();

const fadeStep = 0.1;
const fadeTime = 100;
function fadeOut() {
  if (audio.volume > fadeStep) {
    audio.volume -= fadeStep;
    setTimeout(fadeOut, fadeTime);
  } else {
    audio.volume = 0;
    audio.pause();
  }
}
function fadeIn() {
  audio.play();
  if (audio.volume < 1 - fadeStep) {
    audio.volume += fadeStep;
    setTimeout(fadeIn, fadeTime);
  } else {
    audio.volume = 1;
  }
}

@Component({
  components: {
    PlayerControls,
    Playbar,
    Tunes
  }
})
export default class Player extends Vue {
  @Prop() public tunes!: TuneInfo[];

  public tuneIndex = 14;
  public insideTune = false;
  public timePlayed = 0;
  public timeTotal = 234;

  get currentTune() {
    if (this.tuneIndex < this.tunes.length)
      return this.tunes[this.tuneIndex].file;
    else return undefined;
  }

  public playTrack() {
    if (this.tunes.length == 0) return;
    if (!this.insideTune) {
      convertSongToUri(this.tunes[this.tuneIndex].file!).then(
        uri => {
          audio.src = uri;
          audio.load();
          fadeIn();
          this.insideTune = true;
        },
        err => {
          // tslint:disable-next-line:no-console
          console.log(err);
        }
      );
    } else {
      fadeIn();
    }
    // TODO: This should be in mounted()?
    const self = this;
    audio.addEventListener("ended", () => {
      // tslint:disable-next-line:no-console
      console.log("ended");
      self.insideTune = false;
      self.tuneIndex++;
      if (self.tuneIndex <= self.tunes.length) {
        self.playTrack();
      }
    });
  }

  public pauseTrack() {
    fadeOut();
  }
}
</script>
