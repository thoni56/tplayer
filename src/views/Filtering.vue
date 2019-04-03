<template>
  <v-container>
    <h1>Filter (total: {{ total }}, filtered: {{ currentTunes?currentTunes.length:0 }})</h1>
    <v-layout row wrap justify-center>
      <v-flex xs12 sm6 class="py-2">
        <v-btn-toggle v-model="genre_selected" multiple>
          <v-btn flat @click="$emit('toggle-genre', 'Bugg')">Bugg</v-btn>
          <v-btn flat @click="$emit('toggle-genre', 'Boogie')">Boogie</v-btn>
          <v-btn flat @click="$emit('toggle-genre', 'Lindy')">Lindy</v-btn>
          <v-btn flat @click="$emit('toggle-genre', 'WCS')">WCS</v-btn>
        </v-btn-toggle>
      </v-flex>
    </v-layout>
    <TuneList :tunes="currentTunes"/>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Emit } from "vue-property-decorator";
import { TuneInfo } from "@/models/TuneInfo";
import TuneList from "@/components/TuneList.vue";

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
