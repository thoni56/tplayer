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
        console.log(err);
      }
    );
  }

  public pauseTrack() {
    audio.pause();
  }
}
</script>
