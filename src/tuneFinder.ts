import { BrowserWindow } from "electron";
import walk from "walkdir";
import * as mm from "music-metadata";
import { TuneInfo } from "../src/models/TuneInfo";

var settings = require('user-settings').file('.tplayerrc');

export function discoverTunes(renderer: BrowserWindow, directory: string, genres: string []) {
  const files: string[] = [];
  const emitter = walk(
    directory,
    { follow_symlinks: true }
  );
  renderer.webContents.send('progress', 0);
  renderer.webContents.send('startLoading');
  emitter.on("file", (path: string) => {
    if (
      path.endsWith(".aac") ||
      path.endsWith(".m4a") ||
      path.endsWith(".mp3") ||
      path.endsWith(".mpga")
    ) {
      files.push(path);
    }
  });
  emitter.on("end", () => {
    readMetadataForAllFiles(renderer, files, genres);
  });
  emitter.on("error", (path: string) => {
    // tslint:disable-next-line:no-console
    console.log("Error parsing '", path, "'");
  });
}

async function readMetadataForAllFiles(renderer: BrowserWindow, files: string[], genres: string[]) {
  let all = [];
  let fullProgress = files.length;
  let doneProgress = 0;

  for (let index = 0; index < files.length; index++) {
    try {
      const metadata = await mm.parseFile(files[index]);
      const tuneInfo = new TuneInfo(files[index]);
      tuneInfo.fillFromCommonTags(metadata);
      if (genres.some(g => tuneInfo.genre && tuneInfo.genre.includes(g))) {
        all.push(tuneInfo);
        doneProgress++;
      } else {
        fullProgress--;
      }

    } catch (e) {
      // tslint:disable-next-line: no-console
      console.log("*** Could not read metadata from ", files[index])
    }
    renderer.webContents.send('progress', Math.round(doneProgress/fullProgress*100));
  }
  renderer.webContents.send('discoveredTunes', all);
  renderer.webContents.send('finishedLoading');
  settings.set('tunes', all);
}
