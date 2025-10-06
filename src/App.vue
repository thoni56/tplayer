<template>
    <MainApp />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import MainApp from '@/views/MainApp.vue'

@Component({
    components: {
        MainApp,
    },
})
export default class App extends Vue {}
</script>
