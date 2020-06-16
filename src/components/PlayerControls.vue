<template>
  <v-toolbar>
    <v-btn-toggle>
      <v-btn small depressed class="text-none" @click="$emit('shuffle-tunes-toggle')">
        <v-icon>shuffle</v-icon>
      </v-btn>
    </v-btn-toggle>
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
    <v-btn-toggle v-model="playTimeModel" dense mandatory>
      <v-btn
        v-for="time in playTimes"
        :key="time"
        class="text-none"
        small
        @click="playTimeChange(time)"
      >{{time}}</v-btn>
    </v-btn-toggle>
  </v-toolbar>
</template>
<script lang="ts">
import { Vue, Component, Emit, Prop } from "vue-property-decorator";
import colors from "vuetify/es5/util/colors";

@Component
export default class PlayerControls extends Vue {
  @Prop() private playing = false;

  private playTimes: string[] = [
    "15s",
    "30s",
    "60s",
    "75s",
    "90s",
    "120s",
    "All"
  ];
  private playTimeModel: number = this.playTimes.length - 1;

  get playOrPauseIcon() {
    return this.playing ? "pause" : "play_arrow";
  }

  private playTimeChange(time: string) {
    const s = Number(time.slice(0, -1)); // Convert to seconds unless "All", then NaN
    if (!isNaN(s)) {
      this.$emit("play-timeout", s);
    } else {
      this.$emit("play-timeout", 0);
    }
  }
}
</script>
