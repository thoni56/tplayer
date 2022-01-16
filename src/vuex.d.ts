// vuex.d.ts
import { Store } from 'vuex'
import { TuneInfo } from '@/models/TuneInfo';

declare module '@vue/runtime-core' {
  // declare your own store states
  interface State {
    allTunes: TuneInfo[]
  }

  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>
  }
}