<template>
<v-container>
    <h1>Filter (total: {{ total }}, filtered: {{ currentTunes?currentTunes.length:0 }})</h1>
    <v-layout row wrap justify-center>
        <v-flex xs12 sm6 class="py-2">
            <v-btn-toggle v-model="genresSelected" multiple>
                <v-btn v-for="genre in genres" :key="genre" flat @click="$emit('toggle-genre', genre)">{{genre}}</v-btn>
            </v-btn-toggle>
        </v-flex>
    </v-layout>
    <TuneList :tunes="currentTunes" />
</v-container>
</template>

<script lang="ts">
import Vue from "vue";
import {
    Component,
    Prop,
    Emit,
    Mixins
} from "vue-property-decorator";
import {
    TuneInfo
} from "@/models/TuneInfo";
import TuneList from "@/components/TuneList.vue";
import saveState from 'vue-save-state';

@Component({
    components: {
        TuneList
    }
})
export default class Filtering extends Mixins(saveState) {
    @Prop() public total!: number;
    @Prop() public currentTunes!: TuneInfo[];

    private genres: string[] = ["Bugg", "Boogie", "Lindy", "WCS"];
    private genresSelected: number[] = [];

    // ID for saving component state using vue-save-state
    private getSaveStateConfig() {
        return {
            'cacheKey': 'Filtering'
        };
    }
}
</script>
