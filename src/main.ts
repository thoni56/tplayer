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
  return t.genre ? t.genre.some(g => store.state.selectedGenres.includes(g)) : false;
}

function bpmFilter(t: TuneInfo): boolean {
  const bpm = store.state.selectedBpm;
  const bpmRange = store.state.selectedBpmRange;
  const result: boolean =
    bpm <= getBPM(t) && getBPM(t) <= bpm + bpmRange;
  return bpm === 0 || result;
}

function currentFilter(t: TuneInfo): boolean {
  return genreFilter(t) && bpmFilter(t);
}


const store = new Vuex.Store({
  state: {
    allTunes: [] as Array<TuneInfo>,
    selectedTune: new TuneInfo(""),
    selectedGenres: [] as Array<string>,
    selectedBpm: 0,
    selectedBpmRange: 5,
    sortingUp: true,
    searching: false
  },
  getters: {
    filteredTunes: state => {
      const tunes = state.allTunes.filter(t => currentFilter(t));
      if (state.sortingUp) {
        return tunes.sort((tune1, tune2) => {
          return getBPM(tune1) - getBPM(tune2);
        });
      } else {
        return tunes.sort((tune1, tune2) => {
          return getBPM(tune2) - getBPM(tune1);
        });
      }
    }
  },
  mutations: {
    addTune (state, tune: TuneInfo) {
      state.allTunes.push(tune);
    },
    selectFile (state, file: string) {
      const tune = state.allTunes.find(t => t.file == file);
      state.selectedTune = tune?tune:new TuneInfo("");
    },
    selectTune (state, tune: TuneInfo) {
      state.selectedTune = tune;
    },
    clear(state) {
      state.allTunes = [];
    },
    flipSorting (state) {
      state.sortingUp = !state.sortingUp;
    },
    changeBpm (state, bpm: number) {
      state.selectedBpm = bpm;
    },
    changeBpmRange (state, bpm: number) {
      state.selectedBpmRange = bpm;
    },
    toggleSearching (state) {
      state.searching = !state.searching;
    }
  }
});

new Vue({
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app');
