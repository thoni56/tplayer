<template>
  <div class="loading-overlay" v-if="loading">
    <v-flex xs10 class="mx-auto">
      Loading tunes...
    <v-progress-linear indeterminate />
  </v-flex>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  computed: {
    loading: function() {
      return this.$store.state.loading;
    }
  }
})
export default class LoadingSpinner extends Vue {}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255,255,255,0.7);
  z-index: 10000;
}
</style>
