<template>
  <v-layout row scrollable>
    <v-flex xs12>
      <v-list two-line dense>
        <template v-for="(tune, index) in tunes">
          <v-list-tile :key="index" avatar>
            <v-list-tile-avatar tile>
              <img :src="tune.cover">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>{{ tune.title }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ tune.artist + " - " + tune.album }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
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
  @Prop({ default: [] })
  public tunes!: TuneInfo[];
}
</script>

<style>
.scrollable {
  overflow-y: scroll;
  height: calc(100vh - 250px);
}
</style>
