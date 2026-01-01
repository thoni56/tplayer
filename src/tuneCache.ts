import { createReadStream } from 'fs';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';

function sleep(millis: number): Promise<any> {
    return new Promise((resolve) => setTimeout(resolve, millis));
}

export function readTunesFromCache(tuneCache: string) {
    return new Promise((resolve, reject) => {
        const tunes: TuneInfo[] = [];

        const pipeline = createReadStream(tuneCache).pipe(parser()).pipe(streamArray());

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
        // Create a copy without the cover property to keep cache size minimal
        const { cover, coverLoaded, ...tuneWithoutCover } = item;
        const itemString = JSON.stringify(tuneWithoutCover);
        if (index !== 0) {
            fileStream.write(',');
        }
        fileStream.write(itemString);
    });
    fileStream.write(']');
    fileStream.end();
    
    // Wait for stream to finish writing
    await new Promise((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
    });
}

export async function writeCoverCache(coverMap: Map<string, string>, coverCachePath: string) {
    console.log(`Writing ${coverMap.size} covers to cache...`);
    const startTime = Date.now();
    
    try {
        // Use streaming write to avoid string length limits
        const fileStream = fs.createWriteStream(coverCachePath, { encoding: 'utf8' });
        
        fileStream.write('{');
        
        let isFirst = true;
        for (const [filePath, coverData] of coverMap) {
            if (!isFirst) {
                fileStream.write(',');
            }
            
            // Write key-value pair as JSON
            const key = JSON.stringify(filePath);
            const value = JSON.stringify(coverData);
            fileStream.write(`${key}:${value}`);
            
            isFirst = false;
        }
        
        fileStream.write('}');
        fileStream.end();
        
        // Wait for stream to finish
        await new Promise((resolve, reject) => {
            fileStream.on('finish', resolve);
            fileStream.on('error', reject);
        });
        
        const writeTime = (Date.now() - startTime) / 1000;
        const fileSizeMB = Math.round(fs.statSync(coverCachePath).size / 1024 / 1024);
        console.log(`Cover cache written in ${writeTime.toFixed(2)}s (${fileSizeMB}MB)`);
        
    } catch (error) {
        console.error('Error writing cover cache:', error);
        throw error;
    }
}
