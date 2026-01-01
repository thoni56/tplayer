<template>
    <v-container fluid>
        <v-layout align-start>
            <div>
                <v-tooltip right>
                    <template v-slot:activator="{ on, attrs }">
                        <img
                            v-bind="attrs"
                            v-on="on"
                            v-if="cover"
                            :src="cover"
                            style="object-fit: cover; height: 40vh; width: 40vh; border-radius: 5%"
                        />
                        <div v-else style="object-fit: cover; height: 40vh; width: 40vh"></div>
                    </template>
                    <span v-html="tuneHoverText"></span>
                </v-tooltip>
            </div>
            <div style="margin-left: 1%; width: 100%">
                <div style="font-size: 8vh" class="overflow">{{ title }}</div>
                <div style="float: left">
                    <div style="font-size: 4vh" class="overflow">{{ artist }}</div>
                    <div style="font-size: 2vh" class="overflow">
                        {{ album + (track ? ' - #' + track : '') }}
                    </div>
                    <div style="font-size: 2vh">{{ totaltime }}</div>
                </div>
                <div style="font-size: 9vh; text-align: right">{{ bpm }}</div>
            </div>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { formatTime } from '@/models/timeFormatter';

// Version is injected at build time via webpack DefinePlugin
const APP_VERSION = process.env.VUE_APP_VERSION || 'dev';

@Component
export default class TuneDisplay extends Vue {
    get tuneHoverText() {
        return (
            'tplayer ' + APP_VERSION + ' playing: ' + this.title + '<br>From: ' + this.file
        );
    }

    // Clean, Law of Demeter compliant getters
    get cover() {
        return this.$store.getters.currentCover;
    }

    get title() {
        return this.$store.getters.currentTitle;
    }

    get file() {
        return this.$store.getters.currentFile;
    }

    get artist() {
        return this.$store.getters.currentArtist;
    }

    get album() {
        return this.$store.getters.currentAlbum;
    }

    get track() {
        return this.$store.getters.currentTrack;
    }

    get bpm() {
        return this.$store.getters.currentBpm;
    }

    get totaltime() {
        return formatTime(this.$store.getters.totalTime);
    }
}
</script>

<style>
.overflow {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
}

.overflow-scroll {
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: clip;
    /*animation: scrolling 20s linear infinite;*/
}

@keyframes scrolling {
    0% {
        transform: translateX(0%);
    }
    50% {
        transform: translateX(0%);
    }
    100% {
        transform: translateX(-100%);
    }
}
</style>
