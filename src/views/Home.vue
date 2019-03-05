<template>
  <div class="home">
    <Tunes/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Tunes from "@/components/Tunes.vue"; // @ is an alias to /src

@Component({
  components: {
    Tunes
  }
})
export default class Home extends Vue {}
</script>
