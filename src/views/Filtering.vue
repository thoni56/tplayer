<template>
  <v-container fluid>
    <v-layout row>
      <v-layout>
        <v-flex style="font-size:5vh;">
          Total: {{ totalCount }}
          <br>
          Filtered: {{ currentCount }}
        </v-flex>
      </v-layout>
      <v-layout column>
        <v-layout row wrap justify-start>
          <v-btn-toggle v-model="genresSelected" multiple>
            <v-btn
              v-for="genre in genres"
              :key="genre"
              flat
              @click="$emit('toggle-genre', genre)"
            >{{genre}}</v-btn>
          </v-btn-toggle>
        </v-layout>
        <v-layout row align-center>
          <v-flex>
            <v-slider dark v-model="bpm" max="300"/>
          </v-flex>
          <v-flex style="font-size:5vh;padding-left:1vh;">{{ bpm }}</v-flex>
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

  private genres: string[] = ["Bugg", "Boogie", "Lindy", "WCS"];
  private genresSelected: number[] = [];
  private bpm: number = 140;
  private bpmRange: number = 3;

  private mounted() {
    this.genresSelected = [];
  }

  // ID for saving component state using vue-save-state
  private getSaveStateConfig() {
    return {
      cacheKey: "Filtering"
    };
  }
}
</script>
