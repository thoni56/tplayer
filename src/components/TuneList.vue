<template>
  <v-layout scrollable style="height: 25vh">
    <v-flex>
      <v-list dense>
        <template v-for="(tune, index) in tunes()">
          <v-list-item
            :key="tune.file"
            :id="tune.file"
            :class="{ highlighted: selectedTune().file == tune.file }"
            @click="clicked(tune.file)"
          >
            <v-list-item-avatar tile size="20">
              <img :src="tune.cover" alt="cover" style="border-radius: 10%" />
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>
                <span class="tune-title">{{ tune.title }}</span>
                <span class="tune-artist">{{ tune.artist }}</span>
                <span class="tune-album">{{ tune.album }}</span>
                <span class="tune-track">{{
                  tune.track ? '#' + tune.track : ''
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
import { Component, Vue } from 'vue-property-decorator';
import { TuneInfo } from '@/models/TuneInfo';
import { formatTime } from '@/models/timeFormatter';

const ft = formatTime; // To ensure a reference exists

@Component
export default class TuneList extends Vue {
  public tunes(): TuneInfo[] {
    return this.$store.getters.filteredTunes;
  }

  public selectedTune() {
    return this.$store.state.selectedTune;
  }

  public formattedDuration(tune: TuneInfo): string {
    return formatTime(tune.duration!);
  }

  public clicked(file: string) {
    this.$store.commit('SELECT_FILE', file);
    this.$emit('click');
  }

  public genres(tune: TuneInfo) {
    return tune.genre ? tune.genre.toString() : '';
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
  content: ' - ';
}

.tune-artist {
  font-size: 1em;
  font-style: italic;
}

.tune-artist:after {
  content: ' - ';
}

.tune-album {
  font-size: 1em;
}

.tune-album:after {
  content: ' - ';
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
