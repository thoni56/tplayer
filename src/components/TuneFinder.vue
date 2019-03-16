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
    if (files.hasOwnProperty(index)) {
      // See https://stackoverflow.com/questions/40770425/tslint-codelyzer-ng-lint-error-for-in-statements-must-be-filtere
      const metadata = await mm.parseFile(files[index]);
      all[index] = new TuneInfo(files[index]);
      all[index].fillFromCommonTags(metadata);
    }
  }
  allTunes.push(...all);
}

const emitter = walk("C:/Users/Thomas/Music/iTunes/iTunes Media/Music");
emitter.on("file", (path: string) => {
  if (path.endsWith(".mp3") || path.endsWith(".m4a") || path.endsWith(".mp4")) {
    files.push(path);
  }
});
emitter.on("end", () => {
  readMetadataForAllFiles();
});
</script>
