<template>
    <div>
        <v-layout justify-space-between >
            <v-container style="padding-left:0px; padding-bottom:0px;">
            <div style="text-align:left">{{playedSeconds}}</div>
            </v-container>
            <v-container style="padding-right:0px; padding-bottom:0px;">
            <div style="text-align:right">{{totalSeconds}}</div>
            </v-container>
        </v-layout>
        <v-progress-linear :value="percent" />
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class Playbar extends Vue {
    @Prop() private totalSeconds!: number;
    @Prop() private playedSeconds!: number;

    private percent: number = 47;
}
</script>
