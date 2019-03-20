<template>
  <div>
    <v-layout justify-space-between>
      <v-container style="padding-left:0px; padding-bottom:0px;">
        <div style="text-align:left">{{timePlayed}}</div>
      </v-container>
      <v-container style="padding-right:0px; padding-bottom:0px;">
        <div style="text-align:right">{{timeTotal}}</div>
      </v-container>
    </v-layout>
    <v-progress-linear height="40" :value="percent"/>
  </div>
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

  get percent() {
    return (this.secondsPlayed / this.secondsTotal) * 100;
  }
}
</script>
