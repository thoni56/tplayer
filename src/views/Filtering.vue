<template>
  <v-container>
    <h1>Filter</h1>
    <v-layout row wrap justify-center>
      <v-flex xs12 sm6 class="py-2">
        <v-btn-toggle v-model="genre_selected" multiple>
          <v-btn flat>Bugg</v-btn>
          <v-btn flat>Boogie Woogie</v-btn>
          <v-btn flat>Lindy Hop</v-btn>
          <v-btn flat>West Coast Swing</v-btn>
        </v-btn-toggle>
      </v-flex>
    </v-layout>
    <Tunes :tunes="tunes"/>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Tunes from "@/components/Tunes.vue";
import { TuneInfo } from "@/models/TuneInfo";

@Component({
  components: {
    Tunes
  }
})
export default class Filtering extends Vue {
  public tunes!: TuneInfo[];

  public data() {
    return {
      genre_selected: [], // Nothing selected
      tunes: []
    };
  }

  public mounted() {
    setTimeout(() => {
      this.discoverTunes1();
    }, 2000);
    setTimeout(() => {
      this.discoverTunes2();
    }, 5000);
  }

  public discoverTunes1() {
    this.tunes.push(new TuneInfo("Hello Dolly", "Nina Simone"));
  }

  public discoverTunes2() {
    this.tunes.push(new TuneInfo("Big Wheels Keep On Turning", "Joe Turner"));
  }
}
</script>
