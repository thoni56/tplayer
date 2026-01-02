import { TuneInfo } from '@/models/TuneInfo'
import { Store } from 'vuex'

let preloadInterval: number | null = null
let isRunning = false

/**
 * Start background preloading of covers for all tunes
 * @param store Vuex store instance
 * @param delayMs Delay between loading each cover (default: 1000ms)
 */
export function startCoverPreloading(store: Store<any>, delayMs = 1000) {
  if (isRunning) {
    console.log('Cover preloading already running - ignoring duplicate start request')
    return
  }
  
  isRunning = true
  
  // Wait 1 second for all tune batches to load before starting
  setTimeout(() => {
    const tunes = store.state.tunes.allTunes.filter((t: TuneInfo) => !t.coverLoaded)
    
    if (tunes.length === 0) {
      console.log('No covers to preload - all already loaded')
      isRunning = false
      return
    }
    
    console.log(`Starting background cover preloading for ${tunes.length} tunes (${delayMs}ms delay)`)
    
    let index = 0
    let realCoversFound = 0
    let defaultCoversFound = 0
    
    preloadInterval = window.setInterval(async () => {
      if (index >= tunes.length) {
        console.log(`Cover preloading complete! Found ${realCoversFound} real covers, ${defaultCoversFound} defaults out of ${tunes.length} total`)
        stopCoverPreloading()
        return
      }
      
      const tune = tunes[index]
      const progress = `[${index + 1}/${tunes.length}]`
      index++
      
      // Skip if already loaded (e.g., user played this tune)
      if (tune.coverLoaded) {
        console.log(`${progress} Skipping ${tune.file.split('\\').pop()} - already loaded`)
        return
      }
      
      try {
        const result = await window.api.sendSync('getCoverForTune', tune.file)
        
        if (result?.cover) {
          store.commit('tunes/UPDATE_TUNE_COVER', { 
            file: tune.file, 
            cover: result.cover 
          })
          
          if (result.isReal) {
            realCoversFound++
            console.log(`${progress} Real cover loaded for: ${tune.file.split('\\').pop()}`)
          } else {
            defaultCoversFound++
          }
        }
      } catch (error) {
        console.error(`${progress} Error preloading cover for ${tune.file}:`, error)
      }
    }, delayMs)
  }, 1000)
}

/**
 * Stop the background cover preloading
 */
export function stopCoverPreloading() {
  if (preloadInterval !== null) {
    clearInterval(preloadInterval)
    preloadInterval = null
  }
  isRunning = false
}
