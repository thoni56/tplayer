<template>
  <v-layout scrollable style="height: 40vh">
    <v-flex>
      <v-list dense>
        <template v-for="(tune, index) in tunes">
          <v-list-item
            :key="tune.file"
            :class="{ highlighted: playingTune.file == tune.file }"
            @click="clicked(tune.file)"
          >
            <v-list-item-avatar tile size="20">
              <img :src="tune.cover" style="border-radius: 10%" />
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>
                <span class="tune-title">{{ tune.title }}</span>
                <span class="tune-artist">{{ tune.artist }}</span>
                <span class="tune-album">{{ tune.album }}</span>
                <span class="tune-track">{{
                  tune.track ? "#" + tune.track : ""
                }}</span>
              </v-list-item-title>
            </v-list-item-content>
            <v-spacer></v-spacer>
            <div class="tune-duration">
              {{ formattedDuration(tune) }}
            </div>
            <v-list-item-action>
              <v-chip x-small>{{ tune.bpm }}</v-chip>
            </v-list-item-action>
          </v-list-item>

          <v-divider :key="index" />
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
export default class TuneList extends Vue {
  @Prop() public tunes!: TuneInfo[];
  @Prop() public playingTune!: TuneInfo;

  @Prop() public onClick!: (id: string) => void;
  @Prop() public onDblClick!: (id: string) => void;

  private timeoutId: NodeJS.Timer | null = null;

  public formattedDuration(tune: TuneInfo): string {
    return formatTime(tune.duration!);
  }

  public clicked(tuneId: string) {
    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        if (this.onClick) this.onClick(tuneId);
        this.timeoutId = null;
      }, 500);
    } else {
      clearTimeout(this.timeoutId);
      if (this.onDblClick) this.onDblClick(tuneId);
    }
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
  background-color: var(--v-primary-base);
}

.tune-title {
  font-size: 1.2em;
}

.tune-title:after {
  content: " - ";
}

.tune-artist {
  font-size: 1em;
  font-style: italic;
}

.tune-artist:after {
  content: " - ";
}

.tune-album {
  font-size: 1em;
}

.tune-album:after {
  content: " - ";
}

.tune-track {
  font-size: 0.8em;
  font-style: italic;
}

.tune-duration {
  font-size: 1em;
}

.tune-genres {
  font-size: 0.9em;
}
</style>
