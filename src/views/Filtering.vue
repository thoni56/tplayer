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
            style="height:9vh;"
          >{{genre}}</v-btn>
        </v-btn-toggle>
      </v-layout>
    </v-layout>
    <v-layout style="margin-top:-3vh;">
      <v-flex align-self-center shrink style="font-size:2vh;padding-right:1vh;">BPM:</v-flex>
      <v-flex align-self-center grow style="margin-top:4vh">
        <v-slider grow @change="$emit('change-bpm', bpm)" v-model="bpm" max="300" />
      </v-flex>
      <v-flex
        shrink
        align-self-center
        style="font-size:5vh;padding-left:1vh;padding-right:1vh;"
      >{{ bpm }}&#177;</v-flex>
      <v-flex shrink align-self-center>
        <vue-numeric-input
          controls-type="updown"
          v-model="bpmRange"
          @change="$emit('change-bpmRange', bpmRange);"
          style="font-size:3vh;width:11vh;margin-right:1vh;"
        />
      </v-flex>
      <v-flex align-self-center shrink>
        <v-btn color="primary" @click="$emit('sort-tunes')">
          <v-icon>{{ sortIcon }}</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Emit, Mixins } from "vue-property-decorator";
import VueNumericInput from "vue-numeric-input";
import { TuneInfo } from "@/models/TuneInfo";

@Component({
  components: { VueNumericInput }
})
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
<style>
div.vue-numeric-input.updown button.btn {
  background: var(--v-primary-base);
}

div.vue-numeric-input.updown input.numeric-input {
  border: 0;
}
</style>