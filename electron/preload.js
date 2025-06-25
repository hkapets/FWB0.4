const { contextBridge, ipcRenderer } = require('electron');

// Безпечно експонуємо API для рендер процесу
contextBridge.exposeInMainWorld('electronAPI', {
  // Версія застосунку
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Діалоги
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Сховище
  getStoreValue: (key) => ipcRenderer.invoke('get-store-value', key),
  setStoreValue: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
  
  // Події від головного процесу
  onImportWorld: (callback) => ipcRenderer.on('import-world', callback),
  onExportWorld: (callback) => ipcRenderer.on('export-world', callback),
  onSaveWorld: (callback) => ipcRenderer.on('save-world', callback),
  
  // Очищення слухачів
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Платформа
  platform: process.platform,
  
  // Є Electron
  isElectron: true
});