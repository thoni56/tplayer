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

type PackageJson = {
    version: string;
    // no other fields at this time...
};

const packageJson: PackageJson = require('../../package.json');

@Component
export default class TuneDisplay extends Vue {
    get tuneHoverText() {
        return (
            'tplayer ' + packageJson.version + ' playing: ' + this.title + '<br>From: ' + this.file
        );
    }

    get selectedTune() {
        return this.$store.state.tunes.selectedTune;
    }

    get cover() {
        return this.selectedTune.cover;
    }

    get title() {
        return this.selectedTune.title;
    }

    get file() {
        return this.selectedTune.file;
    }

    get artist() {
        return this.selectedTune.artist;
    }

    get album() {
        return this.selectedTune.album;
    }

    get track() {
        return this.selectedTune.track;
    }

    get bpm() {
        return this.selectedTune.bpm;
    }

    get totaltime() {
        return formatTime(this.selectedTune.duration!);
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
