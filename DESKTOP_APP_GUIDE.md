# DC SafeBrowser - Desktop Application Guide

This folder contains the source code for the dedicated **SafeBrowser**, a secure exam environment built with Electron.js.

## Key Features
- **Kiosk Mode**: Automatically enters full-screen and locks the system to the exam window.
- **Advanced Proctoring**: Enables strict security blocks (tab switching, devtools, right-click, etc.) that are normally restricted in standard browsers.
- **Cross-Platform**: Can be built for Windows (.exe), macOS (.dmg), and Linux (.AppImage).

---

## Prerequisites
- **Node.js**: Ensure you have Node.js installed on your machine.
- **Git**: Ensure the repository is cloned locally.

---

## Installation & Development

1. **Navigate to the app directory**:
   ```bash
   cd desktop-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run in development mode**:
   ```bash
   npm start
   ```
   *Note: In development mode, lockdown features are relaxed to allow for debugging.*

---

## Building the Production App

To generate the installer for your operating system, use the following commands:

### Windows (.exe)
```bash
npm run build:win
```

### macOS (.dmg)
```bash
npm run build:mac
```

### Linux (.AppImage)
```bash
npm run build:linux
```

The resulting installers will be located in the `desktop-app/dist` folder.

---

## Security Notes
The SafeBrowser communicates with the main exam portal via a secure preload script. It exposes a minimal `window.electronAPI` object to the renderer process to identify the environment and trigger lockdown logic in `test.js`.
