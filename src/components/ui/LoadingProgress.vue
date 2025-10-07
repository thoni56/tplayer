<template>
    <div class="loading-overlay" v-if="loading">
        <v-flex md2 />
        <v-flex class="display-4 red--text lighten-2">
            Loading tunes...
            <v-progress-linear v-model="progress" height="30">
                <div class="body-2 font-weight-bold">{{ progress }}%</div>
            </v-progress-linear>
        </v-flex>
        <v-flex md2 />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class LoadingProgress extends Vue {
    get loading() {
        return this.$store.getters.isLoading;
    }

    get progress() {
        return this.$store.getters.loadingProgress;
    }
}
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
    background-color: rgba(255, 255, 255, 0.9);
    z-index: 10000;
}
</style>
