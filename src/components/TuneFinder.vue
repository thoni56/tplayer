<script lang="ts">
import { remote } from "electron";
import walk from "walkdir";
import * as mm from "music-metadata";
import { TuneInfo } from "@/models/TuneInfo";

const walker = remote.require("walkdir");

// Need this to make vue(?) Hot Loader work
export default {};

function info(field: any): any {
  return field ? field : "unknown";
}

const files: string[] = [];

export function loadTunes(loadBatch: (tunes: TuneInfo[]) => void) {
  let emitter;
  if (process.platform === "darwin") {
    emitter = walk("testdata");
  } else {
    emitter = walk(
      "C:/Users/Thomas/Music/iTunes/iTunes Media/Music/Compilations"
    );
  }
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
    readMetadataForAllFiles(loadBatch);
  });
  emitter.on("error", (path: string) => {
    // tslint:disable-next-line:no-console
    console.log("Error parsing '", path, "'");
  });
}
async function readMetadataForAllFiles(loadBatch: (tunes: TuneInfo[]) => void) {
  const all = new Array(files.length);
  let previous = 0;
  for (let index = 0; index < files.length; index++) {
    if (files.hasOwnProperty(index)) {
      const metadata = await mm.parseFile(files[index]);
      all[index] = new TuneInfo(files[index]);
      all[index].fillFromCommonTags(metadata);
    }
    if (index > 0 && index % 10 === 0) {
      loadBatch(all.slice(previous, index));
      previous = index;
    }
  }
  loadBatch(all.slice(previous));
}
</script>
