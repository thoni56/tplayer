<template>
  <v-container fluid style="padding:0">
    <v-layout row align-start>
      <div>
        <img v-if="cover" :src="cover" style="object-fit:cover;height:25vh;width:25vh;">
        <div v-else style="object-fit:cover;height:25vh;width:25vh;"></div>
      </div>
      <div style="margin-left:1%;width:100%;">
        <div style="font-size:8vh;" class="overflow">{{ title }}</div>
        <div style="float:left;">
          <div style="font-size:4vh;" class="overflow">{{ artist }}</div>
          <div style="font-size:2vh;" class="overflow">{{ album + (track?" - #"+track:"") }}</div>
          <div style="font-size:2vh;">{{ totaltime }}</div>
        </div>
        <div style="font-size:10vh;text-align:right;">{{ bpm }}</div>
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
export default class TuneDisplay extends Vue {
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

  get track() {
    return this.tune ? this.tune.track : undefined;
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
}

.overflow-scroll {
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: clip;
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
