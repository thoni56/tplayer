const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    console.log('Sent ' + channel);
    ipcRenderer.send(channel, data);
  },
  sendSync: async (channel, data) => {
    return await ipcRenderer.invoke(channel, data);
  },
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => {
      func(...args);
    });
  },
});
