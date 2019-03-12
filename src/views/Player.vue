<template>
  <v-container>
    <h1>PLAYER</h1>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Tunes from "@/components/Tunes.vue"; // @ is an alias to /src

@Component({
  components: {
    Tunes
  }
})
export default class Player extends Vue {}
</script>
