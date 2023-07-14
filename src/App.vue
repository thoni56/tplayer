<template>
  <v-app id="Application" dark>
    <LoadingProgress />
    <Player />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Player from "@/views/Player.vue";
import { TuneInfo } from "@/models/TuneInfo";
import LoadingProgress from "./views/LoadingProgress.vue";

Vue.config.productionTip = false;

@Component({
  components: {
    Player,
    LoadingProgress
  }
})
export default class App extends Vue {

  get filteredTunes() {
    return this.$store.getters.filteredTunes;
  }

  get allTunes(): TuneInfo[] {
    return this.$store.state.allTunes;
  }

  public mounted() {
    (window as any).ipcRenderer.on("discoveredTunes", (event: any, newTunes: TuneInfo[]) => {
      this.addTunes(newTunes);
      this.$store.commit('FINISHED_LOADING');
    });
    (window as any).ipcRenderer.on("clearTunes", (event: any, args: any[]) => {
      this.$store.commit('CLEAR');
    });
  }

  private addTunes(tunes: TuneInfo[]) {
    this.allTunes.push(...tunes);
  }

}
</script>

<style>
html {
  height: 100vh;
  overflow: hidden;
}
</style>
