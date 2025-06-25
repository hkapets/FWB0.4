// Допоміжні функції для роботи з Electron API

// Перевіряємо чи працює в Electron
export const isElectron = () => {
  return !!(window as any).electronAPI;
};

// Отримуємо Electron API
export const getElectronAPI = () => {
  return (window as any).electronAPI;
};

// Налаштування для Electron
export const electronConfig = {
  // Показати нативний діалог збереження
  showSaveDialog: async (options: any) => {
    if (!isElectron()) return null;
    return await getElectronAPI().showSaveDialog(options);
  },

  // Показати нативний діалог відкриття
  showOpenDialog: async (options: any) => {
    if (!isElectron()) return null;
    return await getElectronAPI().showOpenDialog(options);
  },

  // Зберегти значення в локальному сховищі Electron
  setStoreValue: async (key: string, value: any) => {
    if (!isElectron()) {
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }
    return await getElectronAPI().setStoreValue(key, value);
  },

  // Отримати значення з локального сховища Electron
  getStoreValue: async (key: string) => {
    if (!isElectron()) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return await getElectronAPI().getStoreValue(key);
  },

  // Отримати версію застосунку
  getVersion: async () => {
    if (!isElectron()) return '1.0.0-web';
    return await getElectronAPI().getVersion();
  },

  // Підписатися на події Electron
  onImportWorld: (callback: (event: any, filePath: string) => void) => {
    if (!isElectron()) return;
    getElectronAPI().onImportWorld(callback);
  },

  onExportWorld: (callback: () => void) => {
    if (!isElectron()) return;
    getElectronAPI().onExportWorld(callback);
  },

  onSaveWorld: (callback: () => void) => {
    if (!isElectron()) return;
    getElectronAPI().onSaveWorld(callback);
  },

  // Очистити слухачі подій
  removeAllListeners: (channel: string) => {
    if (!isElectron()) return;
    getElectronAPI().removeAllListeners(channel);
  },

  // Платформа
  getPlatform: () => {
    if (!isElectron()) return 'web';
    return getElectronAPI().platform;
  }
};

// Хук для використання Electron функцій
export const useElectron = () => {
  return {
    isElectron: isElectron(),
    ...electronConfig
  };
};

// Утиліти для роботы з файлами
export const fileUtils = {
  // Експорт світу в файл
  exportWorldToFile: async (worldData: any, worldName: string) => {
    if (isElectron()) {
      const result = await electronConfig.showSaveDialog({
        title: 'Експортувати світ',
        defaultPath: `${worldName}_export.json`,
        filters: [
          { name: 'World Files', extensions: ['json'] }
        ]
      });

      if (!result.canceled && result.filePath) {
        // В Electron можемо зберегти через Node.js API
        // Поки що повертаємо результат для подальшої обробки
        return result.filePath;
      }
    } else {
      // У веб-версії використовуємо стандартний спосіб
      const blob = new Blob([JSON.stringify(worldData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${worldName}_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    }
    return false;
  },

  // Імпорт світу з файлу
  importWorldFromFile: async (): Promise<any> => {
    if (isElectron()) {
      const result = await electronConfig.showOpenDialog({
        title: 'Імпортувати світ',
        filters: [
          { name: 'World Files', extensions: ['json'] }
        ],
        properties: ['openFile']
      });

      if (!result.canceled && result.filePaths.length > 0) {
        // Повертаємо шлях до файлу для читання через Node.js
        return result.filePaths[0];
      }
    } else {
      // У веб-версії використовуємо input[type="file"]
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const data = JSON.parse(e.target?.result as string);
                resolve(data);
              } catch (error) {
                console.error('Error parsing file:', error);
                resolve(null);
              }
            };
            reader.readAsText(file);
          } else {
            resolve(null);
          }
        };
        input.click();
      });
    }
    return null;
  }
};