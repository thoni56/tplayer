<template>
  <v-layout row scrollable>
    <v-flex>
      <v-list dense>
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
              <v-list-tile-title>
                <span class="tune-title">{{ tune.title }}</span>
                <span class="tune-artist">{{ tune.artist }}</span>
                <span class="tune-album">{{ tune.album }}</span>
                <span class="tune-track">{{ tune.track?'#'+tune.track:"" }}</span>
              </v-list-tile-title>
              <v-list-tile-sub-title>
                <span class="tune-genres">{{ genres(tune) }}</span>
              </v-list-tile-sub-title>
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
import { VueResizeText } from "vue-resize-text";
import { TuneInfo } from "@/models/TuneInfo";
import { formatTime } from "@/models/timeFormatter";

const ft = formatTime; // To ensure a reference exists

@Component
export default class TuneList extends Vue {
  @Prop() public tunes!: TuneInfo[];
  @Prop() public currentTune!: string;

  @Prop() public onClick!: (id: string) => void;

  public formattedDuration(tune: TuneInfo): string {
    return formatTime(tune.duration!);
  }

  public clicked(tuneId: string) {
    if (this.onClick) this.onClick(tuneId);
  }

  public genres(tune: TuneInfo) {
    return tune.genre ? tune.genre.toString() : "";
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

.tune-title {
  font-size: 1.2em;
}
.tune-title:after {
  content: " - ";
}

.tune-artist {
  font-size: 0.9em;
  font-style: italic;
}
.tune-artist:after {
  content: " - ";
}

.tune-album {
  font-size: 0.8em;
}
.tune-album:after {
  content: " - ";
}

.tune-track {
  font-size: 0.7em;
  font-style: italic;
}

.tune-genres {
  font-size: 0.9em;
}
</style>
