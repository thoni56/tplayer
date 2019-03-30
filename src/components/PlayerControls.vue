<template>
  <div style="height:10vh;">
    <v-toolbar style="height:9vh;padding-top:1vh;">
      <v-spacer></v-spacer>
      <v-btn fab color="#1976d2" @click="previousTrack">
        <v-icon>skip_previous</v-icon>
      </v-btn>
      <v-btn fab style="height:6vh;" color="#1976d2" @click="playOrPauseTrack">
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
      <v-btn fab style="height:4vh;" color="#1976d2" @click="$emit('next-track')">
        <v-icon>skip_next</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
    </v-toolbar>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Emit, Prop } from "vue-property-decorator";

@Component
export default class PlayerControls extends Vue {
  @Prop() private playing = false;

  public playOrPauseTrack() {
    if (this.playing) {
      this.$emit("pause-track");
    } else {
      this.$emit("play-track");
    }
  }

  get icon() {
    return this.playing ? "pause" : "play_arrow";
  }
  @Emit() public nextTrack() {
    // tslint:disable-next-line:no-console
    console.log("Next");
  }
  @Emit() public previousTrack() {
    // tslint:disable-next-line:no-console
    console.log("Previous");
  }
}
</script>
