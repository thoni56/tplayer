<template>
  <v-app id="Application" dark>
    <v-navigation-drawer v-model="drawer" clipped fixed app>
      <v-list dense>
        <v-list-tile v-for="link in links" :key="link.text" router :to="link.route">
          <v-list-tile-action>
            <v-icon>{{ link.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ link.text }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app fixed clipped-left>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>tplayer</v-toolbar-title>
    </v-toolbar>
    <v-content>
      <v-container fluid>
        <router-view :tunes="current_tunes"/>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { allTunes } from "@/components/TuneFinder.vue";

Vue.config.productionTip = false;

@Component
export default class App extends Vue {
  public drawer = false;
  public links = [
    { icon: "play_arrow", text: "Player", route: "/" },
    { icon: "filter_list", text: "Filter", route: "/filtering" },
    { icon: "settings", text: "Settings", route: "/settings" }
  ];

  public data() {
    return {
      current_tunes: allTunes
    };
  }
}
</script>
<style>
html {
  overflow: hidden;
}
</style>
