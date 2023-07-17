import { BrowserWindow } from 'electron';
import { createReadStream } from 'fs';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';

export function readTuneCacheAndSend(
  renderer: BrowserWindow,
  tuneCache: string
) {
  return new Promise((resolve, reject) => {
    const result: any[] = [];

    const pipeline = createReadStream(tuneCache)
      .pipe(parser())
      .pipe(streamArray());

    pipeline.on('data', (data) => {
      // TODO Responsibility to send should be pushed up to caller
      renderer.webContents.send('discoveredTune', data.value as TuneInfo);
    });

    pipeline.on('end', () => resolve(result));
    pipeline.on('error', reject);
  });
}

import fs from 'fs';
import { TuneInfo } from './models/TuneInfo';

export async function writeTunesToCache(tunes: any[], tunesCache: string) {
  const fileStream = fs.createWriteStream(tunesCache, { encoding: 'utf8' });
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
