import { Module } from 'vuex'

// Define the hotkeys module state interface
export interface HotkeysState {
  enabled: boolean
}

export const hotkeysModule: Module<HotkeysState, any> = {
  namespaced: true,
  
  state: (): HotkeysState => ({
    enabled: true
  }),

  getters: {
    isEnabled: (state): boolean => state.enabled
  },

  mutations: {
    SET_ENABLED(state, enabled: boolean) {
      state.enabled = enabled
    }
  },

  actions: {
    // Enable hotkeys
    async enable({ commit }) {
      commit('SET_ENABLED', true)
    },
    
    // Disable hotkeys (for when text input is focused)
    async disable({ commit }) {
      commit('SET_ENABLED', false)
    },
    
    // Handle key press events
    async handleKeyPress({ state, dispatch }, event: KeyboardEvent) {
      if (!state.enabled) return
      
      event.preventDefault()
      
      switch (event.key) {
        case 'p': // Previous
        case 'ArrowLeft':
        case 'BrowserBack':
          await dispatch('player/previousTune', null, { root: true })
          break
          
        case 'n': // Next
        case 'ArrowRight':
        case 'BrowserForward':
          await dispatch('player/nextTune', null, { root: true })
          break
          
        case ' ': // Toggle Play/Pause
        case 'Enter':
          await dispatch('player/playOrPause', null, { root: true })
          break
          
        case 'f': // Faster BPM
        case 'PageUp':
          await dispatch('player/changeBpmFaster', null, { root: true })
          break
          
        case 's': // Slower BPM
        case 'PageDown':
          await dispatch('player/changeBpmSlower', null, { root: true })
          break
          
        case 'Unidentified':
          // Maybe "Menu" on Apple remote - ignore
          break
      }
    }
  }
}