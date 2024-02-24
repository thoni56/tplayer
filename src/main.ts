import Vue from 'vue';
import App from './App.vue';
import '@fortawesome/fontawesome-free/css/all.css';
import vuetify from './plugins/vuetify';
import Vuex from 'vuex';
import { TuneInfo } from './models/TuneInfo';

Vue.config.productionTip = false;

Vue.use(Vuex);

function getBPM(tune: TuneInfo) {
    return tune.bpm ? tune.bpm : 0;
}

function genreFilter(t: TuneInfo): boolean {
    return t.genre ? t.genre.some((g) => store.state.selectedGenres.includes(g)) : false;
}

function bpmFilter(t: TuneInfo): boolean {
    const bpm = store.state.selectedBpm;
    const bpmRange = store.state.selectedBpmRange;
    const result: boolean = bpm <= getBPM(t) && getBPM(t) <= bpm + bpmRange;
    return bpm === 0 || result;
}

function searchMatch(whole: string | undefined) {
    return (
        store.state.searchString == '' ||
        (whole ? whole.toUpperCase().includes(store.state.searchString.toUpperCase()) : false)
    );
}
function textFilter(t: TuneInfo): boolean {
    return searchMatch(t.title) || searchMatch(t.artist) || searchMatch(t.album);
}

function currentFilter(t: TuneInfo): boolean {
    return genreFilter(t) && bpmFilter(t) && textFilter(t);
}

const store = new Vuex.Store({
    state: {
        loading: false,
        allTunes: [] as Array<TuneInfo>,
        selectedTune: new TuneInfo(''),
        selectedGenres: [] as Array<string>,
        selectedBpm: 120,
        selectedBpmRange: 5,
        tunesBpmRange: [] as Array<number>,
        sortingUp: true,
        searchString: '',
        progress: 0,
    },
    getters: {
        filteredTunes: (state) => {
            const tunes = state.allTunes.filter((t) => currentFilter(t));
            if (state.sortingUp) {
                return tunes.sort((tune1, tune2) => {
                    return getBPM(tune1) - getBPM(tune2);
                });
            } else {
                return tunes.sort((tune1, tune2) => {
                    return getBPM(tune2) - getBPM(tune1);
                });
            }
        },
        currentBpm: (state) => {
            return state.selectedBpm;
        },
    },
    mutations: {
        CLEAR_TUNES(state) {
            state.allTunes = [];
        },
        ADD_TUNE(state, newTune) {
            state.allTunes.push(newTune);
        },
        ADD_TUNES(state, newTunes) {
            state.allTunes.push(...newTunes);
        },
        SELECT_FILE(state, file: string) {
            const tune = state.allTunes.find((t) => t.file == file);
            state.selectedTune = tune ? tune : new TuneInfo('');
        },
        SELECT_TUNE(state, tune: TuneInfo) {
            state.selectedTune = tune;
        },
        FLIP_SORTING(state) {
            state.sortingUp = !state.sortingUp;
        },
        CHANGE_BPM(state, bpm: number) {
            state.selectedBpm = bpm;
        },
        CHANGE_BPM_RANGE(state, bpm: number) {
            state.selectedBpmRange = bpm;
        },
        START_SEARCH(state, string) {
            state.searchString = string;
        },
        FINISHED_SEARCH(state) {
            state.searchString = '';
        },
        START_LOADING(state) {
            state.loading = true;
        },
        PROGRESS(state, progress: number) {
            state.progress = progress;
        },
        FINISHED_LOADING(state) {
            state.loading = false;
        },
    },
});

new Vue({
    vuetify,
    store,
    render: (h) => h(App),
}).$mount('#app');
