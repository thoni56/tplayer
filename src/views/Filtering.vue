<template>
  <v-container>
    <h1>Filter ({{ tunes.length }})</h1>
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
import { Component, Prop, Emit } from "vue-property-decorator";
import Tunes from "@/components/Tunes.vue";
import { TuneInfo } from "@/models/TuneInfo";

@Component({
  components: {
    Tunes
  }
})
export default class Filtering extends Vue {
  @Prop() public tunes!: TuneInfo[];

  public data() {
    return {
      genre_selected: [] // Nothing selected
    };
  }

  public mounted() {
    setTimeout(() => {
      this.addTune(new TuneInfo("Hello Dolly", "Nina Simone"));
    }, 2000);
    setTimeout(() => {
      this.addTune(new TuneInfo("Big Wheels Keep On Turning", "Joe Turner"));
    }, 5000);
  }

  @Emit("addTune")
  public addTune(tune: TuneInfo) {
    return tune;
  }
}
</script>
