# tplayer

A music player specifically designed for (Swedish) dance classes. It supports

- easy selection of genre(s), bpm and bpm-range
- loading of all tunes in a specified directory tree
- easy switching between play modes
  - in order
  - random circulating (one tunes in one BPM range, then one in another)

This is an evolving project, but can now load tunes from a selected directory,
do fairly advanced filtering and play tunes. It also automatically fades in and
out for smooth listening.

## Usage

1. Tunes from your last visited directory are cached and will be autoloaded on start up.
1. Optionally press "Filtering" to select another directory to load tunes from, recursively. This will scan all music files in the tree to get images, genres, bpm etc.
1. Your files should be properly tagged with title, artist, album, album art, bpm and genre for `tplayer` to shine. NOTE: some audio files have wonky tagging, use Mp3Tag or some similar to fix it.
1. Press the genre button(s) and/ adjust bpm and bpm range for filtering
1. Select how much of a tune to play (all or some part), will automatically advance to next tune.
1. Optionally press shuffle to semi-randomly select tunes (will divide current list in sections based on tempo and circulate between them, effectively creating a good mix).
1. Press Play!

Hotkeys:

- `n`, `right arrow` - next tune
- `p`, `left arrow` - previous tune
- `space`, `enter` - toggle play/pause
- `f`, `page up` - faster tempo
- `s`, `page down` - slower tempo

You can also hook up a remote control to access those functions.

## Release Notes

See [Releases](https://github.com/thoni56/tplayer/releases).

## Building

To use it you need Node with Electron and Vue. Start it with 'npm run electron:serve'.

To debug it in Visual Studio Code the launch configurations should work, try "Electron: All"
