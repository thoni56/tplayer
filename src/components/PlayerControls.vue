<template>
  <div style="height:10vh;">
    <v-toolbar style="height:9vh;padding-top:1vh;">
      <v-spacer></v-spacer>
      <v-btn rounded medium color="primary" @click="$emit('previous-track')">
        <v-icon>skip_previous</v-icon>
      </v-btn>
      <v-btn rounded large color="primary" @click="playOrPauseTrack">
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
      <v-btn rounded medium color="primary" @click="$emit('next-track')">
        <v-icon>skip_next</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
    </v-toolbar>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Emit, Prop } from "vue-property-decorator";
import colors from "vuetify/es5/util/colors";

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
}
</script>
