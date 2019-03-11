import Vue from 'vue';
import Router from 'vue-router';
import Player from './views/Player.vue';
import Filter from './views/Filter.vue';
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
      path: '/filter',
      name: 'filter',
      component: Filter
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
});
