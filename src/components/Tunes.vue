<template>
  <v-layout row scrollable>
    <v-flex xs12>
      <v-list two-line>
        <template v-for="(tune, index) in tunes">
          <v-list-tile :key="tune.file" :class="{'highlighted': currentTune == tune.file}">
            <v-list-tile-avatar>
              <img :src="tune.cover">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>{{ tune.title }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ tune.artist + " - " + tune.album }}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-spacer></v-spacer>
            {{ formatTime(tune.duration) }}
            <v-list-tile-action>
              <v-chip small>{{ tune.bpm }}</v-chip>
            </v-list-tile-action>
          </v-list-tile>

          <v-divider :key="index"/>
        </template>
      </v-list>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { TuneInfo } from "@/models/TuneInfo";

@Component
export default class Tunes extends Vue {
  @Prop({
    default: []
  })
  public tunes!: TuneInfo[];
  @Prop() public currentTune!: string;

  public formatTime(seconds: number) {
    // Hours, minutes and seconds
    const hrs = Math.round(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);

    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = "";

    if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
  }
}
</script>

<style>
.scrollable {
  overflow-y: scroll;
  height: calc(100vh - 250px);
}

.highlighted {
  background-color: red;
}
</style>
