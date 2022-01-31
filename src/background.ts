'use strict';

import { app, protocol, BrowserWindow, ipcMain, dialog } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { discoverTunes } from './tuneFinder';
import datauri from 'file-to-datauri';
import installExtension, {VUEJS_DEVTOOLS} from 'electron-devtools-installer';
import path from 'path';
import { UsedGenres } from './genres';

var settings = require('user-settings').file('.tplayerrc');
var autoload = settings.get('autoload')[0];

const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

// Standard scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: {
    standard: true,
    secure: true
  }
}]);

const title = "Tplayer - " + app.getVersion();

async function createWindow() {
    // Create the browser window.
  win = new BrowserWindow({
    title: title, width: 800, height: 600,
    webPreferences: {
      nodeIntegration : (process.env.ELECTRON_NODE_INTEGRATION as unknown) as boolean,
      preload: path.join(__dirname, 'preload.js')}
  });
  win.setMenu(null);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    win.webContents.on("did-frame-finish-load", () => {
      if (!process.env.IS_TEST) {
        win!.webContents.openDevTools();
      }
    });
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  win.on('closed', () => {
    win = null;
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
  if (win === null) {
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
    } catch (e:any) {
      // tslint:disable-next-line: no-console
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  await createWindow();
  if (autoload) {
    discoverTunes(win!, autoload, UsedGenres);
  }
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
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

ipcMain.on('discoverTunes', () => {
  const dir: string[] | undefined = dialog.showOpenDialogSync({ properties: ['openDirectory'] });
  if (dir) {
    win?.webContents.send('clearTunes', []);
    discoverTunes(win!, dir[0], UsedGenres);
    settings.set('autoload', dir);
  }
})

function convertToUri(filePath: string) {
  const uri: string = datauri.sync(filePath);
  return uri;
}

// Synchronous IPC call
ipcMain.on('convertSongToUri', (event: any, filePath: string) => {
  event.returnValue = convertToUri(filePath);
});
