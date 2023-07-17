import { BrowserWindow } from 'electron';
import jsonfile from 'jsonfile';

export function readTuneCacheAndSend(win: BrowserWindow, tuneCache: string) {
  // TODO Responsibility to send should be pushed up to caller
  jsonfile
    .readFile(tuneCache)
    .then((tunes) => win?.webContents.send('discoveredTunes', tunes))
    .catch((error) => console.log(error));
}

import fs from 'fs';

export async function writeTunesToCache(tunes: any[], path: string) {
  const fileStream = fs.createWriteStream(path, { encoding: 'utf8' });
  fileStream.write('[');
  tunes.forEach((item, index) => {
    const itemString = JSON.stringify(item);
    if (index !== 0) {
      fileStream.write(',');
    }
    fileStream.write(itemString);
  });
  fileStream.write(']');
  fileStream.end();
}
