import { BrowserWindow } from "electron";
import walk from "walkdir";
import * as mm from "music-metadata";
import { TuneInfo } from "../src/models/TuneInfo";

function info(field: any): any {
  return field ? field : "unknown";
}

const files: string[] = [];

export function discoverTunes(renderer: BrowserWindow) {
  let emitter;
  emitter = walk(
    "testdata",
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
  const all = new Array(files.length);
  let previous = 0;
  for (let index = 0; index < files.length; index++) {
    try {
      const metadata = await mm.parseFile(files[index]);
      all[index] = new TuneInfo(files[index]);
      all[index].fillFromCommonTags(metadata);
      if (index > 0 && index % 10 === 0) {
        renderer.webContents.send('discoveredTunes', all.slice(previous, index));
        previous = index;
      }
    } finally { ; }
  }
  renderer.webContents.send('discoveredTunes', all.slice(previous));
}
