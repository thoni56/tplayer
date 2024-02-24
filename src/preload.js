const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    sendSync: (channel, data) => {
        return new Promise((resolve, reject) => {
            ipcRenderer
                .invoke(channel, data)
                .then((response) => resolve(response))
                .catch((error) => reject(error));
        });
    },
    on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => {
            func(...args);
        });
    },
});
