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
    <v-progress-linear height="5vh" :value="percent" style="padding:0;margin:0"/>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { formatTime } from "@/models/timeFormatter";

@Component
export default class Playbar extends Vue {
  @Prop() private secondsPlayed!: number;
  @Prop() private secondsTotal!: number;

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
