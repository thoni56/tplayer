<template>
  <v-container fluid style="padding-bottom:0;">
    <v-layout>
      <v-layout shrink>
        <v-flex style="font-size:3vh;padding-right:3vh;">
          Total: {{ totalCount }}
          <br />
          Filtered: {{ currentCount }}
        </v-flex>
      </v-layout>
      <v-layout grow column padding="1vh">
        <v-layout row wrap justify-start>
          <v-btn-toggle v-model="genresSelected" multiple>
            <v-btn
              v-for="genre in genres"
              :key="genre"
              color="primary"
              @click="$emit('toggle-genre', genre)"
            >{{genre}}</v-btn>
          </v-btn-toggle>
        </v-layout>
        <v-layout row align-center>
          <v-flex grow>
            <v-slider @change="$emit('change-bpm', bpm)" dark v-model="bpm" max="300" />
          </v-flex>
          <v-flex
            shrink
            style="font-size:5vh;padding-left:1vh;padding-right:2vh;"
          >{{ bpm }}&#177;{{bpmRange}}</v-flex>
          <v-flex shrink>
            <v-btn @click="$emit('sort-tunes')">
              <v-icon>{{ sortIcon }}</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-layout>
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
  private bpm: number = 140;
  private bpmRange: number = 3;

  private mounted() {
    this.genresSelected = [];
  }

  get sortIcon() {
    if (this.sortingUp) return "fas fa-sort-amount-up";
    else return "fas fa-sort-amount-down";
  }
}
</script>
