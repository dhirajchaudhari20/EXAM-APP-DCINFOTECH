const { app, BrowserWindow, ipcMain, screen, dialog, Menu, systemPreferences } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const isDev = require('electron-is-dev');
// Disable specific features that cause macOS ARM64 GPU process crashes on interaction
app.commandLine.appendSwitch('disable-features', 'IOSurfaceCapturer');

let mainWindow;
let aboutWindow;

function createAboutWindow() {
  if (aboutWindow) {
    aboutWindow.focus();
    return;
  }

  aboutWindow = new BrowserWindow({
    width: 450,
    height: 550,
    title: 'About DC SafeBrowser',
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false, // Cleaner frameless design as seen in about.html
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    alwaysOnTop: true,
    backgroundColor: '#0f172a',
    show: false
  });

  aboutWindow.loadFile(path.join(__dirname, 'about.html'));
  
  aboutWindow.once('ready-to-show', () => {
    aboutWindow.show();
  });

  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    fullscreen: false, // Must be false to show Mac traffic light buttons natively
    kiosk: false,
    alwaysOnTop: false, // Fixes the white screen click bug on macOS Spaces
    backgroundColor: '#1E3C72', // Brand color fallback in case of GPU hiccup
    skipTaskbar: false,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.maximize();

  // Capture Renderer Console Logs in Main Process
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    console.log(`[RENDERER ${levels[level] || 'LOG'}] ${message} (${sourceId}:${line})`);
  });

  // Load the live exam portal
  const startUrl = 'https://dcinfotech.org.in/exam-portal/index.html';

  // Set standard User Agent to bypass website's self-reloading security checks
  const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
  
  mainWindow.loadURL(startUrl, { userAgent: userAgent });

  // Prevent window from being closed via Alt+F4 or other shortcuts during exam
  mainWindow.on('close', (e) => {
    if (isExamLockedDown) {
      e.preventDefault();
      dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: 'Exam in Progress',
        message: 'You cannot close the browser while the exam is active. Please complete and submit your exam first.',
        buttons: ['OK']
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null; // Fix Object Destroyed error on macOS
  });

  // Security: Prevent window blurring (tab switching)
  mainWindow.on('blur', () => {
    if (!isDev) {
      // Do nothing on blur to prevent macOS window rendering glitches
      console.log('Window blurred (ignored)');
    }
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Create App Menu (Close, Minimize, etc.)
  const template = [
    {
      label: 'DC SafeBrowser',
      submenu: [
        { 
          label: 'About DC SafeBrowser', 
          click: () => createAboutWindow() 
        },
        { type: 'separator' },
        { label: 'Check for Updates...', click: () => {
            if (!isDev) autoUpdater.checkForUpdatesAndNotify();
        }},
        { type: 'separator' },
        { label: 'Reset Browser', click: () => mainWindow.loadURL(startUrl) },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Close Window', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Navigation Security: Allow only internal portal links
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('https://dcinfotech.org.in')) {
      event.preventDefault();
      console.warn('Blocked external navigation:', url);
    }
  });

  // Prevent new windows/tabs
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://dcinfotech.org.in')) {
      mainWindow.loadURL(url); // Load in same window instead
      return { action: 'deny' };
    }
    return { action: 'deny' };
  });

  // Deep Diagnostic Logging
  mainWindow.webContents.on('crashed', (e, killed) => console.log('>>> RENDERER CRASHED! Killed?', killed));
  mainWindow.webContents.on('unresponsive', () => console.log('>>> RENDERER UNRESPONSIVE!'));
  mainWindow.webContents.on('plugin-crashed', (e, n, v) => console.log('>>> PLUGIN CRASHED:', n, v));
  mainWindow.webContents.on('destroyed', () => console.log('>>> WEBCONTENTS DESTROYED'));
  
  // --- ACTIVE EXAM LOCKDOWN FEATURES ---
  let blackoutWindows = [];
  let isExamLockedDown = false;
  let lockdownInterval = null;
  const { exec } = require('child_process');

  function killBackgroundApps() {
    const blacklist = [
      'chrome', 'firefox', 'msedge', 'brave', 'opera', 'safari',
      'anydesk', 'teamviewer', 'discord', 'slack', 'zoom', 'teams', 'webex',
      'whatsapp', 'telegram', 'obs', 'skype', 'vlc', 'spotify'
    ];
    
    if (process.platform === 'darwin') {
      // macOS: Kill apps that are not the SafeBrowser or Finder, and specifically kill blacklisted apps
      const blacklistStr = blacklist.map(app => `"${app}"`).join(',');
      const script = `
        osascript -e '
          tell application "System Events"
            set appList to every application process whose background only is false
            set blacklistNames to {${blacklistStr}}
            repeat with theApp in appList
              set appName to name of theApp
              set lowerName to do shell script "echo " & quoted form of appName & " | tr [:upper:] [:lower:]"
              
              set isBlacklisted to false
              repeat with bItem in blacklistNames
                if lowerName contains bItem then
                  set isBlacklisted to true
                  exit repeat
                end if
              end repeat
              
              if (appName is not "DC SafeBrowser" and appName is not "Finder") or isBlacklisted then
                try
                  set appPid to unix id of theApp
                  do shell script "kill -9 " & appPid
                end try
              end if
            end repeat
          end tell
        '
      `;
      exec(script, (err) => {
        if (err) console.error('Failed to kill macOS apps:', err);
      });
    } else if (process.platform === 'win32') {
      // Windows: Stop all processes with a window title OR matching the blacklist (excluding SafeBrowser and explorer)
      const blacklistStr = blacklist.join('|');
      const script = `powershell -WindowStyle Hidden -Command "Get-Process | Where-Object { ($_.MainWindowTitle -ne '' -or $_.ProcessName -match '${blacklistStr}') -and $_.ProcessName -notmatch 'DC SafeBrowser|explorer' } | Stop-Process -Force -ErrorAction SilentlyContinue"`;
      exec(script, (err) => {
        if (err) console.error('Failed to kill Windows apps:', err);
      });
    }
  }

  function enforceExamLockdown() {
    if (isExamLockedDown) return;
    isExamLockedDown = true;
    console.log('>>> ENFORCING EXAM LOCKDOWN');

    // 1. Force kill all other background applications
    killBackgroundApps();
    
    // Periodically sweep for newly opened apps every 3 seconds
    if (lockdownInterval) clearInterval(lockdownInterval);
    lockdownInterval = setInterval(killBackgroundApps, 3000);

    // 2. Enter Full Screen and stay on top
    if (!mainWindow.isFullScreen()) mainWindow.setFullScreen(true);
    mainWindow.setAlwaysOnTop(true, 'screen-saver');

    // 3. Blackout Secondary Monitors
    const displays = screen.getAllDisplays();
    const primaryDisplayId = screen.getPrimaryDisplay().id;
    
    displays.forEach((display) => {
      if (display.id !== primaryDisplayId) {
        let blackoutWin = new BrowserWindow({
          x: display.bounds.x,
          y: display.bounds.y,
          width: display.bounds.width,
          height: display.bounds.height,
          backgroundColor: '#000000',
          frame: false,
          fullscreen: true,
          alwaysOnTop: true,
          kiosk: true,
          skipTaskbar: true,
          enableLargerThanScreen: true,
          webPreferences: { nodeIntegration: false, contextIsolation: true }
        });
        blackoutWin.loadURL('data:text/html,<body style="background-color:black;width:100vw;height:100vh;overflow:hidden;margin:0;"></body>');
        blackoutWindows.push(blackoutWin);
      }
    });
  }

  function releaseExamLockdown() {
    if (!isExamLockedDown) return;
    isExamLockedDown = false;
    console.log('>>> RELEASING EXAM LOCKDOWN');

    if (lockdownInterval) {
        clearInterval(lockdownInterval);
        lockdownInterval = null;
    }

    // 1. Restore normal window
    mainWindow.setAlwaysOnTop(false);
    if (mainWindow.isFullScreen()) mainWindow.setFullScreen(false);
    mainWindow.maximize();

    // 2. Close blackout windows
    blackoutWindows.forEach(win => {
      if (!win.isDestroyed()) win.close();
    });
    blackoutWindows = [];
  }

  // Detect entering or leaving an exam
  mainWindow.webContents.on('did-navigate', (event, url) => {
    // Determine if the destination is an exam interface or the new verification flow
    const isExamPage = url.includes('/main_') || url.includes('/exam-session.html') || url.includes('/test.html') || url.includes('/recovered_main');
    // Determine if the destination is the safe lobby
    const isSafePage = url.includes('/dashboard.html') || url.includes('/index.html') || url.endsWith('/exam-portal/');

    if (isExamPage) {
      enforceExamLockdown();
    } else if (isSafePage) {
      releaseExamLockdown();
    }
  });
  // -------------------------------------

  // NO AUTO-RELOADS: Stop the loops.
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    console.error('>>> LOAD ERROR:', errorDescription, 'URL:', validatedURL);
  });

  mainWindow.webContents.on('render-process-gone', (event, detailed) => {
    console.error('>>> RENDER PROCESS GONE:', detailed.reason, detailed.exitCode);
  });
}

app.whenReady().then(() => {
  createWindow();

  // Auto-Updater Integration
  if (!isDev) {
    autoUpdater.on('update-available', () => {
      console.log('Update available. Downloading...');
    });

    autoUpdater.on('update-downloaded', (info) => {
      dialog.showMessageBox({
        type: 'info',
        title: 'Mandatory Update Found',
        message: 'A critical security update (version ' + info.version + ') has been downloaded. The application will now restart to apply this update.',
        buttons: ['Update Now']
      }).then(() => {
        autoUpdater.quitAndInstall();
      });
    });
    
    autoUpdater.on('error', (err) => {
        console.error('AutoUpdater Error:', err);
    });

    // Check every 10 minutes for updates
    setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
    }, 10 * 60 * 1000);

    autoUpdater.checkForUpdatesAndNotify();
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Explicitly request Camera/Microphone access on macOS
  if (process.platform === 'darwin') {
    systemPreferences.askForMediaAccess('camera').then(granted => {
      console.log('Camera access granted:', granted);
    });
    systemPreferences.askForMediaAccess('microphone').then(granted => {
      console.log('Microphone access granted:', granted);
    });
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for safe communication
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.on('exit-app', () => app.quit());
