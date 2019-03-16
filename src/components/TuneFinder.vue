<script lang="ts">
import { remote } from "electron";
import walk from "walkdir";
import * as mm from "music-metadata";
import { TuneInfo } from "@/models/TuneInfo";

const walker = remote.require("walkdir");

export default {};

function info(field: any): any {
  return field ? field : "unknown";
}

export const allTunes: TuneInfo[] = [];
const files: string[] = [];

async function readMetadataForAllFiles() {
  const all = new Array(files.length);
  for (const index in files) {
    const metadata = await mm.parseFile(files[index]);
    all[index] = new TuneInfo(
      info(metadata.common.title),
      info(metadata.common.artist),
      info(metadata.common.album),
      info(metadata.common.genre),
      info(metadata.common.bpm),
      metadata.common.picture ? metadata.common.picture[0] : undefined
    );
  }
  allTunes.push(...all);
}

const emitter = walk("C:/Users/Thomas/Music/iTunes/iTunes Media/Music");
emitter.on("file", (path: string) => {
  if (path.endsWith(".mp3")) {
    files.push(path);
  }
});
emitter.on("end", () => {
  readMetadataForAllFiles();
});
</script>
