<template>
    <v-app id="Application" dark>
        <LoadingProgress />
        <Player />
    </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Player from '@/components/layout/Player.vue'
import LoadingProgress from '@/components/ui/LoadingProgress.vue'
import { TuneInfo } from '@/models/TuneInfo'

Vue.config.productionTip = false

@Component({
    components: {
        Player,
        LoadingProgress,
    },
})
export default class App extends Vue {
    
    get filteredTunes() {
        return this.$store.getters.filteredTunes
    }

    public mounted() {
        // Update IPC handlers to use new store structure
        window.api.on('clear-tunes', () => {
            this.$store.commit('tunes/CLEAR_TUNES')
            console.log('clear-tunes')
        })

        window.api.on('start-loading', () => {
            this.$store.commit('tunes/START_LOADING')
            console.log('start-loading')
        })

        window.api.on('discovered-tune', (newTune: TuneInfo) => {
            this.$store.dispatch('handleDiscoveredTune', newTune)
            console.log('discovered-tune')
        })

        window.api.on('discovered-tunes', (newTunes: TuneInfo[]) => {
            this.$store.dispatch('handleDiscoveredTunes', newTunes)
            console.log('discovered-tunes')
        })

        window.api.on('progress', (progress: number) => {
            this.$store.dispatch('handleProgress', progress)
            console.log('progress:' + progress)
        })

        window.api.on('finished-loading', () => {
            this.$store.commit('tunes/FINISHED_LOADING')
            console.log('finished-loading')
        })

        window.api.send('renderer-ready')
    }
}
</script>

<style>
html {
    height: 100vh;
    overflow: hidden;
}
</style>
