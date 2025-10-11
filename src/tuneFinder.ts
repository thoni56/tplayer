import { BrowserWindow, app } from 'electron';
import walk from 'walkdir';
import * as musicMetaData from 'music-metadata';
import { TuneInfo } from '../src/models/TuneInfo';
import { writeTunesToCache } from './tuneCache';

// Configuration for concurrent file processing
const DEFAULT_CONCURRENCY = 10; // Process 10 files simultaneously by default

export function discoverTunes(
    window: BrowserWindow,
    directory: string,
    genres: string[],
    tuneCache: string,
    concurrency: number = DEFAULT_CONCURRENCY
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
        console.log(`Starting metadata processing for ${files.length} files with concurrency: ${concurrency}`);
        const startTime = Date.now();
        
        readMetadataForAllFiles(window, files, genres, concurrency).then(async (tunes) => {
            const endTime = Date.now();
            const processingTime = (endTime - startTime) / 1000;
            console.log(`Metadata processing completed in ${processingTime.toFixed(2)} seconds`);
            console.log(`Processed ${tunes.length} valid tunes from ${files.length} files`);
            
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

async function readMetadataForAllFiles(window: BrowserWindow, files: string[], genres: string[], concurrency: number = DEFAULT_CONCURRENCY) {
    const allTunes: TuneInfo[] = [];
    let processedCount = 0;
    let validTunesCount = 0;
    const totalFiles = files.length;
    
    // Progress reporting function with throttling to avoid UI spam
    let lastProgressUpdate = 0;
    const updateProgress = () => {
        const now = Date.now();
        if (now - lastProgressUpdate > 50) { // Throttle to max 20 updates per second
            const percent = Math.round((processedCount / totalFiles) * 100);
            window.webContents.send('progress', percent);
            lastProgressUpdate = now;
        }
    };

    // Process files in chunks to control concurrency
    for (let i = 0; i < files.length; i += concurrency) {
        const chunk = files.slice(i, i + concurrency);
        
        // Process this chunk concurrently
        const promises = chunk.map(async (filePath) => {
            try {
                const metadata = await musicMetaData.parseFile(filePath);
                const tuneInfo = new TuneInfo(filePath);
                tuneInfo.fillFromCommonTags(metadata);
                
                // Check if this tune matches the genre filter
                const isValidGenre = genres.some((g) => tuneInfo.genre && tuneInfo.genre.includes(g));
                
                processedCount++;
                updateProgress();
                
                if (isValidGenre) {
                    validTunesCount++;
                    return tuneInfo;
                }
                return null;
            } catch (e) {
                // tslint:disable-next-line: no-console
                console.log('*** Could not read metadata from ', filePath);
                processedCount++;
                updateProgress();
                return null;
            }
        });
        
        // Wait for all files in this chunk to complete
        const results = await Promise.all(promises);
        
        // Add valid results to our collection
        results.forEach(result => {
            if (result !== null) {
                allTunes.push(result);
            }
        });
        
        // Optional: Add a small delay between chunks to prevent overwhelming the system
        if (i + concurrency < files.length) {
            await new Promise(resolve => setTimeout(resolve, 1));
        }
    }
    
    // Ensure final progress update
    window.webContents.send('progress', 100);
    
    console.log(`Processing completed: ${validTunesCount} valid tunes from ${totalFiles} files`);
    return allTunes;
}
