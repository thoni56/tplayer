<template>
  <v-container>
    <h1>PLAYER</h1>
    <v-btn v-on="play">Play</v-btn>
    <v-btn v-on="pause">Pause</v-btn>
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
  @Prop() tunes!: TuneInfo[];
  public play() {}
  public pause() {}
}
</script>
