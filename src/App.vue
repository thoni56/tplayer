<template>
  <v-app id="Application" dark>
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
      <v-container fluid>
        <router-view :currentTunes="currentTunes" :total="totalCount" @toggle-genre="toggleGenre"/>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { TuneInfo } from "@/models/TuneInfo";
import { loadTunes } from "@/components/TuneFinder.vue";

Vue.config.productionTip = false;

@Component
export default class App extends Vue {
  public drawer = false;
  public links = [
    { icon: "play_arrow", text: "Player", route: "/" },
    { icon: "filter_list", text: "Filter", route: "/filtering" },
    { icon: "settings", text: "Settings", route: "/settings" }
  ];

  private genres = [];
  private allTunes: TuneInfo[] = [];

  get totalCount() {
    return this.allTunes.length;
  }

  get currentTunes() {
    return this.allTunes ? this.allTunes.filter(this.currentFilter) : [];
  }

  constructor() {
    super();
    loadTunes(this.tunesLoaded);
  }

  private currentFilter(t: TuneInfo): boolean {
    return t.genre ? t.genre.some(g => this.genres.includes(g)) : false;
  }

  private tunesLoaded(tunes: TuneInfo[]) {
    this.allTunes.push(...tunes);
  }

  private toggleGenre(genre: string) {
    if (!this.genres.includes(genre)) this.genres.push(genre);
    else this.genres.splice(this.genres.indexOf(genre), 1);
  }
}
</script>
<style>
html {
  overflow: hidden;
}
</style>
