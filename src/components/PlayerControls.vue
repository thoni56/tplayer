<template>
  <div>
    <v-toolbar flat height="90">
      <v-spacer></v-spacer>
      <v-btn outline fab small color="light-blue" @click="previousTrack">
        <v-icon>skip_previous</v-icon>
      </v-btn>
      <v-btn outline fab color="light-blue" @click="playTrack">
        <v-icon large>{{ this.icon }}</v-icon>
      </v-btn>
      <v-btn outline fab small color="light-blue" @click="$emit('play-track')">
        <v-icon>skip_next</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
    </v-toolbar>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Emit } from "vue-property-decorator";

@Component
export default class PlayerControls extends Vue {
  public playing = false;
  public icon: string = "play_arrow";

  public playTrack() {
    if (this.playing) {
      this.$emit("pause-track");
      this.icon = "play_arrow";
    } else {
      this.$emit("play-track");
      this.icon = "pause";
    }
    this.playing = !this.playing;
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

