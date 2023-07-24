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
var autoloadDirectory = settings.get('autoload')
  ? settings.get('autoload')[0]
  : undefined;
const userHome = app.getPath('home');
const tuneCache = userHome + '/.tplayer_cache.json';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window: BrowserWindow | null;

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

async function createWindow() {
  // Create the browser window.
  window = new BrowserWindow({
    title: title,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: process.env
        .ELECTRON_NODE_INTEGRATION as unknown as boolean,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  window.setMenu(null);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    window.webContents.on('did-finish-load', () => {
      if (!process.env.IS_TEST) {
        window!.webContents.openDevTools();
      }
    });
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    window.setFullScreen(true);
    window.loadURL('app://./index.html');
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
    readTunesFromCache(tuneCache).then((tunes) => {
      console.log('readTunesFromCache returned tunes');
      window!.webContents.send('discoveredTunes', tunes);
    });
  } else if (autoloadDirectory) {
    discoverTunes(window!, autoloadDirectory, UsedGenres, tuneCache);
  }
});

ipcMain.on('discoverTunes', () => {
  const dir: string[] | undefined = dialog.showOpenDialogSync({
    properties: ['openDirectory'],
  });
  if (dir) {
    window?.webContents.send('clearTunes', []);
    discoverTunes(window!, dir[0], UsedGenres, tuneCache);
    settings.set('autoload', dir);
  }
});

function convertToUri(filePath: string) {
  const uri: string = datauri.sync(filePath);
  return uri;
}

// Synchronous IPC call
ipcMain.handle('convertSongToUri', (event: any, filePath: string) => {
  event.returnValue = convertToUri(filePath);
});
