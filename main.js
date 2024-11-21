const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 500,  // Changed from 450 to 500
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: false,
    resizable: false  // Disable window resizing
  });

  mainWindow.loadFile('index.html');
}

ipcMain.on('minimize-window', () => {
  BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.on('close-window', () => {
  BrowserWindow.getFocusedWindow().close();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
