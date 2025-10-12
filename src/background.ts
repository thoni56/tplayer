'use strict';

import { app, protocol, BrowserWindow, ipcMain, dialog } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { discoverTunes } from './tuneFinder';
import datauri from 'file-to-datauri';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import path from 'path';
import fs from 'fs';
import { UsedGenres } from './genres';

var settings = require('user-settings').file('.tplayerrc');
var autoloadDirectory = settings.get('autoload') ? settings.get('autoload')[0] : undefined;
const userHome = app.getPath('home');
const metadataCache = userHome + '/.tplayer_metadata_cache.json';
const legacyCache = userHome + '/.tplayer_cache.json';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window: BrowserWindow | null;

import { autoUpdater } from 'electron-updater';

// Enable auto-updates for open-source apps hosted on GitHub

// Standard scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'app',
        privileges: {
            standard: true,
            secure: true,
        },
    },
]);

const title = 'Tplayer - ' + app.getVersion();

autoUpdater.on('update-available', (info) => {
    console.log('update-available', info);
});

async function createWindow() {
    // Create the browser window.
    window = new BrowserWindow({
        title: title,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION as unknown as boolean,
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    console.log('Window created!');
    window.setMenu(null);

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        autoUpdater.checkForUpdates();
        // Load the url of the dev server if in development mode
        window
            .loadURL(process.env.WEBPACK_DEV_SERVER_URL)
            .then(() => {
                console.log('Dev URL loaded!');
            })
            .catch((err) => console.error('Error loading dev URL', err));
        window.webContents.on('did-finish-load', () => {
            if (!process.env.IS_TEST) {
                window!.webContents.openDevTools();
            }
        });
    } else {
        autoUpdater.checkForUpdatesAndNotify();
        createProtocol('app');
        // Load the index.html when not in development
        window.setFullScreen(true);
        window
            .loadURL('app://./index.html')
            .then(() => {
                console.log('URL loaded!');
            })
            .catch((err) => console.error('Error loading URL', err));
    }

    window.on('closed', () => {
        window = null;
    });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', async () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (window === null) {
        await createWindow();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS);
        } catch (e: any) {
            // tslint:disable-next-line: no-console
            console.error('Vue Devtools failed to install:', e.toString());
        }
    }

    // Intercept app:// file requests to provide fallbacks for bare font URLs
    // Some runtime paths may request app:///fa-... files (missing fonts/),
    // which results in noisy ENOENT. Redirect those to the fonts/ folder.
    try {
        protocol.interceptFileProtocol('app', (request, callback) => {
            try {
                const url = new URL(request.url);
                let pathname = url.pathname || '';
                // Normalize leading slash
                if (pathname.startsWith('/')) pathname = pathname.slice(1);

                // If a bare Font Awesome file is requested without directory, serve from fonts/
                if (/^fa-(brands|regular|solid)-\d{3}\.[a-f0-9]+\.(woff2|woff|ttf|eot)$/i.test(pathname)) {
                    const filePath = path.join(__dirname, 'fonts', pathname);
                    callback({ path: filePath });
                    return;
                }

                // Default mapping: app://./ maps to __dirname
                const normalized = pathname.replace(/^\.\//, '');
                const filePath = path.join(__dirname, normalized);
                callback({ path: filePath });
            } catch (err) {
                console.warn('app protocol intercept error:', err);
                callback({ path: path.join(__dirname, 'index.html') });
            }
        });
    } catch (e) {
        console.warn('Failed to install app protocol fallback:', e);
    }

    await createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit();
            }
        });
    } else {
        process.on('SIGTERM', () => {
            app.quit();
        });
    }
}

import { readTunesFromCache } from './tuneCache';
import { createReadStream } from 'fs';
import { parser } from 'stream-json';
import { streamObject } from 'stream-json/streamers/StreamObject';
ipcMain.on('renderer-ready', () => {
    console.log('renderer-ready');
    if (fs.existsSync(metadataCache)) {
        console.time('readTunesFromCache'); // Start timing
        readTunesFromCache(metadataCache).then((tunes) => {
            window!.webContents.send('discovered-tunes', tunes);
            console.timeEnd('readTunesFromCache'); // End timing
        });
    } else if (autoloadDirectory) {
        discoverTunes(window!, autoloadDirectory, UsedGenres, metadataCache);
    }
});

ipcMain.on('discover-tunes', () => {
    const dir: string[] | undefined = dialog.showOpenDialogSync({
        properties: ['openDirectory'],
    });
    if (dir) {
        window?.webContents.send('clear-tunes', []);
        discoverTunes(window!, dir[0], UsedGenres, metadataCache);
        settings.set('autoload', dir);
    }
});

function convertToUri(filePath: string) {
    const uri: string = datauri.sync(filePath);
    return uri;
}

// Asynchronous IPC handler to convert file path to URI
ipcMain.handle('convertSongToUri', async (event: any, filePath: string) => {
    const uri: string = convertToUri(filePath);
    return uri;
});

// Cover cache singleton - ensures only one loading operation ever happens
class CoverCacheManager {
    private static instance: CoverCacheManager;
    private cache: { [key: string]: string } | null = null;
    private loadingPromise: Promise<{ [key: string]: string }> | null = null;
    
    private constructor() {}
    
    public static getInstance(): CoverCacheManager {
        if (!CoverCacheManager.instance) {
            CoverCacheManager.instance = new CoverCacheManager();
        }
        return CoverCacheManager.instance;
    }
    
