<template>
  <v-container>
    <PlayerControls @play-track="playTrack" @pause-track="pauseTrack"/>
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

let self: Player;

const fadeStep = 0.1;
const fadeTime = 100;
function fadeOut() {
  if (self.audio.volume > fadeStep) {
    self.audio.volume -= fadeStep;
    setTimeout(fadeOut, fadeTime);
  } else {
    self.audio.volume = 0;
    self.audio.pause();
  }
}
function fadeIn() {
  self.audio.play();
  if (self.audio.volume < 1 - fadeStep) {
    self.audio.volume += fadeStep;
    setTimeout(fadeIn, fadeTime);
  } else {
    self.audio.volume = 1;
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
  public timeTotal = 0;
  public audio = new Audio();

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
  }

  get currentTune() {
    if (this.tuneIndex < this.tunes.length) {
      return this.tunes[this.tuneIndex].file;
    } else {
      return undefined;
    }
  }

  public playTrack() {
    if (this.tunes.length === 0) {
      return;
    }
    if (!this.insideTune) {
      if (!this.tuneIndex) {
        this.tuneIndex = 0;
      }
      convertSongToUri(this.tunes[this.tuneIndex].file!).then(
        uri => {
          self.audio.src = uri;
          self.audio.load();
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
  }

  public pauseTrack() {
    fadeOut();
  }
}
</script>
