import Vue from 'vue'
import App from './App.vue'
import '@fortawesome/fontawesome-free/css/all.css'
import vuetify from './plugins/vuetify'
import store from './store' // Import the new modular store

Vue.config.productionTip = false

// Create the Vue instance with the modular store
new Vue({
  vuetify,
  store,
  render: (h) => h(App),
}).$mount('#app')
