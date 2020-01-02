// Simple node.js program to read a lot of files in the testdata directory
// with music-metadata to ensure the metadata can be read
//
//     node read-music-metadata.js
//

const wd = require("walkdir")
const mm = require("music-metadata")

const files = [];

function discoverTunes() {
  let emitter;
  emitter = wd.walk(
    "testdata",
    { follow_symlinks: true }
  );
  emitter.on("file", (path) => {
    if (
      path.endsWith(".mp3") ||
      path.endsWith(".m4a") ||
      path.endsWith(".mp4")
    ) {
      files.push(path);
    }
  });
  emitter.on("end", () => {
    readMetadataForAllFiles();
  });
  emitter.on("error", (path) => {
    // tslint:disable-next-line:no-console
    console.log("Error reading file '", path, "'");
  });
}

async function readMetadataForAllFiles() {
  const all = new Array(files.length);
  for (const file of files) {
    try {
      const metadata = await mm.parseFile(file);
      process.stdout.write('.');
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.log("\n*** Could not read metadata from ", file)
    }
  }
}

discoverTunes();
readMetadataForAllFiles();
