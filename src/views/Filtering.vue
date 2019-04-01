<template>
  <v-container>
    <h1>Filter (total: {{ total }}, filtered: {{ currentTunes?currentTunes.length:0 }})</h1>
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
    <TuneList :tunes="currentTunes"/>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Emit } from "vue-property-decorator";
import TuneList from "@/components/TuneList.vue";
import { TuneInfo } from "@/models/TuneInfo";

@Component({
  components: {
    TuneList
  }
})
export default class Filtering extends Vue {
  @Prop() public total!: number;
  @Prop() public currentTunes!: TuneInfo[];

  public data() {
    return {
      genre_selected: [0, 1, 2, 3] // Everything selected
    };
  }
}
</script>
