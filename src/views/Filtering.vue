<template>
  <v-container fluid>
    <v-layout>
      <v-flex shrink style="font-size:3vh;padding-right:3vh;">
        Total: {{ totalCount }}
        <br />
        Filtered: {{ currentCount }}
      </v-flex>
      <v-layout wrap justify-start>
        <v-btn-toggle v-model="genresSelected" multiple>
          <v-btn
            v-for="genre in genres"
            :key="genre"
            color="primary"
            class="white--text"
            @click="$emit('toggle-genre', genre)"
          >{{genre}}</v-btn>
        </v-btn-toggle>
      </v-layout>
    </v-layout>
    <v-layout>
      <v-slider grow @change="$emit('change-bpm', bpm)" v-model="bpm" max="300" />
      <v-flex shrink style="font-size:5vh;padding-left:1vh;padding-right:1vh;">{{ bpm }}&#177;</v-flex>
      <v-flex shrink>
        <v-text-field
          dense
          v-model="bpmRange"
          @change="$emit('change-bpmRange', bpmRange)"
          type="number"
          style="font-size:4vh;padding-top:0.5vh;width:9vh;"
        ></v-text-field>
      </v-flex>
      <v-btn shrink @click="$emit('sort-tunes')">
        <v-icon>{{ sortIcon }}</v-icon>
      </v-btn>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Emit, Mixins } from "vue-property-decorator";
import { TuneInfo } from "@/models/TuneInfo";

@Component
export default class Filtering extends Vue {
  @Prop() public totalCount!: number;
  @Prop() public currentCount!: number;
  @Prop() public sortingUp!: boolean;

  private genres: string[] = ["Bugg", "Boogie", "Lindy", "WCS"];
  private genresSelected: number[] = [];
  private bpm: number = 0;
  private bpmRange: number = 5;

  private mounted() {
    this.genresSelected = [];
  }

  get sortIcon() {
    if (this.sortingUp) return "fas fa-sort-amount-up";
    else return "fas fa-sort-amount-down";
  }
}
</script>
