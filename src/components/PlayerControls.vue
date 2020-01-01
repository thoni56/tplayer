<template>
  <v-toolbar>
    <v-spacer></v-spacer>
    <v-btn rounded medium color="primary" @click="$emit('previous-tune')">
      <v-icon>skip_previous</v-icon>
    </v-btn>
    <v-btn rounded large color="primary" @click="$emit('play-pause');">
      <v-icon>{{ playOrPauseIcon }}</v-icon>
    </v-btn>
    <v-btn rounded medium color="primary" @click="$emit('next-tune')">
      <v-icon>skip_next</v-icon>
    </v-btn>
    <v-spacer></v-spacer>
  </v-toolbar>
</template>
<script lang="ts">
import { Vue, Component, Emit, Prop } from "vue-property-decorator";
import colors from "vuetify/es5/util/colors";

@Component
export default class PlayerControls extends Vue {
  @Prop() private playing = false;

  get playOrPauseIcon() {
    return this.playing ? "pause" : "play_arrow";
  }
}
</script>
