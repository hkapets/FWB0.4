// Windows-специфічні інтеграції

export interface WindowsAPI {
  showNotification: (title: string, body: string) => void;
  onOpenWorldFile: (callback: (filePath: string) => void) => void;
  getSystemTheme: () => Promise<'light' | 'dark'>;
  onThemeChanged: (callback: (theme: 'light' | 'dark') => void) => void;
  createBackup: (worldData: any) => Promise<string>;
  restoreBackup: (backupPath: string) => Promise<any>;
}

export const isWindows = process.platform === 'win32';

// Перевірка наявності Windows API
export const windowsAPI: WindowsAPI | null = 
  typeof window !== 'undefined' && (window as any).electronAPI
    ? (window as any).electronAPI
    : null;

// Системні сповіщення
export function showWindowsNotification(title: string, message: string) {
  if (windowsAPI) {
    windowsAPI.showNotification(title, message);
  } else {
    // Fallback для веб-версії
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  }
}

// Автоматичні бекапи
export class AutoBackupManager {
  private intervalId: NodeJS.Timeout | null = null;
  
  start(intervalMinutes: number = 30) {
    this.stop(); // Зупинити попередній інтервал
    
    this.intervalId = setInterval(async () => {
      try {
        const worldData = await this.getCurrentWorldData();
        if (worldData && windowsAPI) {
          const backupPath = await windowsAPI.createBackup(worldData);
          console.log('Auto backup created:', backupPath);
          
          showWindowsNotification(
            'Бекап створено',
            'Автоматичний бекап світу збережено'
          );
        }
      } catch (error) {
        console.error('Auto backup failed:', error);
      }
    }, intervalMinutes * 60 * 1000);
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  private async getCurrentWorldData() {
    // Отримати дані поточного світу
    // Тут буде API запит до backend
    return null;
  }
}

// Обробка .fwb файлів
export function setupFileAssociationHandler(
  onWorldFileOpen: (worldData: any) => void
) {
  if (windowsAPI) {
    windowsAPI.onOpenWorldFile(async (filePath: string) => {
      try {
        if (filePath.endsWith('.fwb')) {
          const worldData = await windowsAPI.restoreBackup(filePath);
          onWorldFileOpen(worldData);
          
          showWindowsNotification(
            'Світ відкрито',
            `Завантажено світ з файлу ${filePath.split('\\').pop()}`
          );
        }
      } catch (error) {
        console.error('Failed to open world file:', error);
        showWindowsNotification(
          'Помилка',
          'Не вдалося відкрити файл світу'
        );
      }
    });
  }
}

// Системна тема
export async function getSystemTheme(): Promise<'light' | 'dark'> {
  if (windowsAPI) {
    return await windowsAPI.getSystemTheme();
  }
  
  // Fallback для веб-версії
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void) {
  if (windowsAPI) {
    windowsAPI.onThemeChanged(callback);
  } else {
    // Fallback для веб-версії
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      callback(e.matches ? 'dark' : 'light');
    });
  }
}

// Експорт з сповіщенням
export async function exportWithNotification(
  exportFunction: () => Promise<void>,
  exportType: string
) {
  try {
    await exportFunction();
    showWindowsNotification(
      'Експорт завершено',
      `${exportType} файл успішно створено`
    );
  } catch (error) {
    showWindowsNotification(
      'Помилка експорту',
      `Не вдалося створити ${exportType} файл`
    );
    throw error;
  }
}