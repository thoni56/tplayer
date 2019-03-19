<template>
  <v-container>
    <h1>PLAYER</h1>
    <PlayerControls v-on:play-track="playTrack" @pause-track="pauseTrack"/>
    <Tunes :tunes="tunes" :currentTune="tunes[tuneIndex].file"/>
    <audio/>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { TuneInfo } from "@/models/TuneInfo";
import Tunes from "@/components/Tunes.vue";
import PlayerControls from "@/components/PlayerControls.vue";

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
    Tunes,
    PlayerControls
  }
})
export default class Player extends Vue {
  @Prop() public tunes!: TuneInfo[];

  private tuneIndex = 14;
  private insideTune = false;

  public playTrack() {
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
    let self = this;
    audio.addEventListener("ended", function() {
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
