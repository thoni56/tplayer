<template>
  <div class="loading-overlay" v-if="loading">
    <spinner></spinner>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { PulseLoader } from 'vue-spinners';

@Component({
  components: {
    spinner: PulseLoader
  },
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
