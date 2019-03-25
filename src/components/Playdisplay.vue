<template>
  <v-container fluid>
    <v-layout row justify-start>
      <v-flex xs3>
        <v-img height="30vh" width="30vh" :src="cover"/>
      </v-flex>
      <v-flex xs11>
        <v-layout column>
          <v-flex display-4>{{ title }}</v-flex>
          <v-spacer/>
          <v-flex>
            <v-layout row>
              <v-layout column align-content-space-between>
                <v-flex display-3>{{ artist }}</v-flex>
                <v-flex display-1>{{ album }}</v-flex>
                <v-flex display-1>{{ totaltime }}</v-flex>
              </v-layout>
              <v-flex display-4 style="text-align:right">{{ bpm }}</v-flex>
            </v-layout>
          </v-flex>
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
</script>

