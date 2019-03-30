<template>
  <v-container fluid style="padding:0">
    <v-layout row align-start>
      <div>
        <img :src="cover" style="object-fit:cover;height:30vh;width:30vh;">
      </div>
      <div style="margin-left:1%;">
        <div style="font-size:9vh;" class="overflow">{{ title }}</div>
        <div>
          <div style="font-size:5vh;">{{ artist }}</div>
          <div style="font-size:3vh;">{{ album }}</div>
          <div style="font-size:3vh;">{{ totaltime }}</div>
        </div>
      </div>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { VueResizeText } from "vue-resize-text";
import { TuneInfo } from "@/models/TuneInfo";
import { formatTime } from "@/models/timeFormatter";

@Component
export default class Tunedisplay extends Vue {
  @Prop() private tune!: TuneInfo;

  get cover() {
    return this.tune ? this.tune.cover : undefined;
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
.overflow {
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: clip;
  padding-bottom: 250px;
  margin-bottom: -250px;
}

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
