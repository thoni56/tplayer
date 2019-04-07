import Vue from 'vue';
import './plugins/vuetify';
import App from './App.vue';
import '@fortawesome/fontawesome-free/css/all.css';
import colors from 'vuetify/es5/util/colors';
import Vuetify from 'vuetify';

Vue.config.productionTip = false;

Vue.use(Vuetify, {
  options: {
    customProperties: true
  },
  theme: {
    primary: colors.red.darken4
  }
});

new Vue({
  render: h => h(App)
}).$mount('#app');
