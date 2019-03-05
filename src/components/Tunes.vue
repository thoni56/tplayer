<template>
  <div>
    <h1>Tunes</h1>
    <ul>
      <li v-for="tune in tunes" :key="tune">{{ tune }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class Tunes extends Vue {
  private data() {
    return {
      tunes: ["Hello Dolly", "Boogie Woogie Choo-Choo Train"]
    };
  }
}
</script>

<style>
</style>
