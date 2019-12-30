<template>
  <v-app id="Application" dark>
    <Filtering
      :totalCount="totalCount"
      :currentCount="currentTunes.length"
      :sortingUp="sortingUp"
      @toggle-genre="toggleGenre"
      @sort-tunes="sortTunes"
      @change-bpm="changeBpm"
      @change-bpmRange="changeBpmRange"
    />
    <Player :currentTunes="currentTunes" />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import Filtering from "@/views/Filtering.vue";
import Player from "@/views/Player.vue";
import { TuneInfo } from "@/models/TuneInfo";
import { ipcRenderer } from "electron";

function getBPM(tune: TuneInfo) {
  return tune.bpm ? tune.bpm : 0;
}

Vue.config.productionTip = false;

@Component({ components: { Filtering, Player } })
export default class App extends Vue {
  private genres: string[] = [];
  private allTunes: TuneInfo[] = [];
  private sortingUp: boolean = true;
  private bpm: number = 0;
  private bpmRange: number = 5;

  public mounted() {
    const self = this;

    // Discover tunes over IPC
    ipcRenderer.on("discoveredTunes", (event: any, tunes: TuneInfo[]) => {
      self.addTunes(tunes);
    });
    ipcRenderer.send("discoverTunes");
  }

  get totalCount() {
    return this.allTunes.length;
  }

  get currentTunes() {
    const filteredTunes = this.allTunes
      ? this.allTunes.filter(this.currentFilter)
      : [];
    if (this.sortingUp) {
      return filteredTunes.sort((t1, t2) => {
        return getBPM(t1) - getBPM(t2);
      });
    } else {
      return filteredTunes.sort((t1, t2) => {
        return getBPM(t2) - getBPM(t1);
      });
    }
    this.sortingUp = !this.sortingUp;
  }

  private genreFilter(t: TuneInfo): boolean {
    return t.genre ? t.genre.some(g => this.genres.includes(g)) : false;
  }

  private bpmFilter(t: TuneInfo): boolean {
    const result: boolean =
      this.bpm - this.bpmRange < getBPM(t) &&
      getBPM(t) < this.bpm + this.bpmRange;
    return this.bpm === 0 || result;
  }

  private currentFilter(t: TuneInfo): boolean {
    return this.genreFilter(t) && this.bpmFilter(t);
  }

  private addTunes(tunes: TuneInfo[]) {
    this.allTunes.push(...tunes);
  }

  private toggleGenre(genre: string) {
    if (!this.genres.includes(genre)) this.genres.push(genre);
    else this.genres.splice(this.genres.indexOf(genre), 1);
  }

  private sortTunes() {
    this.sortingUp = !this.sortingUp;
  }

  private changeBpm(bpm: number) {
    this.bpm = bpm;
  }

  private changeBpmRange(range: number) {
    this.bpmRange = range;
  }
}
</script>
<style>
html {
  overflow: hidden;
}
</style>
