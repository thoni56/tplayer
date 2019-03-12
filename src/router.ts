import Vue from 'vue';
import Router from 'vue-router';
import Player from './views/Player.vue';
import Filtering from './views/Filtering.vue';
import Settings from './views/Settings.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'player',
      component: Player
    },
    {
      path: '/filtering',
      name: 'filtering',
      component: Filtering
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
});
