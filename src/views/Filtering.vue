<template>
  <v-container fluid>
    <v-layout row>
      <v-layout justify-space-between>
        <v-flex style="font-size:3vh;">Total: {{ totalCount }}, filtered: {{ currentCount }}</v-flex>
        <v-layout row wrap justify-center>
          <v-flex xs12 sm6 class="py-2">
            <v-btn-toggle v-model="genresSelected" multiple>
              <v-btn
                v-for="genre in genres"
                :key="genre"
                flat
                @click="$emit('toggle-genre', genre)"
              >{{genre}}</v-btn>
            </v-btn-toggle>
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
import saveState from "vue-save-state";

@Component
export default class Filtering extends Mixins(saveState) {
  @Prop() public totalCount!: number;
  @Prop() public currentCount!: number;

  private genres: string[] = ["Bugg", "Boogie", "Lindy", "WCS"];
  private genresSelected: number[] = [];

  // ID for saving component state using vue-save-state
  private getSaveStateConfig() {
    return {
      cacheKey: "Filtering"
    };
  }
}
</script>
