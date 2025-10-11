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

// Cover cache for on-demand loading
let coverCache: { [key: string]: string } | null = null;

// Load cover cache lazily when first requested
async function loadCoverCache(): Promise<{ [key: string]: string }> {
    if (coverCache !== null) {
        return coverCache;
    }
    
    const coverCachePath = userHome + '/.tplayer_covers_cache.json';
    
    try {
        if (fs.existsSync(coverCachePath)) {
            console.log('Loading cover cache for on-demand access...');
            const startTime = Date.now();
            const coverData = fs.readFileSync(coverCachePath, 'utf8');
            coverCache = JSON.parse(coverData);
            const loadTime = (Date.now() - startTime) / 1000;
            const coverCount = Object.keys(coverCache!).length;
            console.log(`Cover cache loaded in ${loadTime.toFixed(2)}s (${coverCount} covers available)`);
            return coverCache!;
        } else {
            console.log('No cover cache found');
            coverCache = {};
            return coverCache;
        }
    } catch (error) {
        console.error('Error loading cover cache:', error);
        coverCache = {};
        return coverCache;
    }
}

// Helper function to get default cover as base64
// TODO: Convert actual /vinyl.png to base64 data URI
function getDefaultCoverBase64(): string {
    // For now, return the path - this should be actual base64 data
    return '/vinyl.png';
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
            return { cover: getDefaultCoverBase64(), isReal: false };
        }
    } catch (error) {
        console.error('Error getting cover for tune:', error);
        return { cover: getDefaultCoverBase64(), isReal: false };
    }
});
