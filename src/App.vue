<template>
  <v-app id="Application" dark>
    <LoadingProgress />
    <Player />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Player from '@/views/Player.vue';
import { TuneInfo } from '@/models/TuneInfo';
import LoadingProgress from './views/LoadingProgress.vue';

Vue.config.productionTip = false;

@Component({
  components: {
    Player,
        LoadingProgress,
    },
})
export default class App extends Vue {
  get filteredTunes() {
    return this.$store.getters.filteredTunes;
  }

  public mounted() {
        window.api.on('clear-tunes', () => {
      this.$store.commit('CLEAR_TUNES');
      console.log('clear-tunes');
    });
        window.api.on('start-loading', () => {
      this.$store.commit('START_LOADING');
      console.log('start-loading');
    });
        window.api.on('discovered-tune', (newTune: TuneInfo) => {
      this.allTunes.push(newTune);
      console.log('discovered-tune');
    });
        window.api.on('discovered-tunes', (newTunes: TuneInfo[]) => {
      this.allTunes.push(...newTunes);
      this.$store.commit('FINISHED_LOADING');
      console.log('discovered-tunes');
    });
        window.api.on('progress', (progress: number) => {
      this.$store.commit('PROGRESS', progress);
      console.log('progress:' + progress);
    });
        window.api.on('finished-loading', () => {
      this.$store.commit('FINISHED_LOADING');
      console.log('finished-loading');
    });
    window.api.send('renderer-ready');
  }
}
</script>

<style>
html {
  height: 100vh;
  overflow: hidden;
}
</style>
