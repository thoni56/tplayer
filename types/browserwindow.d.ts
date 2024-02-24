import { BrowserWindow } from 'electron';

declare module 'electron' {
    interface BrowserWindow {
        api: any; // replace 'any' with the type of 'api', if you know it
    }
}
