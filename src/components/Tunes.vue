<template>
  <v-layout row scrollable>
    <v-flex xs12>
      <v-list two-line>
        <template v-for="(tune, index) in tunes">
          <v-list-tile
            :key="tune.file"
            :class="{'highlighted': currentTune == tune.file}"
            @click="clicked(tune.file)"
          >
            <v-list-tile-avatar tile>
              <img :src="tune.cover">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>{{ tune.title }}</v-list-tile-title>
              <v-list-tile-sub-title>{{ tune.artist + " - " + tune.album + " " + (tune.track?"("+tune.track+")":"") }}</v-list-tile-sub-title>
              <v-list-tile-sub-title>{{ tune.genre }}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-spacer></v-spacer>
            {{ formattedDuration(tune) }}
            <v-list-tile-action>
              <v-chip small>{{ tune.bpm }}</v-chip>
            </v-list-tile-action>
          </v-list-tile>

          <v-divider :key="index"/>
        </template>
      </v-list>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { TuneInfo } from "@/models/TuneInfo";
import { formatTime } from "@/models/timeFormatter";

const ft = formatTime; // To ensure a reference exists

@Component
export default class Tunes extends Vue {
  @Prop({
    default: []
  })
  public tunes!: TuneInfo[];
  @Prop() public currentTune!: string;

  @Prop() public onClick!: (id: string) => void;

  public formattedDuration(tune: TuneInfo): string {
    return formatTime(tune.duration!);
  }

  public clicked(tuneId: string) {
    if (this.onClick) this.onClick(tuneId);
  }
}
</script>

<style>
.scrollable {
  overflow-y: scroll;
  height: calc(100vh - 250px);
}

.highlighted {
  background-color: #1976d2;
}
</style>
