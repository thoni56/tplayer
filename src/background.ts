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
const tuneCache = userHome + '/.tplayer_cache.json';

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
    if (fs.existsSync(tuneCache)) {
        console.time('readTunesFromCache'); // Start timing
        readTunesFromCache(tuneCache).then((tunes) => {
            window!.webContents.send('discovered-tunes', tunes);
            console.timeEnd('readTunesFromCache'); // End timing
        });
    } else if (autoloadDirectory) {
        discoverTunes(window!, autoloadDirectory, UsedGenres, tuneCache);
    }
});

ipcMain.on('discover-tunes', () => {
    const dir: string[] | undefined = dialog.showOpenDialogSync({
        properties: ['openDirectory'],
    });
    if (dir) {
        window?.webContents.send('clear-tunes', []);
        discoverTunes(window!, dir[0], UsedGenres, tuneCache);
        settings.set('autoload', dir);
    }
});

function convertToUri(filePath: string) {
    const uri: string = datauri.sync(filePath);
    return uri;
}

// Synchronous IPC call to convert to file path to URI
ipcMain.handle('convertSongToUri', async (event: any, filePath: string) => {
    const uri: string = convertToUri(filePath);
    return uri;
});
