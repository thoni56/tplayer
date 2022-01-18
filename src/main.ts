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

const store = new Vuex.Store({
  state: {
    allTunes: [] as Array<TuneInfo>,
    selectedTune: new TuneInfo(""),
    genres: [] as Array<string>,
    sortingUp: true
  },
  getters: {
    filteredTunes: state => {
      const tunes = state.allTunes.filter(t => t.genre?.some(g => state.genres.includes(g)));
      if (state.sortingUp) {
        return tunes.sort((t1, t2) => {
          return getBPM(t1) - getBPM(t2);
        });
      } else {
        return tunes.sort((t1, t2) => {
          return getBPM(t2) - getBPM(t1);
        });
      }
    }
  },
  mutations: {
    addTune (state, tune: TuneInfo) {
      state.allTunes.push(tune);
    },
    selectFile (state, file: string) {
      let tune = state.allTunes.find(tune => tune.file == file);
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
    }
  }
});

new Vue({
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app');
