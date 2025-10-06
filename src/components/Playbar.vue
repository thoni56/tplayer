<template>
    <v-layout column style="padding: 0">
        <v-layout justify-space-between style="padding: 0">
            <v-container style="padding: 0px">
                <div style="text-align: left; font-size: 3vh">{{ timePlayed }}</div>
            </v-container>
            <v-container style="padding: 0px">
                <div style="text-align: center; font-size: 3vh">{{ timeTotal }}</div>
            </v-container>
            <v-container style="padding: 0px">
                <div style="text-align: right; font-size: 3vh">{{ timeRemaining }}</div>
            </v-container>
        </v-layout>
        <v-progress-linear height="5vh" :value="percent" style="padding: 0; margin: 0">
            <span class="overflow" style="padding-left: 1vh; font-size: 3.5vh">{{
                playingTitle
            }}</span>
            <span
                class="overflow"
                v-if="playingArtist != ''"
                style="font-style: italic; padding-left: 1vh; font-size: 3vh"
                >- {{ playingArtist }}</span
            >
        </v-progress-linear>
    </v-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { formatTime } from '@/models/timeFormatter'

@Component
export default class Playbar extends Vue {
    
    // All data now comes from the store - no props needed!
    get percent(): number {
        return this.$store.getters['player/playbackProgress']
    }

    get timePlayed(): string {
        const time = this.$store.getters['player/currentTime']
        return formatTime(time)
    }

    get timeTotal(): string {
        const time = this.$store.getters['player/totalTime']
        return formatTime(time)
    }

    get timeRemaining(): string {
        const time = this.$store.getters['player/remainingTime']
        return '-' + formatTime(time)
    }

    get playingTitle(): string {
        return this.$store.state.tunes.selectedTune.title || ''
    }

    get playingArtist(): string {
        return this.$store.state.tunes.selectedTune.artist || ''
    }
}
</script>
