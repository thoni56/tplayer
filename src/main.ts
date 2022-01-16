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
    allTunes: []
  },
  mutations: {
    addTune (state, tune: TuneInfo) {
      state.allTunes.push(tune);
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
