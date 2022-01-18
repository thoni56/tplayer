import Vue from 'vue';
import App from './App.vue';
import '@fortawesome/fontawesome-free/css/all.css';
import vuetify from './plugins/vuetify';
import Vuex from 'vuex';
import { TuneInfo } from './models/TuneInfo';

Vue.config.productionTip = false;

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    allTunes: [] as Array<TuneInfo>,
    selectedTune: new TuneInfo(""),
    genres: [] as Array<string>
  },
  getters: {
    filteredTunes: state => {
      return state.allTunes.filter(t => t.genre?.some(g => state.genres.includes(g)));
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
    }
  }
});

new Vue({
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app');
