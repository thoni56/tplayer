<template>
  <v-container>
    <h1>PLAYER</h1>
    <PlayerControls v-on:play-track="playTrack" @pause-track="pauseTrack"/>
    <Tunes :tunes="tunes"/>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import TuneInfo from "TuneInfo.vue";
import Tunes from "@/components/Tunes.vue";
import PlayerControls from "@/components/PlayerControls.vue";

@Component({
  components: {
    Tunes,
    PlayerControls
  }
})
export default class Player extends Vue {
  @Prop() public tunes!: TuneInfo[];

  public playTrack() {
    console.log("Play!");
  }

  public pauseTrack() {
    console.log("Pause!");
  }
}
</script>
