# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TPlayer is an Electron-based music player specifically designed for Swedish dance classes. It filters music by genre, BPM, and BPM range, with special shuffling algorithms that circulate between tempo ranges.

**Tech Stack:**
- Electron 22 (main process)
- Vue 2.6 with TypeScript
- Vuex for state management
- Vuetify 2.6 for UI components
- music-metadata for reading audio file tags

## Common Commands

### Development
```bash
npm run electron:serve       # Run in development mode with hot reload
```

### Building
```bash
npm run build               # Build the Vue app
npm run electron:build      # Build Electron app for distribution
```

### Code Quality
```bash
npm run lint               # Run ESLint on the codebase
```

## Architecture

### Electron Main Process (`src/background.ts`)

The main process handles:
- **Window management**: Creates the BrowserWindow and manages lifecycle
- **IPC communication**: Listens for renderer requests and sends tune data
- **File discovery**: Triggers tune discovery when directories are selected
- **Caching system**: Manages three cache files in the user's home directory:
  - `~/.tplayer_metadata_cache.json` - Tune metadata (title, artist, BPM, etc.)
  - `~/.tplayer_covers_cache.json` - Album cover art as base64
  - `~/.tplayerrc` - User settings (autoload directory)
- **Auto-updates**: Uses electron-updater to check for new versions
- **Cover cache loading**: Implements a singleton `CoverCacheManager` to ensure the large covers cache is only loaded once, even with concurrent requests

### Tune Discovery (`src/tuneFinder.ts`)

- Recursively walks directory trees using `walkdir`
- Processes music files concurrently (default: 10 files at a time)
- Extracts metadata using `music-metadata` library
- Separates cover art into a separate cache to keep metadata cache small
- Sends progress updates and batches of tunes to renderer via IPC
- Supports formats: .aac, .m4a, .mp3, .mpga

### Vuex Store Architecture (`src/store/`)

The store is modular with four main modules:

**`modules/tunes.ts`** - Manages the tune collection:
- Stores all discovered tunes and the currently selected tune
- Handles filtering by genre, BPM, search text
- Manages discovery state and progress
- Batches tune additions to avoid performance issues

**`modules/player.ts`** - Controls audio playback:
- Manages HTMLAudioElement instance
- Handles play/pause, next/previous, seeking
- Implements fade in/out on playback changes
- Shuffle mode with partition-based circulation (divides tunes into BPM ranges and rotates between them)
- Play timeout feature (auto-advance after X seconds)
- Graceful interruption handling for rapid tune changes

**`modules/filtering.ts`** - Filter state:
- Selected genres, BPM, BPM range
- Search string and sorting direction
- Manages available genres list

**`modules/hotkeys.ts`** - Keyboard shortcuts:
- Enabled/disabled state
- Hotkeys: `n`/`→` (next), `p`/`←` (prev), `space`/`enter` (play/pause), `f`/`PgUp` (faster), `s`/`PgDn` (slower)

**Root store (`store/index.ts`)** provides Law of Demeter compliant getters that expose module state without requiring components to know the module structure.

### Component Structure

Components are organized by purpose:

**`components/layout/`**
- `Player.vue` - Main player layout container

**`components/controls/`**
- `PlayerControls.vue` - Play/pause, next/previous, shuffle controls
- `Filtering.vue` - Genre selection, BPM filters, search

**`components/display/`**
- `TuneDisplay.vue` - Shows current tune info (title, artist, album art, BPM)
- `TuneList.vue` - Scrollable list of filtered tunes
- `Playbar.vue` - Progress bar and time display

**`components/ui/`**
- `DiscoveryProgress.vue` - Progress indicator during tune discovery

### Models

**`models/TuneInfo.ts`** - Core data structure for a music track:
- File path, title, artist, album, track number
- Genre array (supports multiple genres, split by `+`)
- BPM (rounded to integer)
- Duration in seconds
- Cover art as base64 data URI
- `coverLoaded` flag indicates if real cover has been loaded vs default

### IPC Communication (`src/preload.js`)

The preload script exposes a safe API to the renderer:
- `window.api.on()` - Listen for events from main process
- `window.api.sendSync()` - Synchronous IPC calls (e.g., `convertSongToUri`, `getCoverForTune`)
- `window.api.send()` - Send events to main process (e.g., `discover-tunes`)

### Genre System (`src/genres.ts`)

Defines `UsedGenres` - a curated list of dance genres used for filtering. Tunes can have multiple genres separated by `+` in their ID3 tags.

## Key Implementation Details

### Shuffle Algorithm

TPlayer's shuffle isn't random - it divides the filtered tune list into partitions by BPM range and circulates through them. This creates a varied tempo mix suitable for dance classes.

### Performance Optimizations

1. **Batched tune loading**: Tunes are sent from main to renderer in batches of 100 to avoid IPC size limits
2. **Streaming JSON parsers**: Large cache files are parsed with `stream-json` to avoid V8 string length limits
3. **Concurrent metadata reading**: Processes multiple files simultaneously (configurable concurrency)
4. **Separate cover cache**: Album art is stored separately from metadata to keep the main cache fast to load
5. **Covers excluded from metadata cache**: The `cover` property is NOT saved to the metadata cache, only metadata (title, artist, BPM, etc.) is cached. This reduces metadata cache size from ~270KB to ~1-2KB per tune.
6. **Lazy cover loading**: Covers are loaded on-demand via IPC when a tune is selected. When loaded from cache, tunes get the default cover assigned at load time.
7. **Singleton cover cache manager**: Prevents multiple simultaneous loads of the large covers cache

### Audio Fading

The player implements smooth fade in/out when changing tracks using interval-based volume adjustments (controlled by `fadeStep` and `fadeTime` in player state).

### Cache Files Location

All cache files are stored in the user's home directory (retrieved via `app.getPath('home')`):
- Metadata cache: `~/.tplayer_metadata_cache.json`
- Cover cache: `~/.tplayer_covers_cache.json`
- Settings: `~/.tplayerrc`

## Development Notes

- The app uses Vue 2 class-component syntax with decorators
- TypeScript path alias `@/*` maps to `src/*`
- In development mode, the app opens DevTools automatically and runs in windowed mode
- In production, the app runs fullscreen
- The app expects music files to be properly tagged (especially BPM and genre) for best results
