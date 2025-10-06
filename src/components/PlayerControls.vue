<template>
    <v-toolbar>
        <v-btn-toggle>
            <v-btn 
                small 
                :color="isShuffling ? 'accent' : 'primary'" 
                class="text-none" 
                @click="toggleShuffle"
            >
                <v-icon>shuffle</v-icon>
            </v-btn>
        </v-btn-toggle>
        <v-spacer></v-spacer>
        <v-btn rounded medium color="primary" @click="previousTune">
            <v-icon>skip_previous</v-icon>
        </v-btn>
        <v-btn rounded small color="primary" @click="skipBackward"> -10 </v-btn>
        <v-btn rounded large color="primary" @click="playOrPause">
            <v-icon>{{ playOrPauseIcon }}</v-icon>
        </v-btn>
        <v-btn rounded small color="primary" @click="skipForward"> +10 </v-btn>
        <v-btn rounded medium color="primary" @click="nextTune">
            <v-icon>skip_next</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn-toggle v-model="playTimeModel" dense mandatory>
            <v-btn
                v-for="time in playTimes"
                :key="time"
                color="primary"
                class="text-none"
                small
                @click="playTimeChange(time)"
                >{{ time }}</v-btn
            >
        </v-btn-toggle>
    </v-toolbar>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class PlayerControls extends Vue {
    
    // All control methods now just dispatch to store - no complex logic!
    public playTimes: string[] = ['15s', '30s', '60s', '75s', '90s', '120s', 'All']
    public playTimeModel: number = this.playTimes.length - 1
    
    get playOrPauseIcon(): string {
        return this.isPlaying ? 'pause' : 'play_arrow'
    }
    
    get isPlaying(): boolean {
        return this.$store.getters['player/isPlaying']
    }
    
    get isShuffling(): boolean {
        return this.$store.getters['player/isShuffling']
    }

    // All these methods are now one-liners!
    async playOrPause() {
        await this.$store.dispatch('player/playOrPause')
    }

    async previousTune() {
        await this.$store.dispatch('player/previousTune')
    }

    async nextTune() {
        await this.$store.dispatch('player/nextTune')
    }

    async skipBackward() {
        await this.$store.dispatch('player/skipBackward')
    }

    async skipForward() {
        await this.$store.dispatch('player/skipForward')
    }

    async toggleShuffle() {
        await this.$store.dispatch('player/toggleShuffle')
    }

    public playTimeChange(time: string) {
        const s = Number(time.slice(0, -1)) // Convert to seconds unless "All", then NaN
        const seconds = !isNaN(s) ? s : 0
        this.$store.dispatch('player/setPlayTimeout', seconds)
    }
}
</script>
<style>
button.v-btn.v-btn--is-elevated.v-btn--has-bg.theme--dark.v-item--active {
    background-color: rgb(77, 11, 11) !important;
}
</style>
