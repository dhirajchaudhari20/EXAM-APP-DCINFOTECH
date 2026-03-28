const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  exitApp: () => ipcRenderer.send('exit-app'),
  onUpdateReady: (callback) => ipcRenderer.on('update-ready', (event, info) => callback(info)),
  quitAndInstall: () => ipcRenderer.send('quit-and-install')
});
