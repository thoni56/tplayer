<template>
  <v-container fluid style="padding:0;">
    <div style="width: 100%;">
      <div style="float:left;">
        <img style="height:35vh;width:35vh;" :src="cover">
      </div>
      <div style="float:left;margin-left:20px;">
        <div class="display-4 clipped">{{ title }}</div>
        <div style="float:left;">
          <div class="display-3 clipped">{{ artist }}</div>
          <div class="display-1 clipped">{{ album }}</div>
          <div class="display-1">{{ totaltime }}</div>
        </div>
        <div class="display-4 right" style="vertical-align: bottom;">{{ bpm }}</div>
      </div>
    </div>
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
</script>

<style>
.clipped {
  white-space: nowrap;
  text-overflow: clip;
  overflow-x: hidden;
  padding-bottom: 250px;
  margin-bottom: -250px;
}
</style>
