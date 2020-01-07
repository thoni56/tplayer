import { BrowserWindow } from "electron";
import walk from "walkdir";
import * as mm from "music-metadata";
import { TuneInfo } from "../src/models/TuneInfo";
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

function info(field: any): any {
  return field ? field : "unknown";
}

const files: string[] = [];

export function discoverTunes(renderer: BrowserWindow) {
  const directory = existsSync("testdata") ? "testdata" : join(homedir(), "Music");
  const emitter = walk(
    directory,
    { follow_symlinks: true }
  );
  emitter.on("file", (path: string) => {
    if (
      path.endsWith(".mp3") ||
      path.endsWith(".m4a") ||
      path.endsWith(".mp4")
    ) {
      files.push(path);
    }
  });
  emitter.on("end", () => {
    readMetadataForAllFiles(renderer);
  });
  emitter.on("error", (path: string) => {
    // tslint:disable-next-line:no-console
    console.log("Error parsing '", path, "'");
  });
}
async function readMetadataForAllFiles(renderer: BrowserWindow) {
  let all = new Array;
  for (let index = 0; index < files.length; index++) {
    try {
      const metadata = await mm.parseFile(files[index]);
      const tuneInfo = new TuneInfo(files[index]);
      tuneInfo.fillFromCommonTags(metadata);
      all.push(tuneInfo);
      if (index > 0 && index % 10 === 0) {
        renderer.webContents.send('discoveredTunes', all);
        all = new Array;
      }
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.log("*** Could not read metadata from ", files[index])
    }
  }
  renderer.webContents.send('discoveredTunes', all);
}
