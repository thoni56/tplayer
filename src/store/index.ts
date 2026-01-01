import Vue from 'vue'
import Vuex from 'vuex'
import { filteringModule, FilteringState } from './modules/filtering'
import { tunesModule, TunesState } from './modules/tunes'
import { playerModule, PlayerState } from './modules/player'
import { hotkeysModule, HotkeysState } from './modules/hotkeys'
import { TuneInfo } from '@/models/TuneInfo'

// Cache for default cover to avoid repeated IPC calls
let defaultCoverCache: string = ''

// Helper function to ensure TuneInfo has default cover
async function ensureDefaultCover(tune: TuneInfo): Promise<void> {
  if (!tune.cover) {
    if (!defaultCoverCache) {
      try {
        defaultCoverCache = await window.api.sendSync('getDefaultCover', null)
      } catch (error) {
        console.error('Failed to get default cover:', error)
        return
      }
    }
    tune.cover = defaultCoverCache
  }
}

Vue.use(Vuex)

// Define the root state interface
export interface RootState {
  filtering: FilteringState
  tunes: TunesState
  player: PlayerState
  hotkeys: HotkeysState
}

export default new Vuex.Store<RootState>({
  modules: {
    filtering: filteringModule,
    tunes: tunesModule,
    player: playerModule,
    hotkeys: hotkeysModule
  },

  // Root state (empty since we use modules - modules manage their own state)
  state: {} as any,

  // Root getters that provide clean, Law of Demeter compliant access
  getters: {
    // === PLAYER STATE GETTERS ===
    
    // Playback state
    isPlaying: (state, getters, rootState, rootGetters) => {
      return rootGetters['player/isPlaying']
    },
    
    isShuffling: (state, getters, rootState, rootGetters) => {
      return rootGetters['player/isShuffling']
    },
    
    // Time information
    currentTime: (state, getters, rootState, rootGetters) => {
      return rootGetters['player/currentTime']
    },
    
    totalTime: (state, getters, rootState, rootGetters) => {
      return rootGetters['player/totalTime']
    },
    
    tuneDuration: (state, getters, rootState, rootGetters) => {
      return rootGetters['player/tuneDuration']
    },
    
    remainingTime: (state, getters, rootState, rootGetters) => {
      return rootGetters['player/remainingTime']
    },
    
    playbackProgress: (state, getters, rootState, rootGetters) => {
      return rootGetters['player/playbackProgress']
    },
    
    // === CURRENT TUNE GETTERS ===
    
    currentTitle: (state, getters, rootState, rootGetters) => {
      return rootState.tunes.selectedTune.title || ''
    },
    
    currentArtist: (state, getters, rootState, rootGetters) => {
      return rootState.tunes.selectedTune.artist || ''
    },
    
    currentAlbum: (state, getters, rootState, rootGetters) => {
      return rootState.tunes.selectedTune.album || ''
    },
    
    currentBpm: (state, getters, rootState, rootGetters) => {
      return rootState.tunes.selectedTune.bpm || 0
    },
    
    currentCover: (state, getters, rootState, rootGetters) => {
      return rootState.tunes.selectedTune.cover || defaultCoverCache || '/vinyl.png'
    },
    
    currentTrack: (state, getters, rootState, rootGetters) => {
      return rootState.tunes.selectedTune.track
    },
    
    currentFile: (state, getters, rootState, rootGetters) => {
      return rootState.tunes.selectedTune.file || ''
    },
    
    currentDuration: (state, getters, rootState, rootGetters) => {
      return rootState.tunes.selectedTune.duration || 0
    },
    
    // === TUNES COLLECTION GETTERS ===
    
    filteredTunes: (state, getters, rootState, rootGetters) => {
      return rootGetters['tunes/filteredTunes']
    },
    
    totalTunesCount: (state, getters, rootState, rootGetters) => {
      return rootGetters['tunes/totalTunesCount']
    },
    
    filteredTunesCount: (state, getters, rootState, rootGetters) => {
      return rootGetters['tunes/filteredTunesCount']
    },
    
    hasTuneSelected: (state, getters, rootState, rootGetters) => {
      return rootGetters['tunes/hasTuneSelected']
    },
    
    // === FILTERING STATE GETTERS ===
    
    selectedBpm: (state, getters, rootState, rootGetters) => {
      return rootState.filtering.selectedBpm
    },
    
    selectedBpmRange: (state, getters, rootState, rootGetters) => {
      return rootState.filtering.selectedBpmRange
    },
    
    selectedGenres: (state, getters, rootState, rootGetters) => {
      return rootState.filtering.selectedGenres
    },
    
    searchString: (state, getters, rootState, rootGetters) => {
      return rootState.filtering.searchString
    },
    
    sortingUp: (state, getters, rootState, rootGetters) => {
      return rootState.filtering.sortingUp
    },
    
    isSearching: (state, getters, rootState, rootGetters) => {
      return rootGetters['filtering/isSearching']
    },
    
    hasSelectedGenres: (state, getters, rootState, rootGetters) => {
      return rootGetters['filtering/hasSelectedGenres']
    },
    
    // === DISCOVERY STATE GETTERS ===
    
    isDiscovering: (state, getters, rootState, rootGetters) => {
      return rootGetters['tunes/isDiscovering']
    },
    
    discoveryProgress: (state, getters, rootState, rootGetters) => {
      return rootGetters['tunes/discoveryProgress']
    },
    
    // === HOTKEYS STATE GETTERS ===
    
    hotkeysEnabled: (state, getters, rootState, rootGetters) => {
      return rootGetters['hotkeys/isEnabled']
    },
    
    // === COMPOSITE GETTERS ===
    
    // Check if app is ready (has tunes and not discovering)
    isAppReady: (state, getters, rootState, rootGetters) => {
      return !getters.isDiscovering && getters.totalTunesCount > 0
    },
    
    // Get current status message
    statusMessage: (state, getters, rootState, rootGetters) => {
      if (getters.isDiscovering) {
        return `Discovering tunes... ${getters.discoveryProgress}%`
      }
      
      if (getters.totalTunesCount === 0) {
        return 'No tunes loaded. Select a directory to scan for music.'
      }
      
      if (getters.isSearching || getters.hasSelectedGenres) {
        return `Showing ${getters.filteredTunesCount} of ${getters.totalTunesCount} tunes`
      }
      
      return `${getters.totalTunesCount} tunes loaded`
    },
    
    // Current tune display info for UI
    currentTuneInfo: (state, getters) => {
      return {
        title: getters.currentTitle,
        artist: getters.currentArtist,
        album: getters.currentAlbum,
        track: getters.currentTrack,
        bpm: getters.currentBpm,
        cover: getters.currentCover,
        file: getters.currentFile,
        duration: getters.currentDuration
      }
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

    // Handle available tunes from Electron main process (discovery or cache)
    async handleAvailableTunes({ commit }, tunes: TuneInfo[]) {
      // Ensure all tunes have default covers
      await Promise.all(tunes.map((tune: TuneInfo) => ensureDefaultCover(tune)))
      
      // Add tunes to existing collection (for batched loading)
      commit('tunes/ADD_TUNES', tunes)
    },

    // Handle a single available tune from Electron main process  
    async handleAvailableTune({ commit }, tune) {
      commit('tunes/ADD_TUNE', tune)
    },

    // Handle discovery progress from Electron main process
    async handleDiscoveryProgress({ dispatch }, progress) {
      await dispatch('tunes/updateDiscoveryProgress', progress)
    },
    
    // Helper action to ensure a TuneInfo instance has a default cover
    async ensureTuneHasDefaultCover({ }, tune: TuneInfo) {
      await ensureDefaultCover(tune)
      return tune
    }
  }
})