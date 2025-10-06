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
                ref="searchField"
                dense
                v-model="searchString"
                placeholder="Search"
                clearable
                clear-icon="fa-times"
                dark
                @keyup="keypress($event)"
                hide-details="auto"
                @focus="removeHotKeyListener"
                @blur="installHotKeyListener"
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
                <div @keydown.capture="ignoreKeyDownForBpmSlider($event)">
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
    // Clean, Law of Demeter compliant store access
    get totalCount() {
        return this.$store.getters.totalTunesCount;
    }

    get currentCount() {
        return this.$store.getters.filteredTunesCount;
    }

    get sortingUp() {
        return this.$store.getters.sortingUp;
    }

    get sortIcon() {
        if (this.sortingUp) return 'fas fa-sort-amount-up';
        else return 'fas fa-sort-amount-down';
    }

    // Text searching
    public searchString = '';

    public keypress(e: any) {
        this.$store.dispatch('filtering/startSearch', this.searchString);
    }

    public ignoreKeyDownForBpmSlider(e: any) {
        // Prevent keypresses with the bpm-slider in focus to be handled by slider
        e.stopPropagation(); // do not propagate the keydown event
    }

    public removeHotKeyListener() {
        this.$emit('remove-hotkey-listener');
    }

    public installHotKeyListener() {
        this.$emit('install-hotkey-listener');
    }

    public finishSearch() {
        this.searchString = '';
        (this.$refs.searchField as HTMLInputElement).blur();
        this.$store.dispatch('filtering/clearSearch');
        this.installHotKeyListener();
    }

    // Sorting
    public flipSorting() {
        this.$store.dispatch('filtering/flipSorting');
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
        return this.$store.getters.selectedGenres;
    }

    public async toggleGenre(genre: string) {
        await this.$store.dispatch('filtering/toggleGenre', genre);
    }

    // Tempo bpm & range
    get minBpm() {
        try {
            const bpmRange = this.$store.getters['tunes/bpmRange'];
            return bpmRange.min || 0;
        } catch (error) {
            console.error('Error calculating minBpm:', error);
            return 0;
        }
    }

    get maxBpm() {
        try {
            const bpmRange = this.$store.getters['tunes/bpmRange'];
            return bpmRange.max || 1000;
        } catch (error) {
            console.error('Error calculating maxBpm:', error);
            return 1000;
        }
    }

    // Slider model
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
            this.$store.state.filtering.selectedBpm,
            this.$store.state.filtering.selectedBpm + this.$store.state.filtering.selectedBpmRange,
        ];
    }

    // debounce BPM range changes
    commitChange = debounce((type: string, payload: any) => {
        this.$store.commit(type, payload);
    }, 300);

    set bpmRange(val) {
        if (val[0] != this.$store.state.filtering.selectedBpm) {
            this.commitChange('filtering/SET_BPM', val[0]);
        } else {
            this.commitChange('filtering/SET_BPM_RANGE', val[1] - val[0]);
        }
    }

    // Handle FASTER event from user
    public changeBpm(n: number) {
        this.$set(this.bpmSliderValues, 0, this.bpmSliderValues[0] + n);
        this.$set(this.bpmSliderValues, 1, this.bpmSliderValues[1] + n);
        this.commitChange('filtering/SET_BPM', this.bpmSliderValues[0]);
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
