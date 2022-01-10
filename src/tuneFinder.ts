import { BrowserWindow } from "electron";
import walk from "walkdir";
import * as mm from "music-metadata";
import { TuneInfo } from "../src/models/TuneInfo";


export function discoverTunes(renderer: BrowserWindow, directory: string) {
  const files: string[] = [];
  const emitter = walk(
    directory,
    { follow_symlinks: true }
  );
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
    readMetadataForAllFiles(renderer, files);
  });
  emitter.on("error", (path: string) => {
    // tslint:disable-next-line:no-console
    console.log("Error parsing '", path, "'");
  });
}

function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

async function readMetadataForAllFiles(renderer: BrowserWindow, files: string[]) {
  let all = [];
  for (let index = 0; index < files.length; index++) {
    try {
      await sleep(1);
      const metadata = await mm.parseFile(files[index]);
      const tuneInfo = new TuneInfo(files[index]);
      tuneInfo.fillFromCommonTags(metadata);
      all.push(tuneInfo);
      if (index > 0 && index % 10 === 0) {
        renderer.webContents.send('discoveredTunes', all);
        all = [];
      }
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.log("*** Could not read metadata from ", files[index])
    }
  }
  renderer.webContents.send('discoveredTunes', all);
}
