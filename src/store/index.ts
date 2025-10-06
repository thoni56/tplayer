import Vue from 'vue'
import Vuex from 'vuex'
import { filteringModule, FilteringState } from './modules/filtering'
import { tunesModule, TunesState } from './modules/tunes'
import { playerModule, PlayerState } from './modules/player'
import { hotkeysModule, HotkeysState } from './modules/hotkeys'

Vue.use(Vuex)

// Define the root state interface
export interface RootState {
  // Root state is empty since we use modules
}

export default new Vuex.Store<RootState>({
  modules: {
    filtering: filteringModule,
    tunes: tunesModule,
    player: playerModule,
    hotkeys: hotkeysModule
  },

  // Root state (empty since we use modules)
  state: () => ({}),

  // Root getters that combine data from multiple modules
  getters: {
    // Combined filtered tunes getter that uses both modules
    filteredTunes: (state, getters, rootState, rootGetters) => {
      return rootGetters['tunes/filteredTunes']
    },

    // Current BPM for backward compatibility
    currentBpm: (state, getters, rootState, rootGetters) => {
      return rootGetters['filtering/currentBpm']
    },

    // Check if app is ready (has tunes and not loading)
    isAppReady: (state, getters, rootState, rootGetters) => {
      return !rootGetters['tunes/isLoading'] && rootGetters['tunes/totalTunesCount'] > 0
    },

    // Get current status message
    statusMessage: (state, getters, rootState, rootGetters) => {
      const isLoading = rootGetters['tunes/isLoading']
      const totalTunes = rootGetters['tunes/totalTunesCount']
      const filteredTunes = rootGetters['tunes/filteredTunesCount']
      const isSearching = rootGetters['filtering/isSearching']
      const hasSelectedGenres = rootGetters['filtering/hasSelectedGenres']
      
      if (isLoading) {
        const progress = rootGetters['tunes/loadingProgress']
        return `Loading tunes... ${progress}%`
      }
      
      if (totalTunes === 0) {
        return 'No tunes loaded. Select a directory to scan for music.'
      }
      
      if (isSearching || hasSelectedGenres) {
        return `Showing ${filteredTunes} of ${totalTunes} tunes`
      }
      
      return `${totalTunes} tunes loaded`
    }
  },

  // Root mutations for operations that affect multiple modules
  mutations: {
    // Reset entire application state
    RESET_ALL_STATE(state) {
      // This would be handled by calling reset actions on each module
    }
  },

  // Root actions for complex operations
  actions: {
    // Initialize the application
    async initializeApp({ dispatch }) {
      // Any initialization logic that spans multiple modules
    },

    // Reset all filters and selection
    async resetAll({ dispatch }) {
      await dispatch('filtering/resetFilters')
      await dispatch('tunes/clearTunes')
    },

    // Handle discovered tunes from Electron main process
    async handleDiscoveredTunes({ dispatch }, tunes) {
      await dispatch('tunes/loadTunes', tunes)
      await dispatch('tunes/finishLoading')
    },

    // Handle a single discovered tune from Electron main process  
    async handleDiscoveredTune({ commit }, tune) {
      commit('tunes/ADD_TUNE', tune)
    },

    // Handle loading progress from Electron main process
    async handleProgress({ dispatch }, progress) {
      await dispatch('tunes/updateProgress', progress)
    }
  }
})