import { Module } from 'vuex'
import { TuneInfo } from '@/models/TuneInfo'

// Define the player module state interface
export interface PlayerState {
  // Playback state
  playing: boolean
  timePlayed: number
  timeTotal: number
  
  // Audio source
  currentAudioSrc: string
  
  // Playback settings
  shuffle: boolean
  playTimeout: number
  playTimeoutInhibited: boolean
  
  // Shuffle settings
  currentShufflePartition: number
  shufflePartitionCount: number
  
  // Fade settings
  fadeStep: number
  fadeTime: number
}

// Global audio instance managed by this module
let audioInstance: HTMLAudioElement | null = null
let timeUpdateInterval: number | null = null
let timeoutCheckInterval: number | null = null

// Helper functions
function sleep(millis: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, millis))
}

export const playerModule: Module<PlayerState, any> = {
  namespaced: true,
  
  state: (): PlayerState => ({
    playing: false,
    timePlayed: 0,
    timeTotal: 0,
    
    currentAudioSrc: '',
    
    shuffle: false,
    playTimeout: 0,
    playTimeoutInhibited: false,
    
    currentShufflePartition: 0,
    shufflePartitionCount: 4,
    
    fadeStep: 0.1,
    fadeTime: 100
  }),

  getters: {
    // Playback status
    isPlaying: (state): boolean => state.playing,
    
    // Progress percentage for progress bar
    playbackProgress: (state): number => {
      return state.timeTotal > 0 ? (state.timePlayed / state.timeTotal) * 100 : 0
    },
    
    // Timeout status
    shouldTimeout: (state): boolean => {
      return !state.playTimeoutInhibited && 
             state.playTimeout > 0 && 
             state.timePlayed >= state.playTimeout
    },
    
    // Shuffle status
    isShuffling: (state): boolean => state.shuffle,
    
    // Playback times for display
    currentTime: (state): number => state.timePlayed,
    totalTime: (state): number => state.timeTotal,
    remainingTime: (state): number => state.timeTotal - state.timePlayed
  },

  mutations: {
    SET_PLAYING(state, playing: boolean) {
      state.playing = playing
    },
    
    SET_TIME_PLAYED(state, time: number) {
      state.timePlayed = Math.max(0, time)
    },
    
    SET_TIME_TOTAL(state, time: number) {
      state.timeTotal = Math.max(0, time)
    },
    
    SET_AUDIO_SRC(state, src: string) {
      state.currentAudioSrc = src
    },
    
    SET_SHUFFLE(state, shuffle: boolean) {
      state.shuffle = shuffle
    },
    
    SET_PLAY_TIMEOUT(state, seconds: number) {
      state.playTimeout = Math.max(0, seconds)
    },
    
    SET_TIMEOUT_INHIBITED(state, inhibited: boolean) {
      state.playTimeoutInhibited = inhibited
    },
    
    INCREMENT_SHUFFLE_PARTITION(state) {
      state.currentShufflePartition = 
        (state.currentShufflePartition + 1) % state.shufflePartitionCount
    },
    
    RESET_PLAYBACK_STATE(state) {
      state.timePlayed = 0
      state.playTimeoutInhibited = false
    }
  },

  actions: {
    // Initialize audio and intervals
    async initialize({ commit, dispatch }) {
      if (!audioInstance) {
        audioInstance = new Audio()
        
        // Set up audio event listeners
        audioInstance.addEventListener('playing', () => {
          commit('SET_TIME_TOTAL', audioInstance!.duration)
        })
        
        audioInstance.addEventListener('ended', async () => {
          await dispatch('nextTune')
        })
        
        audioInstance.addEventListener('loadstart', () => {
          commit('SET_PLAYING', false)
          commit('RESET_PLAYBACK_STATE')
        })
      }
      
      // Start time tracking
      if (!timeUpdateInterval) {
        timeUpdateInterval = window.setInterval(() => {
          if (audioInstance) {
            commit('SET_TIME_PLAYED', audioInstance.currentTime)
          }
        }, 333)
      }
      
      // Start timeout checking
      if (!timeoutCheckInterval) {
        timeoutCheckInterval = window.setInterval(() => {
          dispatch('checkTimeout')
        }, 400)
      }
    },
    
    // Cleanup when component is destroyed
    async cleanup() {
      if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval)
        timeUpdateInterval = null
      }
      
      if (timeoutCheckInterval) {
        clearInterval(timeoutCheckInterval)
        timeoutCheckInterval = null
      }
    },
    
    // Load audio source for selected tune
    async loadSelectedTune({ commit, dispatch, rootState }) {
      const selectedTune = rootState.tunes.selectedTune
      if (!selectedTune || !selectedTune.file) {
        return
      }
      
      await dispatch('initialize')
      
      try {
        // Use the IPC to convert file to URI (as in original code)
        const uri = await window.api.sendSync('convertSongToUri', selectedTune.file)
        
        if (audioInstance) {
          audioInstance.src = uri
          audioInstance.load()
          commit('SET_AUDIO_SRC', uri)
        }
        
        // Load cover for the currently playing tune if not already loaded
        if (!selectedTune.coverLoaded) {
          dispatch('loadCoverForCurrentTune')
        }
        
      } catch (error) {
        console.error('Failed to load audio:', error)
      }
    },
    
    // Load cover for currently playing tune
    async loadCoverForCurrentTune({ rootState, commit }) {
      const selectedTune = rootState.tunes.selectedTune
      if (!selectedTune || !selectedTune.file || selectedTune.coverLoaded) {
        return
      }
      
      try {
        console.log('Loading cover for current tune:', selectedTune.file.split('\\').pop())
        const result = await window.api.sendSync('getCoverForTune', selectedTune.file)
        
        if (result && result.cover) {
          // Update the tune's cover in the store
          commit('tunes/UPDATE_TUNE_COVER', { 
            file: selectedTune.file, 
            cover: result.cover 
          }, { root: true })
          
          if (result.isReal) {
            console.log('Real cover loaded for current tune')
          } else {
            console.log('Default cover loaded for current tune')
          }
        }
      } catch (error) {
        console.error('Failed to load cover for current tune:', error)
      }
    },
    
    // Fade out with volume control
    async fadeOut({ commit, state }) {
      if (!audioInstance) return
      
      while (audioInstance.volume > state.fadeStep) {
        audioInstance.volume -= state.fadeStep
        await sleep(state.fadeTime)
      }
      audioInstance.volume = 0
      audioInstance.pause()
      commit('SET_PLAYING', false)
    },
    
    // Fade in with volume control
    async fadeIn({ commit, state }) {
      if (!audioInstance) return
      
      await audioInstance.play()
      while (audioInstance.volume < 1 - state.fadeStep) {
        audioInstance.volume += state.fadeStep
        await sleep(state.fadeTime)
      }
      audioInstance.volume = 1
      commit('SET_PLAYING', true)
    },
    
    // Play/pause toggle
    async playOrPause({ state, dispatch, rootGetters }) {
      if (state.playing) {
        await dispatch('pause')
      } else {
        await dispatch('play')
      }
    },
    
    // Play the currently selected tune
    async play({ dispatch, rootGetters }) {
      // If no tune selected, select one first, then continue to play
      const hasTuneSelected = rootGetters['tunes/hasTuneSelected']
      if (!hasTuneSelected) {
        await dispatch('nextTune')
      }

      // Ensure the audio element is ready enough to begin playback
      if (audioInstance && audioInstance.readyState < 3) {
        await new Promise<void>((resolve) => {
          const onCanPlay = () => {
            if (audioInstance) {
              audioInstance.removeEventListener('canplay', onCanPlay)
            }
            resolve()
          }
          audioInstance?.addEventListener('canplay', onCanPlay)
          // Safety timeout in case the event already fired or metadata is already present
          setTimeout(resolve, 500)
        })
      }
      
      await dispatch('fadeIn')
    },
    
    // Pause playback
    async pause({ dispatch }) {
      await dispatch('fadeOut')
    },
    
    // Skip forward 10 seconds
    async skipForward({ state }) {
      if (audioInstance && state.playing) {
        audioInstance.currentTime = Math.min(audioInstance.currentTime + 10, audioInstance.duration - 10)
      }
    },
    
    // Skip backward 10 seconds  
    async skipBackward({ state }) {
      if (audioInstance && state.playing) {
        audioInstance.currentTime = Math.max(0, audioInstance.currentTime - 10)
      }
    },
    
    // Move to next tune
    async nextTune({ dispatch }) {
      await dispatch('advanceTune', 1)
    },
    
    // Move to previous tune
    async previousTune({ dispatch }) {
      await dispatch('advanceTune', -1)
    },
    
    // Core tune advancement logic
    async advanceTune({ state, dispatch, rootGetters }, direction: number) {
      const filteredTunes = rootGetters['tunes/filteredTunes']
      if (filteredTunes.length === 0) return
      
      if (state.shuffle) {
        await dispatch('moveToRandomTune')
      } else {
        await dispatch('moveInDirection', direction)
      }
    },
    
    // Move in a specific direction (next/previous)
    async moveInDirection({ dispatch, rootGetters }, direction: number) {
      const nextTune = direction > 0 
        ? rootGetters['tunes/nextTune']
        : rootGetters['tunes/previousTune']
        
      if (nextTune) {
        await dispatch('moveToTune', nextTune)
      }
    },
    
    // Move to a random tune using partition logic
    async moveToRandomTune({ state, commit, dispatch, rootGetters }) {
      const filteredTunes = rootGetters['tunes/filteredTunes']
      if (filteredTunes.length === 0) return
      
      // Increment shuffle partition for round-robin distribution
      commit('INCREMENT_SHUFFLE_PARTITION')
      
      // Get BPM range for partitioning
      const bpmTunes = filteredTunes.filter((t: TuneInfo) => t.bpm && t.bpm > 0)
      if (bpmTunes.length === 0) {
        // No BPM info, just random selection
        const randomTune = filteredTunes[Math.floor(Math.random() * filteredTunes.length)]
        await dispatch('moveToTune', randomTune)
        return
      }
      
      const bpmValues = bpmTunes.map((t: TuneInfo) => t.bpm!).sort((a: number, b: number) => a - b)
      const minBpm = bpmValues[0]
      const maxBpm = bpmValues[bpmValues.length - 1]
      const bpmRange = maxBpm - minBpm
      const partitionSize = Math.floor(bpmRange / state.shufflePartitionCount)
      
      const partitionMin = minBpm + state.currentShufflePartition * partitionSize
      const partitionMax = partitionMin + partitionSize
      
      // Filter tunes in this BPM partition
      const partitionTunes = filteredTunes.filter(
        (t: TuneInfo) => t.bpm && t.bpm >= partitionMin && t.bpm <= partitionMax
      )
      
      if (partitionTunes.length > 0) {
        const randomTune = partitionTunes[Math.floor(Math.random() * partitionTunes.length)]
        await dispatch('moveToTune', randomTune)
      } else {
        // Fallback to any random tune
        const randomTune = filteredTunes[Math.floor(Math.random() * filteredTunes.length)]
        await dispatch('moveToTune', randomTune)
      }
    },
    
    // Move to specific tune
    async moveToTune({ dispatch, commit, state }, tune: TuneInfo) {
      const wasPlaying = state.playing
      
      if (wasPlaying) {
        await dispatch('fadeOut')
      }
      
      // Select the tune in the tunes module
      await dispatch('tunes/selectTune', tune, { root: true })
      
      // Load the new audio
      await dispatch('loadSelectedTune')
      
      // Reset timeout state
      commit('RESET_PLAYBACK_STATE')
      
      // Resume playing if we were playing before
      if (wasPlaying) {
        await dispatch('play')
      }
      
      // Scroll tune into view
      setTimeout(() => {
        const element = document.getElementById(tune.file)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 100)
    },
    
    // Load and play selected tune (for click events)
    async loadSelectedTuneAndPlay({ dispatch }) {
      await dispatch('fadeOut')
      await dispatch('loadSelectedTune')
      await dispatch('play')
    },
    
    // Toggle shuffle mode
    async toggleShuffle({ commit, state }) {
      commit('SET_SHUFFLE', !state.shuffle)
    },
    
    // Set play timeout
    async setPlayTimeout({ commit }, seconds: number) {
      commit('SET_PLAY_TIMEOUT', seconds)
    },
    
    // Check if should timeout and advance to next tune
    async checkTimeout({ getters, dispatch, commit }) {
      if (getters.shouldTimeout) {
        commit('SET_TIMEOUT_INHIBITED', true)
        await dispatch('nextTune')
      }
    },
    
    // BPM change actions (for hotkeys)
    async changeBpmFaster({ dispatch }) {
      await dispatch('filtering/changeBpm', 4, { root: true })
    },
    
    async changeBpmSlower({ dispatch }) {
      await dispatch('filtering/changeBpm', -3, { root: true })
    }
  }
}
