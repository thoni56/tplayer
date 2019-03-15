<template>
  <v-app id="inspire" dark>
    <v-navigation-drawer v-model="drawer" clipped fixed app>
      <v-list dense>
        <v-list-tile v-for="link in links" :key="link.text" router :to="link.route">
          <v-list-tile-action>
            <v-icon>{{ link.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ link.text }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app fixed clipped-left>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>tplayer</v-toolbar-title>
    </v-toolbar>
    <v-content>
      <v-container>
        <router-view :tunes="current_tunes"/>
      </v-container>
    </v-content>
    <v-footer app fixed></v-footer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { EventBus } from "@/EventBus";
import { remote } from "electron";
import { TuneInfo } from "./models/TuneInfo";
import walk from "walkdir";
import * as mm from "music-metadata";

Vue.config.productionTip = false;

const fs = remote.require("walkdir");

function info(field: any): any {
  return field ? field : "unknown";
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pause() {
  await sleep(200);
}

export const allTunes: TuneInfo[] = [];
// Load all music files
const emitter = walk("C:/Users/Thomas/Music/iTunes/iTunes Media/Music");
emitter.on("file", (path: string) => {
  mm.parseFile(path).then(metadata => {
    allTunes.push(
      new TuneInfo(
        info(metadata.common.title),
        info(metadata.common.artist),
        info(metadata.common.album),
        info(metadata.common.genre),
        info(metadata.common.bpm),
        metadata.common.picture ? metadata.common.picture[0] : undefined
      )
    );
  });
});

@Component
export default class App extends Vue {
  public drawer = false;
  public links = [
    { icon: "play_arrow", text: "Player", route: "/" },
    { icon: "filter_list", text: "Filter", route: "/filtering" },
    { icon: "settings", text: "Settings", route: "/settings" }
  ];

  public data() {
    return {
      current_tunes: allTunes
    };
  }
}
</script>
