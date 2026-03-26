const { app, BrowserWindow, ipcMain, screen, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    fullscreen: true,
    kiosk: true, // This is the aggressive "Lockdown" mode
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the live exam portal
  const startUrl = 'https://dcinfotech.org.in/exam-portal/index.html';

  mainWindow.loadURL(startUrl);

  // Prevent window from being closed via Alt+F4 or other shortcuts
  mainWindow.on('close', (e) => {
    // Only allow closing if the exam is marked as complete in the renderer
    // We can handle this via IPC if needed
    // e.preventDefault(); 
  });

  // Security: Prevent window blurring (tab switching)
  mainWindow.on('blur', () => {
    if (!isDev) {
      mainWindow.focus();
      mainWindow.setKiosk(true);
    }
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(() => {
  createWindow();

  // Auto-Updater Integration
  if (!isDev) {
    autoUpdater.on('update-downloaded', (info) => {
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'A new version of DC SafeBrowser has been silently downloaded. Restart the application to apply the critical updates.',
        buttons: ['Restart Now', 'Later']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });
    
    autoUpdater.on('error', (err) => {
        console.error('AutoUpdater Error:', err);
    });

    autoUpdater.checkForUpdatesAndNotify();
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for safe communication
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.on('exit-app', () => app.quit());
