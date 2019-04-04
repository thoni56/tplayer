<template>
  <v-app id="Application" dark>
    <Filtering
      :totalCount="totalCount"
      :currentCount="currentTunes.length"
      @toggle-genre="toggleGenre"
    />
    <Player :currentTunes="currentTunes"/>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import Filtering from "@/views/Filtering.vue";
import Player from "@/views/Player.vue";
import { TuneInfo } from "@/models/TuneInfo";
import { loadTunes } from "@/components/TuneFinder.vue";

Vue.config.productionTip = false;

@Component({ components: { Filtering, Player } })
export default class App extends Vue {
  public drawer = false;
  public links = [
    { icon: "play_arrow", text: "Player", route: "/" },
    { icon: "filter_list", text: "Filter", route: "/filtering" },
    { icon: "settings", text: "Settings", route: "/settings" }
  ];

  private genres: string[] = [];
  private allTunes: TuneInfo[] = [];

  get totalCount() {
    return this.allTunes.length;
  }

  get currentTunes() {
    return this.allTunes ? this.allTunes.filter(this.currentFilter) : [];
  }

  public mounted() {
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
