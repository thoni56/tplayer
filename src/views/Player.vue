<template>
  <v-container>
    <h1>PLAYER</h1>
    <PlayerControls v-on:play-track="playTrack" @pause-track="pauseTrack"/>
    <Tunes :tunes="tunes"/>
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

  public playTrack() {
    convertSongToUri(this.tunes[0].file!).then(
      uri => {
        audio.src = uri;
        audio.load();
        audio.play();
      },
      err => {
        // tslint:disable-next-line:no-console
        console.log(err);
      }
    );
  }

  public pauseTrack() {
    fadeOut();
  }
}
</script>
