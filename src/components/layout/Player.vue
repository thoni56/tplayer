<template>
    <v-container id="player" fluid style="padding-top: 0">
        <v-row>
            <v-col class="pt-0">
                <Filtering
                    @remove-hotkey-listener="disableHotkeys"
                    @install-hotkey-listener="enableHotkeys"
                />
                <TuneDisplay />
                <Playbar />
                <PlayerControls />
                <TuneList />
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Filtering from '@/components/controls/Filtering.vue'
import TuneList from '@/components/display/TuneList.vue'
import TuneDisplay from '@/components/display/TuneDisplay.vue'
import PlayerControls from '@/components/controls/PlayerControls.vue'
import Playbar from '@/components/display/Playbar.vue'

@Component({
    components: {
        Filtering,
        TuneDisplay,
        PlayerControls,
        Playbar,
        TuneList,
    },
})
export default class Player extends Vue {
    
    public mounted() {
        // Initialize player module
        this.$store.dispatch('player/initialize')
        
        // Set up global hotkey listener
        // Use keydown with capture phase to handle keys before any child components
        document.addEventListener('keydown', this.handleKeyPress, true)
    }

    public beforeDestroyed() {
        // Cleanup player module
        this.$store.dispatch('player/cleanup')
        document.removeEventListener('keydown', this.handleKeyPress, true)
    }

    // Hotkey handling - delegates to store
    private async handleKeyPress(event: KeyboardEvent) {
        await this.$store.dispatch('hotkeys/handleKeyPress', event)
    }
    
    // Hotkey enable/disable for text inputs
    public async disableHotkeys() {
        await this.$store.dispatch('hotkeys/disable')
    }

    public async enableHotkeys() {
        await this.$store.dispatch('hotkeys/enable')
    }
}
</script>
