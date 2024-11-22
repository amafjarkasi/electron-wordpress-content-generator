const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainProcess = contextBridge.exposeInMainWorld;

contextBridge.exposeInMainWorld('electronAPI', {
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),
    // Add database operations
    dbGet: (key) => ipcRenderer.invoke('db:get', key),
    dbSet: (key, value) => ipcRenderer.invoke('db:set', key, value),
    dbPush: (key, value) => ipcRenderer.invoke('db:push', key, value),
    // WordPress API methods
    initializeWordPress: () => ipcRenderer.invoke('wp:initialize'),
    testWordPressConnection: (settings) => ipcRenderer.invoke('wp:testConnection', settings),
    generateContent: (params) => ipcRenderer.invoke('generate-content', params),
    publishToWordPress: (params) => ipcRenderer.invoke('publish-to-wordpress', params),
    // Dashboard events
    onDashboardStats: (callback) => ipcRenderer.on('wp:dashboard-stats', callback),
    // Keyword research methods
    findKeywords: (params) => ipcRenderer.invoke('find-keywords', params),
    saveKeywords: (keywords) => ipcRenderer.invoke('save-keywords', keywords),
    getSavedKeywords: () => ipcRenderer.invoke('get-saved-keywords'),
    deleteSavedKeyword: (keyword) => ipcRenderer.invoke('delete-saved-keyword', keyword),
});
