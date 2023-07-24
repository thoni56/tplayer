import { BrowserWindow } from 'electron';
import { createReadStream } from 'fs';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';

function sleep(millis: number): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, millis));
}

export function readTunesFromCache(tuneCache: string) {
  return new Promise((resolve, reject) => {
    const tunes: TuneInfo[] = [];

    const pipeline = createReadStream(tuneCache)
      .pipe(parser())
      .pipe(streamArray());

    pipeline.on('data', async (data) => {
      tunes.push(data.value as TuneInfo);
    });

    pipeline.on('end', () => resolve(tunes));
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
