import { Module } from 'vuex'
import { TuneInfo } from '@/models/TuneInfo'

// Define the filtering module state interface
export interface FilteringState {
  selectedGenres: string[]
  selectedBpm: number
  selectedBpmRange: number
  searchString: string
  sortingUp: boolean
}

// Helper function to get BPM from tune
function getBPM(tune: TuneInfo): number {
  return tune.bpm ? tune.bpm : 0
}

export const filteringModule: Module<FilteringState, any> = {
  namespaced: true,
  
  state: (): FilteringState => ({
    selectedGenres: [],
    selectedBpm: 120,
    selectedBpmRange: 5,
    searchString: '',
    sortingUp: true
  }),

  getters: {
    // Genre filter function
    genreFilter: (state) => (tune: TuneInfo): boolean => {
      // If no genres selected, show all tunes
      if (state.selectedGenres.length === 0) return true
      return tune.genre ? tune.genre.some((g) => state.selectedGenres.includes(g)) : false
    },

    // BPM filter function  
    bpmFilter: (state) => (tune: TuneInfo): boolean => {
      const bpm = state.selectedBpm
      const bpmRange = state.selectedBpmRange
      const tuneBpm = getBPM(tune)
      const result = bpm <= tuneBpm && tuneBpm <= bpm + bpmRange
      return bpm === 0 || result
    },

    // Text search filter function
    searchMatch: (state) => (text: string | undefined): boolean => {
      return state.searchString === '' || 
        (text ? text.toUpperCase().includes(state.searchString.toUpperCase()) : false)
    },

    textFilter: (state, getters) => (tune: TuneInfo): boolean => {
      return getters.searchMatch(tune.title) || 
             getters.searchMatch(tune.artist) || 
             getters.searchMatch(tune.album)
    },

    // Combined filter function
    tunePassesAllFilters: (state, getters) => (tune: TuneInfo): boolean => {
      return getters.genreFilter(tune) && 
             getters.bpmFilter(tune) && 
             getters.textFilter(tune)
    },

    // Sorting function
    sortTunes: (state) => (tunes: TuneInfo[]): TuneInfo[] => {
      const sortedTunes = [...tunes] // Create copy to avoid mutating original
      
      if (state.sortingUp) {
        return sortedTunes.sort((tune1, tune2) => getBPM(tune1) - getBPM(tune2))
      } else {
        return sortedTunes.sort((tune1, tune2) => getBPM(tune2) - getBPM(tune1))
      }
    },

    // Current BPM getter
    currentBpm: (state): number => state.selectedBpm,

    // Check if any genres are selected
    hasSelectedGenres: (state): boolean => state.selectedGenres.length > 0,

    // Check if search is active
    isSearching: (state): boolean => state.searchString.length > 0
  },

  mutations: {
    SET_SELECTED_GENRES(state, genres: string[]) {
      state.selectedGenres = genres
    },

    ADD_SELECTED_GENRE(state, genre: string) {
      if (!state.selectedGenres.includes(genre)) {
        state.selectedGenres.push(genre)
      }
    },

    REMOVE_SELECTED_GENRE(state, genre: string) {
      state.selectedGenres = state.selectedGenres.filter(g => g !== genre)
    },

    CLEAR_SELECTED_GENRES(state) {
      state.selectedGenres = []
    },

    SET_BPM(state, bpm: number) {
      state.selectedBpm = bpm
    },

    SET_BPM_RANGE(state, range: number) {
      state.selectedBpmRange = range
    },

    SET_SEARCH_STRING(state, searchString: string) {
      state.searchString = searchString
    },

    CLEAR_SEARCH(state) {
      state.searchString = ''
    },

    TOGGLE_SORTING(state) {
      state.sortingUp = !state.sortingUp
    },

    SET_SORTING_DIRECTION(state, ascending: boolean) {
      state.sortingUp = ascending
    },

    // Reset all filters
    RESET_ALL_FILTERS(state) {
      state.selectedGenres = []
      state.selectedBpm = 120
      state.selectedBpmRange = 5
      state.searchString = ''
      state.sortingUp = true
    }
  },

  actions: {
    // Action to change BPM with validation
    async changeBpm({ commit }, bpm: number) {
      const validBpm = Math.max(0, Math.min(300, bpm)) // Clamp between 0-300
      commit('SET_BPM', validBpm)
    },

    // Action to change BPM range with validation  
    async changeBpmRange({ commit }, range: number) {
      const validRange = Math.max(0, Math.min(50, range)) // Clamp between 0-50
      commit('SET_BPM_RANGE', validRange)
    },

    // Action to toggle genre selection
    async toggleGenre({ state, commit }, genre: string) {
      if (state.selectedGenres.includes(genre)) {
        commit('REMOVE_SELECTED_GENRE', genre)
      } else {
        commit('ADD_SELECTED_GENRE', genre)
      }
    },

    // Action to start search
    async startSearch({ commit }, searchString: string) {
      commit('SET_SEARCH_STRING', searchString.trim())
    },

    // Action to clear search
    async clearSearch({ commit }) {
      commit('CLEAR_SEARCH')
    },

    // Action to flip sorting direction
    async flipSorting({ commit }) {
      commit('TOGGLE_SORTING')
    },

    // Action to reset all filters
    async resetFilters({ commit }) {
      commit('RESET_ALL_FILTERS')
    }
  }
}