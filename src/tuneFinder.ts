import { BrowserWindow, app } from 'electron';
import walk from 'walkdir';
import * as musicMetaData from 'music-metadata';
import { TuneInfo } from '../src/models/TuneInfo';
import { writeTunesToCache } from './tuneCache';

export function discoverTunes(
  window: BrowserWindow,
  directory: string,
  genres: string[],
  tuneCache: string
) {
  const files: string[] = [];
  const emitter = walk(directory, { follow_symlinks: true });
  window.webContents.send('progress', 0);
  window.webContents.send('start-loading');
  emitter.on('file', (path: string) => {
    if (
      path.endsWith('.aac') ||
      path.endsWith('.m4a') ||
      path.endsWith('.mp3') ||
      path.endsWith('.mpga')
    ) {
      files.push(path);
    }
  });
  emitter.on('end', () => {
    readMetadataForAllFiles(window, files, genres).then(async (tunes) => {
      window.webContents.send('discovered-tunes', tunes);
      writeTunesToCache(tunes, tuneCache)
        .then(() => window.webContents.send('finished-loading'))
        .catch((error) => console.log('Error caching tunes:' + error));
    });
  });
  emitter.on('error', (path: string) => {
    // tslint:disable-next-line:no-console
    console.log("Error parsing '", path, "'");
  });
}

async function readMetadataForAllFiles(
  window: BrowserWindow,
  files: string[],
  genres: string[]
) {
  let all = [];
  let totalProgress = files.length;
  let actualProgress = 0;

  for (let index = 0; index < files.length; index++) {
    try {
      const metadata = await musicMetaData.parseFile(files[index]);
      const tuneInfo = new TuneInfo(files[index]);
      tuneInfo.fillFromCommonTags(metadata);
      if (genres.some((g) => tuneInfo.genre && tuneInfo.genre.includes(g))) {
        all.push(tuneInfo);
        actualProgress++;
      } else {
        totalProgress--;
      }
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.log('*** Could not read metadata from ', files[index]);
    }
    window.webContents.send(
      'progress',
      Math.round((actualProgress / totalProgress) * 100)
    );
  }
  return all;
}
