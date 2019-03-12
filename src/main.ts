import Vue from 'vue';
import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import TuneFinder from './models/TuneFinder';

Vue.config.productionTip = false;

const finder = new TuneFinder();
finder.findTunesFrom('.');


new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
