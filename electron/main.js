const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { fork } = require('child_process');
const Store = require('electron-store');

// Створюємо сховище для налаштувань
const store = new Store();

let mainWindow;
let serverProcess;

function createWindow() {
  // Створюємо вікно браузера
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    // icon: path.join(__dirname, 'assets', 'icon.png'), // Буде додано пізніше
    show: false, // Не показувати поки не завантажено
    titleBarStyle: 'default',
    backgroundColor: '#0a0a0a', // Темний фон
  });

  // Завантажуємо застосунок
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL('http://127.0.0.1:3001');
  }

  // Показуємо вікно коли готове
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Відновлюємо стан вікна
    const windowState = store.get('windowState');
    if (windowState) {
      mainWindow.setBounds(windowState);
      if (windowState.isMaximized) {
        mainWindow.maximize();
      }
    }
  });

  // Зберігаємо стан вікна при закритті
  mainWindow.on('close', () => {
    const bounds = mainWindow.getBounds();
    store.set('windowState', {
      ...bounds,
      isMaximized: mainWindow.isMaximized()
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startExpressServer() {
  if (isDev) {
    // У режимі розробки сервер вже запущений
    return;
  }
  
  // У продакшені запускаємо Electron сервер
  const ElectronServer = require('../server/electron-server');
  const server = new ElectronServer();
  
  server.start(3001).then(() => {
    console.log('Electron server started on port 3001');
  }).catch(err => {
    console.error('Failed to start Electron server:', err);
  });
  
  // Зберігаємо сервер для закриття пізніше
  global.electronServer = server;
}

// Створюємо меню
function createMenu() {
  const template = [
    {
      label: 'Fantasy World Builder',
      submenu: [
        {
          label: 'Про програму',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Про програму',
              message: 'Fantasy World Builder',
              detail: 'Конструктор фентезійних світів\nВерсія 1.0.0'
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Налаштування',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              window.location.hash = '/settings';
            `);
          }
        },
        { type: 'separator' },
        {
          label: 'Вихід',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Файл',
      submenu: [
        {
          label: 'Новий світ',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.executeJavaScript(`
              window.location.hash = '/create-world';
            `);
          }
        },
        {
          label: 'Відкрити світ',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'World Files', extensions: ['json'] }
              ]
            });
            
            if (!result.canceled && result.filePaths.length > 0) {
              // Відправляємо подію для імпорту світу
              mainWindow.webContents.send('import-world', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Зберегти',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('save-world');
          }
        },
        {
          label: 'Експортувати світ',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('export-world');
          }
        }
      ]
    },
    {
      label: 'Редагування',
      submenu: [
        { role: 'undo', label: 'Скасувати' },
        { role: 'redo', label: 'Повторити' },
        { type: 'separator' },
        { role: 'cut', label: 'Вирізати' },
        { role: 'copy', label: 'Копіювати' },
        { role: 'paste', label: 'Вставити' },
        { role: 'selectall', label: 'Вибрати все' }
      ]
    },
    {
      label: 'Вигляд',
      submenu: [
        { role: 'reload', label: 'Перезавантажити' },
        { role: 'forceReload', label: 'Примусове перезавантаження' },
        { role: 'toggleDevTools', label: 'Інструменти розробника' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Скинути масштаб' },
        { role: 'zoomIn', label: 'Збільшити' },
        { role: 'zoomOut', label: 'Зменшити' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Повноекранний режим' }
      ]
    },
    {
      label: 'Допомога',
      submenu: [
        {
          label: 'Документація',
          click: () => {
            require('electron').shell.openExternal('https://github.com/your-repo/fantasy-world-builder');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Обробники IPC
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('get-store-value', (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
  return true;
});

// Події застосунку
app.whenReady().then(() => {
  startExpressServer();
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (global.electronServer) {
    global.electronServer.stop();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (global.electronServer) {
    global.electronServer.stop();
  }
});