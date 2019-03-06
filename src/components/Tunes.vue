<template>
  <div>
    <h1>Tunes</h1>
    <ul>
      <li v-for="tune in tunes" :key="tune.title">
        <span>{{ tune.title }}</span>
        <span>{{ tune.artist }}</span>
        <span>{{ tune.album }}</span>
        <span>{{ tune.genre }}</span>
        <span>{{ tune.bpm }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { TuneInfo } from "@/models/TuneInfo";

@Component
export default class Tunes extends Vue {
  public tunes: TuneInfo[];

  constructor() {
    super();
    this.tunes = [new TuneInfo("Hello Dolly"), new TuneInfo("Big Wheel")];
  }
}
</script>

<style>
</style>
