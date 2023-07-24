<template>
  <v-app id="Application" dark>
    <LoadingProgress />
    <Player />
  </v-app>
</template>

<script lang="ts">
import {
  Component,
  Vue
} from "vue-property-decorator";
import Player from "@/views/Player.vue";
import {
  TuneInfo
} from "@/models/TuneInfo";
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
    (window as any).api.on("clearTunes", () => {
      this.$store.commit('CLEAR_TUNES');
      console.log('clear-tunes');
    });
    (window as any).api.on("startLoading", () => {
      this.$store.commit('START_LOADING');
      console.log('start-loading');
    });
    (window as any).api.on("discoveredTune", (newTune: TuneInfo) => {
      this.allTunes.push(newTune);
      console.log('discoverd-tune');
    });
    (window as any).api.on("discoveredTunes", (newTunes: TuneInfo[]) => {
      this.allTunes.push(...newTunes);
      this.$store.commit('FINISHED_LOADING');
      console.log('discovered-tunes');
    });
    (window as any).api.on("progress", (progress: number) => {
      this.$store.commit('PROGRESS', progress);
      console.log('progress:' + progress);
    });
    (window as any).api.on("finishedLoading", () => {
      this.$store.commit('FINISHED_LOADING');
      console.log('finished-loading');
    });
    (window as any).api.send('renderer-ready');
  }
}
</script>

<style>
html {
  height: 100vh;
  overflow: hidden;
}
</style>
