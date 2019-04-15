<template>
  <v-layout column style="padding:0;">
    <v-layout justify-space-between style="padding:0;">
      <v-container style="padding:0px;">
        <div style="text-align:left;font-size:3vh;">{{timePlayed}}</div>
      </v-container>
      <v-container style="padding:0px;">
        <div style="text-align:center;font-size:3vh;">{{timeTotal}}</div>
      </v-container>
      <v-container style="padding:0px;">
        <div style="text-align:right;font-size:3vh;">{{timeRemaining}}</div>
      </v-container>
    </v-layout>
    <v-progress-linear height="5vh" :value="percent" style="padding:0;margin:0">
      <span style="padding-left:1vh;font-size:3.5vh;">{{playingTitle}}</span>
      <span
        v-if="playingArtist!=''"
        style="font-style:italic;padding-left:1vh;font-size:3vh;"
      >- {{playingArtist}}</span>
    </v-progress-linear>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { formatTime } from "@/models/timeFormatter";
import { TuneInfo } from "@/models/TuneInfo";

@Component
export default class Playbar extends Vue {
  @Prop() private secondsPlayed!: number;
  @Prop() private secondsTotal!: number;
  @Prop() private playingTune!: TuneInfo;

  get playingTitle() {
    return this.playingTune
      ? this.playingTune.title
        ? this.playingTune.title
        : ""
      : "";
  }

  get playingArtist() {
    return this.playingTune
      ? this.playingTune.artist
        ? this.playingTune.artist
        : ""
      : "";
  }

  get timePlayed() {
    return formatTime(this.secondsPlayed);
  }

  get timeTotal() {
    return formatTime(this.secondsTotal);
  }

  get timeRemaining() {
    return "-" + formatTime(this.secondsTotal - this.secondsPlayed);
  }

  get percent() {
    return (this.secondsPlayed / this.secondsTotal) * 100;
  }
}
</script>