    public async getCache(): Promise<{ [key: string]: string }> {
        // If already loaded, return cached result immediately
        if (this.cache !== null) {
            return this.cache;
        }
        
        // If currently loading, wait for existing promise
        if (this.loadingPromise !== null) {
            console.log('Cover cache already loading, waiting for completion...');
            return this.loadingPromise;
        }
    
        // Start loading process - create promise that will be shared by all concurrent requests
        console.log('Starting cover cache loading...');
        this.loadingPromise = this.performLoad();
        
        return this.loadingPromise;
    }
    
    private async performLoad(): Promise<{ [key: string]: string }> {
        const coverCachePath = userHome + '/.tplayer_covers_cache.json';
        
        try {
            if (fs.existsSync(coverCachePath)) {
                console.log('Loading cover cache for on-demand access...');
                const startTime = Date.now();
                
                // Use streaming JSON parser to avoid V8 string length limits
                const loadedCache = await streamParseJsonObjectUsingStreamJson(coverCachePath);
                
                const loadTime = (Date.now() - startTime) / 1000;
                const coverCount = Object.keys(loadedCache).length;
                console.log(`Cover cache loaded in ${loadTime.toFixed(2)}s (${coverCount} covers available)`);
                
                this.cache = loadedCache;
                return this.cache;
            } else {
                console.log('No cover cache found');
                this.cache = {};
                return this.cache;
            }
        } catch (error) {
            console.error('Error loading cover cache:', error);
            this.cache = {};
            return this.cache;
        } finally {
            // Clear loading promise when done (success or failure)
            this.loadingPromise = null;
        }
    }
}

// Global function to maintain compatibility
async function loadCoverCache(): Promise<{ [key: string]: string }> {
    return CoverCacheManager.getInstance().getCache();
}

// Helper function to stream parse a JSON object using stream-json library
function streamParseJsonObjectUsingStreamJson(filePath: string): Promise<{ [key: string]: string }> {
    return new Promise((resolve, reject) => {
        const result: { [key: string]: string } = {};
        let isResolved = false;
        
        try {
            // For JSON objects, use streamObject to parse key-value pairs
            const fileStream = createReadStream(filePath);
            const pipeline = fileStream
                .pipe(parser())
                .pipe(streamObject());
            
            const cleanup = () => {
                try {
                    if (fileStream && !fileStream.destroyed) {
                        fileStream.destroy();
                    }
                    if (pipeline && !pipeline.destroyed) {
                        pipeline.destroy();
                    }
                } catch (cleanupError) {
                    console.warn('Cleanup error in streamParseJsonObjectUsingStreamJson:', cleanupError);
                }
            };
            
            pipeline.on('data', (data) => {
                try {
                    // data.key is the object key (file path)
                    // data.value is the cover base64 string
                    if (data.key && typeof data.value === 'string') {
                        result[data.key] = data.value;
                    }
                } catch (dataError) {
                    console.error('Error processing data in stream parser:', dataError);
                }
            });
            
            pipeline.on('end', () => {
                if (!isResolved) {
                    isResolved = true;
                    cleanup();
                    resolve(result);
                }
            });
            
            pipeline.on('error', (error) => {
                if (!isResolved) {
                    isResolved = true;
                    cleanup();
                    reject(error);
                }
            });
            
            fileStream.on('error', (error) => {
                if (!isResolved) {
                    isResolved = true;
                    cleanup();
                    reject(error);
                }
            });
            
        } catch (error) {
            if (!isResolved) {
                isResolved = true;
                reject(error);
            }
        }
    });
}

// Default cover cache - loaded at startup
let defaultCoverBase64: string | null = null;

// Get default cover as base64 - initialize once, use many times
export function getDefaultCover(): string {
    if (defaultCoverBase64 !== null) {
        return defaultCoverBase64;
    }
    
    try {
        // In development, assets are in bundled/ subdirectory
        // In production, assets are directly in __dirname
        const vinylPath = isDevelopment 
            ? path.join(__dirname, 'bundled', 'vinyl.png')
            : path.join(__dirname, 'vinyl.png');
        if (fs.existsSync(vinylPath)) {
            const imageBuffer = fs.readFileSync(vinylPath);
            defaultCoverBase64 = 'data:image/png;base64,' + imageBuffer.toString('base64');
            console.log(`Default cover loaded: ${Math.round(defaultCoverBase64.length / 1024)}KB`);
        } else {
            console.warn('vinyl.png not found, using fallback');
            defaultCoverBase64 = 'data:image/svg+xml;base64,' + Buffer.from(
                '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#ccc"/><text x="50" y="50" text-anchor="middle" dy=".3em">♪</text></svg>'
            ).toString('base64');
        }
        return defaultCoverBase64;
    } catch (error) {
        console.error('Error loading default cover:', error);
        // Fallback SVG if all else fails
        defaultCoverBase64 = 'data:image/svg+xml;base64,' + Buffer.from(
            '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#ddd"/><text x="50" y="50" text-anchor="middle" dy=".3em">?</text></svg>'
        ).toString('base64');
        return defaultCoverBase64;
    }
}

// IPC handler to get cover for a specific tune - always returns base64 data
ipcMain.handle('getCoverForTune', async (event: any, filePath: string) => {
    try {
        const covers = await loadCoverCache();
        const cover = covers[filePath];
        
        if (cover) {
            console.log(`Real cover found for: ${filePath.split('\\').pop()}`);
            return { cover: cover, isReal: true };
        } else {
            console.log(`No cover found for: ${filePath.split('\\').pop()}, returning default`);
            return { cover: getDefaultCover(), isReal: false };
        }
    } catch (error) {
        console.error('Error getting cover for tune:', error);
        return { cover: getDefaultCover(), isReal: false };
    }
});

// IPC handler to get default cover
ipcMain.handle('getDefaultCover', async () => {
    return getDefaultCover();
});
