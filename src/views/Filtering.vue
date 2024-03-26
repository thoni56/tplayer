<template>
    <v-container fluid class="pb-0">
        <v-layout>
            <v-flex
                shrink
                style="font-size: 3vh; padding-right: 3vh"
                class="col-3 pl-0 pr-0 pb-0 pt-0 text-left"
            >
                <v-btn color="primary" @click="initiateDiscoveringFiles()">Filtered:</v-btn>
                {{ currentCount }}({{ totalCount }})
            </v-flex>
            <v-layout wrap justify-start>
                <v-btn-toggle v-model="genresSelected" multiple dense>
                    <v-btn
                        v-for="genre in genres"
                        :key="genre"
                        color="primary"
                        @click="toggleGenre(genre)"
                        >{{ genre }}</v-btn
                    >
                </v-btn-toggle>
            </v-layout>
            <v-text-field
                dense
                v-model="searchString"
                placeholder="Search"
                clearable
                clear-icon="fa-times"
                dark
                @keyup="keypress($event)"
                hide-details="auto"
                @focus="startSearch"
                @click:clear="finishSearch"
            ></v-text-field>
            <v-flex>
                <h2 class="float-right">{{ currentTime }}</h2>
            </v-flex>
        </v-layout>
        <v-layout style="margin-top: -2vh; margin-bottom: -2.5vh">
            <v-flex
                id="bpm-label"
                align-self-center
                shrink
                style="font-size: 2vh; padding-right: 0.5vw"
                >BPM:</v-flex
            >
            <v-flex align-self-center grow style="margin-top: 5vh">
                <div @keydown.capture="ignoreKeyDown($event)">
                    <v-range-slider
                        strict
                        thumb-label="always"
                        show-ticks="always"
                        v-model="bpmSlider"
                        :max="maxBpm"
                        :min="minBpm"
                    />
                </div>
            </v-flex>
            <v-flex align-self-center shrink>
                <v-btn small color="primary" @click="flipSorting()">
                    <v-icon>{{ sortIcon }}</v-icon>
                </v-btn>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { UsedGenres } from '../genres';
import { debounce } from 'lodash';
import { TuneInfo } from '@/models/TuneInfo';

@Component({})
export default class Filtering extends Vue {
    // Store
    get totalCount() {
        return this.$store.state.allTunes.length;
    }

    get currentCount() {
        return this.$store.getters.filteredTunes.length;
    }

    get sortingUp() {
        return this.$store.state.sortingUp;
    }

    get sortIcon() {
        if (this.sortingUp) return 'fas fa-sort-amount-up';
        else return 'fas fa-sort-amount-down';
    }

    // Text searching
    public searchString = '';

    public keypress(e: any) {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            this.$store.commit('START_SEARCH', this.searchString);
        } else {
            this.$store.commit('START_SEARCH', this.searchString);
        }
    }

    public ignoreKeyDown(e: any) {
        // Prevent keypresses with the bpm-slider in focus to be handled by slider
        e.stopPropagation(); // do not propagate the keydown event
    }

    public startSearch() {
        this.$emit('got-focus');
    }

    public finishSearch() {
        this.searchString = '';
        this.$store.commit('FINISHED_SEARCH');
        this.$emit('lost-focus');
    }

    // Sorting
    public flipSorting() {
        this.$store.commit('FLIP_SORTING');
    }

    // Clock
    private date = new Date();
    public currentTime = '';

    private tickTime = 333;
    private tick() {
        this.date = new Date();
        this.currentTime =
            ('0' + this.date.getHours()).slice(-2) +
            ':' +
            ('0' + this.date.getMinutes()).slice(-2) +
            ':' +
            ('0' + this.date.getSeconds()).slice(-2);
        setTimeout(() => {
            this.tick();
        }, this.tickTime);
    }

    public mounted() {
        setTimeout(() => {
            this.tick();
        }, this.tickTime);
    }

    // Genres
    get genres() {
        return UsedGenres;
    }
    public genresSelected: number[] = []; // Model

    get currentGenres() {
        return this.$store.state.selectedGenres;
    }

    public toggleGenre(genre: string) {
        if (!this.currentGenres.includes(genre)) this.currentGenres.push(genre);
        else this.currentGenres.splice(this.currentGenres.indexOf(genre), 1);
    }

    // Tempo bpm & range
    public bpmSliderValues: number[] = [120, 128];

    get bpmSlider() {
        return this.bpmSliderValues;
    }

    set bpmSlider(val) {
        if (val[0] != this.bpmSliderValues[0]) {
            val[1] += val[0] - this.bpmSliderValues[0];
            this.bpmSliderValues = val;
        } else {
            this.bpmSliderValues[1] = val[1];
        }
        this.bpmRange = this.bpmSliderValues;
    }

    get bpmRange() {
        return [
            this.$store.state.selectedBpm,
            this.$store.state.selectedBpm + this.$store.state.selectedBpmRange,
        ];
    }

    get minBpm() {
        try {
            let m = this.$store.state.allTunes.reduce((min: number, track: TuneInfo) => {
                if (track.bpm === undefined) return min;
                return min === null || track.bpm < min ? track.bpm : min;
            }, null as number | null);
            return m ? m : 0;
        } catch (error) {
            console.error('Error calculating minBpm:', error);
            return 0;
        }
    }

    get maxBpm() {
        try {
            let m = this.$store.state.allTunes.reduce((max: number, track: TuneInfo) => {
                if (track.bpm === undefined) return max;
                return max === null || track.bpm > max ? track.bpm : max;
            }, null as number | null);
            return m ? m : 1000;
        } catch (error) {
            console.error('Error calculating maxBpm:', error);
            return 1000;
        }
    }
    // debounce BPM range changes
    commitChange = debounce((type: string, payload: any) => {
        this.$store.commit(type, payload);
    }, 300);

    set bpmRange(val) {
        if (val[0] != this.$store.state.selectedBpm) {
            this.commitChange('CHANGE_BPM', val[0]);
        } else {
            this.commitChange('CHANGE_BPM_RANGE', val[1] - val[0]);
        }
    }

    // Discover tunes over IPC
    public initiateDiscoveringFiles() {
        window.api.send('discover-tunes');
    }
}
</script>
<style>
.v-slider--horizontal .v-slider__track-container {
    height: 1.2vh;
}

#bpm-label {
    margin-top: 2.5vh;
}
</style>
