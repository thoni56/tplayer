<template>
  <div class="loading-overlay" v-if="loading">
    <Spinner message="Loading..." size="huge" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Spinner from 'vue-simple-spinner';

@Component({
  components: {
    Spinner
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
