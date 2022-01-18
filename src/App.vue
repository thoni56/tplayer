<template>
  <v-app id="Application" dark>
    <Filtering
      @toggle-genre="toggleGenre"
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

  get filteredTunes() {
    return this.$store.getters.filteredTunes;
  }

  get allTunes(): TuneInfo[] {
    return this.$store.state.allTunes;
  }

  get currentGenres() {
    return this.$store.state.selectedGenres;
  }

  public mounted() {
    (window as any).ipcRenderer.on("discoveredTunes", (event: any, newTunes: TuneInfo[]) => {
      this.addTunes(newTunes);
    });
    (window as any).ipcRenderer.on("clearTunes", (event: any, args: any[]) => {
      this.$store.commit('clear');
    });
  }

  private addTunes(tunes: TuneInfo[]) {
    this.allTunes.push(...tunes);
  }

  private toggleGenre(genre: string) {
    if (!this.currentGenres.includes(genre)) this.currentGenres.push(genre);
    else this.currentGenres.splice(this.currentGenres.indexOf(genre), 1);
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
