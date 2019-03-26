<template>
  <v-container fluid style="padding:0">
    <v-layout row align-start>
      <v-flex xs2>
        <v-img :src="cover" style="object-fit:cover;height:100%;width:100%;"/>
      </v-flex>
      <v-flex xs10 style="margin-left:1%">
        <v-layout column align-content-space-between>
          <v-layout row>
            <div class="display-4 overflow-scroll">{{ title }}</div>
          </v-layout>
          <v-layout row>
            <v-layout column align-content-space-between>
              <div class="display-3 overflow-scroll">{{ artist }}</div>
              <div class="display-1 overflow-scroll">{{ album }}</div>
              <div class="display-1">{{ totaltime }}</div>
            </v-layout>
            <v-layout display-4 justify-end>{{ bpm }}</v-layout>
          </v-layout>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { TuneInfo } from "@/models/TuneInfo";
import { formatTime } from "@/models/timeFormatter";

@Component
export default class Playdisplay extends Vue {
  @Prop() private tune!: TuneInfo;

  get cover() {
    return this.tune ? this.tune.cover : "";
  }

  get title() {
    return this.tune ? this.tune.title : "";
  }

  get artist() {
    return this.tune ? this.tune.artist : "";
  }

  get album() {
    return this.tune ? this.tune.album : "";
  }

  get bpm() {
    return this.tune ? this.tune.bpm : undefined;
  }

  get totaltime() {
    return this.tune ? formatTime(this.tune.duration!) : undefined;
  }
}

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}
</script>

<style>
.overflow-scroll {
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: clip;
  padding-bottom: 250px;
  margin-bottom: -250px;
  /*animation: scrolling 20s linear infinite;*/
}

@keyframes scrolling {
  0% {
    transform: translateX(0%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
