const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    exitApp: () => ipcRenderer.send('exit-app'),
    isDesktop: true
});

// Listen for security violations from the main process if needed
window.addEventListener('DOMContentLoaded', () => {
    console.log('SafeBrowser Preload Initialized');
});
