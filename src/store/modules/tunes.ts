import { Module } from 'vuex'
import { TuneInfo } from '@/models/TuneInfo'

// Define the tunes module state interface
export interface TunesState {
  allTunes: TuneInfo[]
  selectedTune: TuneInfo
  discovering: boolean
  discoveryProgress: number
  tunesBpmRange: number[]
}

export const tunesModule: Module<TunesState, any> = {
  namespaced: true,
  
  state: (): TunesState => ({
    allTunes: [],
    selectedTune: new TuneInfo(''),
    discovering: false,
    discoveryProgress: 0,
    tunesBpmRange: []
  }),

  getters: {
    // Get filtered tunes by applying all filters from filtering module
    filteredTunes: (state, getters, rootState, rootGetters) => {
      const filterFunction = rootGetters['filtering/tunePassesAllFilters']
      const sortFunction = rootGetters['filtering/sortTunes']
      
      const filteredTunes = state.allTunes.filter(filterFunction)
      return sortFunction(filteredTunes)
    },

    // Get tune count
    totalTunesCount: (state): number => state.allTunes.length,
    
    filteredTunesCount: (state, getters): number => getters.filteredTunes.length,

    // Check if a tune is selected
    hasTuneSelected: (state): boolean => state.selectedTune.file !== '',

    // Get current tune index in filtered list
    currentTuneIndex: (state, getters): number => {
      const filteredTunes = getters.filteredTunes
      return filteredTunes.findIndex((tune: TuneInfo) => tune.file === state.selectedTune.file)
    },

    // Get next tune in filtered list
    nextTune: (state, getters): TuneInfo | null => {
      const filteredTunes = getters.filteredTunes
      const currentIndex = getters.currentTuneIndex
      
      if (filteredTunes.length === 0) return null
      if (currentIndex === -1) return filteredTunes[0]
      
      const nextIndex = currentIndex < filteredTunes.length - 1 ? currentIndex + 1 : 0
      return filteredTunes[nextIndex]
    },

    // Get previous tune in filtered list
    previousTune: (state, getters): TuneInfo | null => {
      const filteredTunes = getters.filteredTunes
      const currentIndex = getters.currentTuneIndex
      
      if (filteredTunes.length === 0) return null
      if (currentIndex === -1) return filteredTunes[filteredTunes.length - 1]
      
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredTunes.length - 1
      return filteredTunes[prevIndex]
    },

    // Get random tune from filtered list
    randomTune: (state, getters): TuneInfo | null => {
      const filteredTunes = getters.filteredTunes
      if (filteredTunes.length === 0) return null
      
      const randomIndex = Math.floor(Math.random() * filteredTunes.length)
      return filteredTunes[randomIndex]
    },

    // Get all unique genres from all tunes
    allGenres: (state): string[] => {
      const genresSet = new Set<string>()
      state.allTunes.forEach(tune => {
        if (tune.genre) {
          tune.genre.forEach(genre => genresSet.add(genre))
        }
      })
      return Array.from(genresSet).sort()
    },

    // Get BPM range of all tunes
    bpmRange: (state): { min: number, max: number } => {
      const bpms = state.allTunes
        .map(tune => tune.bpm || 0)
        .filter(bpm => bpm > 0)
      
      if (bpms.length === 0) return { min: 0, max: 0 }
      
      return {
        min: Math.min(...bpms),
        max: Math.max(...bpms)
      }
    },

    // Check if discovering
    isDiscovering: (state): boolean => state.discovering,

    // Get discovery progress
    discoveryProgress: (state): number => state.discoveryProgress
  },

  mutations: {
    SET_ALL_TUNES(state, tunes: TuneInfo[]) {
      state.allTunes = tunes
    },

    ADD_TUNE(state, tune: TuneInfo) {
      state.allTunes.push(tune)
    },

    ADD_TUNES(state, tunes: TuneInfo[]) {
      state.allTunes.push(...tunes)
    },

    REMOVE_TUNE(state, tuneFile: string) {
      state.allTunes = state.allTunes.filter(tune => tune.file !== tuneFile)
    },

    CLEAR_TUNES(state) {
      state.allTunes = []
      state.selectedTune = new TuneInfo('')
    },

    SELECT_TUNE(state, tune: TuneInfo) {
      state.selectedTune = tune
    },

    SELECT_TUNE_BY_FILE(state, file: string) {
      const tune = state.allTunes.find(t => t.file === file)
      state.selectedTune = tune ? tune : new TuneInfo('')
    },

    CLEAR_SELECTED_TUNE(state) {
      state.selectedTune = new TuneInfo('')
    },

    SET_DISCOVERING(state, discovering: boolean) {
      state.discovering = discovering
    },

    START_DISCOVERY(state) {
      state.discovering = true
      state.discoveryProgress = 0
    },

    SET_DISCOVERY_PROGRESS(state, progress: number) {
      state.discoveryProgress = Math.max(0, Math.min(100, progress))
      // Auto-close overlay when progress reaches 100%
      if (state.discoveryProgress === 100) {
        state.discovering = false
      }
    },

    UPDATE_TUNE_METADATA(state, { file, metadata }: { file: string, metadata: Partial<TuneInfo> }) {
      const tune = state.allTunes.find(t => t.file === file)
      if (tune) {
        Object.assign(tune, metadata)
      }
    },
    
    UPDATE_TUNE_COVER(state, { file, cover }: { file: string, cover: string }) {
      const tune = state.allTunes.find(t => t.file === file)
      if (tune) {
        tune.cover = cover
        tune.coverLoaded = true
      }
    }
  },

  actions: {
    // Action to load tunes from an array
    async loadTunes({ commit }, tunes: TuneInfo[]) {
      commit('SET_ALL_TUNES', tunes)
    },

    // Action to select tune and handle validation
    async selectTune({ commit, state }, tune: TuneInfo) {
      if (state.allTunes.includes(tune)) {
        commit('SELECT_TUNE', tune)
      } else {
        console.warn('Attempted to select tune not in collection:', tune.file)
      }
    },

    // Action to select next tune in filtered list
    async selectNextTune({ commit, getters }) {
      const nextTune = getters.nextTune
      if (nextTune) {
        commit('SELECT_TUNE', nextTune)
        return nextTune
      }
      return null
    },

    // Action to select previous tune in filtered list  
    async selectPreviousTune({ commit, getters }) {
      const previousTune = getters.previousTune
      if (previousTune) {
        commit('SELECT_TUNE', previousTune)
        return previousTune
      }
      return null
    },

    // Action to select random tune
    async selectRandomTune({ commit, getters }) {
      const randomTune = getters.randomTune
      if (randomTune) {
        commit('SELECT_TUNE', randomTune)
        return randomTune
      }
      return null
    },

    // Action to start discovery process
    async startDiscovery({ commit }) {
      commit('START_DISCOVERY')
    },

    // Action to update discovery progress
    async updateDiscoveryProgress({ commit }, progress: number) {
      commit('SET_DISCOVERY_PROGRESS', progress)
    },

    // Action to clear all tunes
    async clearTunes({ commit }) {
      commit('CLEAR_TUNES')
    },

    // Action to update tune metadata
    async updateTuneMetadata({ commit }, payload: { file: string, metadata: Partial<TuneInfo> }) {
      commit('UPDATE_TUNE_METADATA', payload)
    }
  }
}