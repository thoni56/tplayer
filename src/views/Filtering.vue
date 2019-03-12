<template>
  <v-container>
    <h1>Filter</h1>
    <Tunes/>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import Tunes from "@/components/Tunes.vue";

@Component({
  components: {
    Tunes
  }
})
export default class Filtering extends Vue {}
</script>
