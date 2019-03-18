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
  let previous = 0;
  for (let index = 0; index < files.length; index++) {
    if (files.hasOwnProperty(index)) {
      // See https://stackoverflow.com/questions/40770425/tslint-codelyzer-ng-lint-error-for-in-statements-must-be-filtere
      const metadata = await mm.parseFile(files[index]);
      all[index] = new TuneInfo(files[index]);
      all[index].fillFromCommonTags(metadata);
    }
    if (index > 0 && index % 100 === 0) {
      allTunes.push(...all.slice(previous, index));
      previous = index;
    }
  }
  allTunes.push(...all.slice(previous));
}

let emitter;
if (process.platform === "darwin") {
  emitter = walk("/Users/Thomas/Music/iTunes/iTunes Music/Compilations");
} else {
  emitter = walk(
    "C:/Users/Thomas/Music/iTunes/iTunes Media/Music/Compilations"
  );
}
emitter.on("file", (path: string) => {
  if (path.endsWith(".mp3") || path.endsWith(".m4a") || path.endsWith(".mp4")) {
    files.push(path);
  }
});
emitter.on("end", () => {
  readMetadataForAllFiles();
});
emitter.on("error", (path: string) => {
  // tslint:disable-next-line:no-console
  console.log("Error parsing '", path, "'");
});
</script>
