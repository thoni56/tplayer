<template>
  <v-container fluid class="pb-0">
    <v-layout>
      <v-flex
        shrink
        style="font-size:3vh;padding-right:3vh;"
        class="col-3 pl-0 pr-0 pb-0 pt-0 text-left"
      >
        <v-btn @click="$emit('load-files')">Filtered:</v-btn>
        {{ currentCount }}({{ totalCount }})
      </v-flex>
      <v-layout wrap justify-start>
        <v-btn-toggle v-model="genresSelected" multiple dense>
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
    <v-layout style="margin-top:-2vh;">
      <v-flex align-self-center shrink style="font-size:2vh;padding-right:0.5vw;">BPM:</v-flex>
      <v-flex align-self-center grow style="margin-top:2vh;">
        <v-slider
          grow
          :hide-details="true"
          @change="$emit('change-bpm', bpm)"
          v-model="bpm"
          :max="300"
        />
      </v-flex>
      <v-flex
        shrink
        align-self-center
        style="font-size:5vh;padding-left:0.3vw;padding-right:0;"
      >{{ bpm }} +</v-flex>
      <v-flex shrink align-self-center>
        <vue-numeric-input
          controls-type="updown"
          v-model="bpmRange"
          :min="0"
          @change="$emit('change-bpmRange', bpmRange);"
          style="font-size:3.5vh;width:3em;margin-right:1vw;padding-right:1vw;"
        />
      </v-flex>
      <v-flex align-self-center shrink>
        <v-btn small color="primary" @click="$emit('sort-tunes')">
          <v-icon>{{ sortIcon }}</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import VueNumericInput from "vue-numeric-input";

@Component({
  components: { VueNumericInput }
})
export default class Filtering extends Vue {
  @Prop() public currentCount!: number;
  @Prop() public sortingUp!: boolean;

  // Store
  get totalCount() {
    return this.$store.state.allTunes.length
  }

  private genres: string[] = ["Bugg", "Boogie", "Lindy", "WCS", "Foxtrot"];
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
div.vue-numeric-input.updown {
  background: var(--v-primary-base);
  border-radius: 3px;
}
div.vue-numeric-input.updown input.numeric-input {
  border: 0;
  color: white;
}
div.vue-numeric-input.updown button.btn.btn-increment i.btn-icon {
  border-bottom-color: white;
}
div.vue-numeric-input.updown button.btn.btn-decrement i.btn-icon {
  border-top-color: white;
}
</style>