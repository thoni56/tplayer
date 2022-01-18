<template>
  <v-app id="Application" dark>
    <Filtering
      @toggle-genre="toggleGenre"
      @sort-tunes="sortTunes"
      @change-bpm="changeBpm"
      @change-bpmRange="changeBpmRange"
      @load-files="initiateDiscoveringFiles"
    />
    <Player />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Filtering from "@/views/Filtering.vue";
import Player from "@/views/Player.vue";
import { TuneInfo } from "@/models/TuneInfo";

function getBPM(tune: TuneInfo) {
  return tune.bpm ? tune.bpm : 0;
}

Vue.config.productionTip = false;

@Component({
  components: {
    Filtering,
    Player
  }
})
export default class App extends Vue {
  private bpm: number = 0;
  private bpmRange: number = 5;

  get filteredTunes() {
    return this.$store.getters.filteredTunes;
  }

  get allTunes(): TuneInfo[] {
    return this.$store.state.allTunes;
  }

  get totalCount() {
    return this.$store.state.length;
  }

  get currentCount() {
    return this.$store.getters.filteredTunes.length;
  }

  get currentGenres() {
    return this.$store.state.genres;
  }

  public mounted() {
    (window as any).ipcRenderer.on("discoveredTunes", (event: any, newTunes: TuneInfo[]) => {
      this.addTunes(newTunes);
    });
    (window as any).ipcRenderer.on("clearTunes", (event: any, args: any[]) => {
      this.$store.commit('clear');
    });
  }

  private genreFilter(t: TuneInfo): boolean {
    return t.genre ? t.genre.some(g => this.currentGenres.includes(g)) : false;
  }

  private bpmFilter(t: TuneInfo): boolean {
    const result: boolean =
      this.bpm <= getBPM(t) && getBPM(t) <= this.bpm + this.bpmRange;
    return this.bpm === 0 || result;
  }

  private currentFilter(t: TuneInfo): boolean {
    return this.genreFilter(t) && this.bpmFilter(t);
  }

  private addTunes(tunes: TuneInfo[]) {
    this.allTunes.push(...tunes);
  }

  private toggleGenre(genre: string) {
    if (!this.currentGenres.includes(genre)) this.currentGenres.push(genre);
    else this.currentGenres.splice(this.currentGenres.indexOf(genre), 1);
  }

  private sortTunes() {
    this.$store.commit('flipSorting');
  }

  private changeBpm(bpm: number) {
    this.bpm = bpm;
  }

  private changeBpmRange(range: number) {
    this.bpmRange = range;
  }

  // Discover tunes over IPC
  private initiateDiscoveringFiles() {
    (window as any).ipcRenderer.send("discoverTunes");
  }
}
</script>

<style>
html {
  height: 100%;
  overflow: hidden;
}
</style>
