# tplayer

A music player specifically designed for dance classes. It (will) support

- easy selection of genre(s), bpm and bpm-range
- background loading of all tunes in a specified directory tree
- easy switching between play modes
  - in order
  - random
  - circulating (a few tunes in one BPM range, then a few tunes in another)

This is a budding project, but it can now find tunes in a predefined directory, do trivial
filtering and play tunes. It also automatically fades in and out for smooth listening.

## Release 0.5.4

- Better BPM filtering

## Release 0.5.1

First inofficial release scans all tunes in your Music directory ($HOME/Music) and allows
filtering on some predefined Genres ("Bugg", "Boogie", "Lindy" and "WCS", a song can have
multiple genres if the Genre tag is a string with '+' between, like "Bugg+Lindy").

You can also filter on BPM range using the slider. BPM=0 means no BPM-filtering. Increase
 or decrease the range with the up/down arrows.

Tunes will always be sorted according to BPM, change direction with the button.

Some hotkeys are also available:

  - Next tune ('n' or arrow right)
  - Previous tune ('p' or arrow left)
  - Play/Pause (Enter or Space)


## Building
To use it you need Node with Electron and Vue. Start it with 'npm run electron:serve'.

To debug it in Visual Studio Code the launch configurations should work, try "Electron: All"
