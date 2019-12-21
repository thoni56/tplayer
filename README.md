# tplayer

A music player specifically designed for dance classes. It (will) support

- easy selection of genre(s), bpm and bpm-range
- background loading of all tunes in a specified directory tree
- easy switching between play modes
  - in order
  - random
  - circulating (a few tunes in one BPM range, then a few tunes in another)

This is a budding project, but it can now find tunes, do trivial filtering and play them.

To use it you need Node with Electron and Vue. Start it with 'npm run electron:serve'.

To debug it in Visual Studio Code the launch configurations should work, try "Electron: All"
