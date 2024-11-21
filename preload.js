const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainProcess = contextBridge.exposeInMainWorld;

contextBridge.exposeInMainWorld('electronAPI', {
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    closeWindow: () => ipcRenderer.send('close-window')
});
