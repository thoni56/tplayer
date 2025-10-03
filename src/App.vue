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
        // Update IPC handlers to use new store structure
        window.api.on('clear-tunes', () => {
            this.$store.commit('tunes/CLEAR_TUNES'); // Namespaced mutation
            console.log('clear-tunes');
        });
        window.api.on('start-loading', () => {
            this.$store.commit('tunes/START_LOADING'); // Namespaced mutation
            console.log('start-loading');
        });
        window.api.on('discovered-tune', (newTune: TuneInfo) => {
            this.$store.dispatch('handleDiscoveredTune', newTune); // Root action
            console.log('discovered-tune');
        });
        window.api.on('discovered-tunes', (newTunes: TuneInfo[]) => {
            this.$store.dispatch('handleDiscoveredTunes', newTunes); // Root action
            console.log('discovered-tunes');
        });
        window.api.on('progress', (progress: number) => {
            this.$store.dispatch('handleProgress', progress); // Root action
            console.log('progress:' + progress);
        });
        window.api.on('finished-loading', () => {
            this.$store.commit('tunes/FINISHED_LOADING'); // Namespaced mutation
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
