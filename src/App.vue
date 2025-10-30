<template>
    <v-app id="Application" dark>
        <DiscoveryProgress />
        <Player />
    </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Player from '@/components/layout/Player.vue'
import DiscoveryProgress from '@/components/ui/DiscoveryProgress.vue'
import { TuneInfo } from '@/models/TuneInfo'

Vue.config.productionTip = false

@Component({
    components: {
        Player,
        DiscoveryProgress,
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

        window.api.on('start-discovery', () => {
            this.$store.commit('tunes/START_DISCOVERY')
            console.log('start-discovery')
        })

        window.api.on('tune-available', (newTune: TuneInfo) => {
            this.$store.dispatch('handleAvailableTune', newTune)
            console.log('tune-available')
        })

        window.api.on('tunes-available', (newTunes: TuneInfo[]) => {
            this.$store.dispatch('handleAvailableTunes', newTunes)
            console.log('tunes-available')
        })

        window.api.on('discovery-progress', (progress: number) => {
            this.$store.dispatch('handleDiscoveryProgress', progress)
            console.log('discovery-progress:' + progress)
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
