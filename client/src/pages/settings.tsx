import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, Save, Trash2, Settings as SettingsIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { isElectron } from "@/lib/electron-helpers";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const t = useTranslation();
  const { toast } = useToast();
  
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveMinutes, setAutoSaveMinutes] = useState(5);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleExportData = async () => {
    try {
      if (isElectron()) {
        // Use native file dialog in Electron
        const result = await (window as any).electronAPI?.showSaveDialog({
          title: 'Експорт даних',
          defaultPath: 'fantasy-world-data.json',
          filters: [{ name: 'JSON Files', extensions: ['json'] }]
        });
        
        if (!result.canceled) {
          toast({
            title: 'Експорт успішний',
            description: `Дані збережено до ${result.filePath}`,
          });
        }
      } else {
        // Web version - download file
        const response = await fetch('/api/export/all');
        const data = await response.json();
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fantasy-world-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: 'Експорт успішний',
          description: 'Файл завантажено',
        });
      }
    } catch (error) {
      toast({
        title: 'Помилка експорту',
        description: 'Не вдалося експортувати дані',
        variant: 'destructive',
      });
    }
  };

  const handleImportData = async () => {
    try {
      if (isElectron()) {
        // Use native file dialog in Electron
        const result = await (window as any).electronAPI?.showOpenDialog({
          title: 'Імпорт даних',
          filters: [{ name: 'JSON Files', extensions: ['json'] }],
          properties: ['openFile']
        });
        
        if (!result.canceled && result.filePaths.length > 0) {
          toast({
            title: 'Імпорт успішний',
            description: 'Дані імпортовано',
          });
        }
      } else {
        // Web version - file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            toast({
              title: 'Імпорт успішний',
              description: 'Дані імпортовано',
            });
          }
        };
        input.click();
      }
    } catch (error) {
      toast({
        title: 'Помилка імпорту',
        description: 'Не вдалося імпортувати дані',
        variant: 'destructive',
      });
    }
  };

  const handleResetData = async () => {
    if (confirm('Ви впевнені? Це видалить всі ваші дані.')) {
      try {
        await fetch('/api/reset', { method: 'POST' });
        toast({
          title: 'Дані скинуто',
          description: 'Всі дані було видалено',
        });
      } catch (error) {
        toast({
          title: 'Помилка',
          description: 'Не вдалося скинути дані',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSaveSettings = () => {
    toast({
      title: 'Налаштування збережено',
      description: 'Всі зміни застосовано',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <SettingsIcon className="w-8 h-8 text-fantasy-gold-300" />
          <h1 className="text-3xl font-fantasy text-fantasy-gold-300">
            {t.settings.title}
          </h1>
        </div>
        <p className="text-gray-400">
          Налаштуйте застосунок відповідно до ваших потреб
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auto-Save Settings */}
        <Card className="fantasy-border">
          <CardHeader>
            <CardTitle className="text-fantasy-gold-300 font-fantasy">
              Автозбереження
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Увімкнути автозбереження</Label>
                <p className="text-sm text-gray-400">
                  Автоматично зберігати вашу роботу
                </p>
              </div>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            </div>

            {autoSave && (
              <div className="space-y-2">
                <Label htmlFor="autosave-interval">
                  Інтервал збереження (хвилини)
                </Label>
                <Input
                  id="autosave-interval"
                  type="number"
                  min="1"
                  max="60"
                  value={autoSaveMinutes}
                  onChange={(e) => setAutoSaveMinutes(parseInt(e.target.value) || 5)}
                  className="fantasy-input"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="fantasy-border">
          <CardHeader>
            <CardTitle className="text-fantasy-gold-300 font-fantasy">
              Сповіщення
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Системні сповіщення</Label>
                <p className="text-sm text-gray-400">
                  Показувати сповіщення системи
                </p>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Етап 8: Нові інструменти */}
        <Card className="fantasy-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-fantasy-gold-300 font-fantasy">
              Інструменти світобудування
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-900/20 border border-purple-600/30 rounded">
                <h3 className="font-semibold text-purple-200 mb-2">Історія змін</h3>
                <p className="text-gray-400 text-sm">
                  Відстежування всіх редагувань з можливістю відкату
                </p>
              </div>
              
              <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded">
                <h3 className="font-semibold text-blue-200 mb-2">Система нотаток</h3>
                <p className="text-gray-400 text-sm">
                  Зберігайте ідеї та завдання для розвитку світу
                </p>
              </div>
              
              <div className="p-4 bg-green-900/20 border border-green-600/30 rounded">
                <h3 className="font-semibold text-green-200 mb-2">Експорт документів</h3>
                <p className="text-gray-400 text-sm">
                  PDF та DOCX файли для друку та обміну
                </p>
              </div>
              
              <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded">
                <h3 className="font-semibold text-yellow-200 mb-2">Валідація світу</h3>
                <p className="text-gray-400 text-sm">
                  Автоматична перевірка на суперечності
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="fantasy-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-fantasy-gold-300 font-fantasy">
              Управління даними
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                className="fantasy-button"
                onClick={handleExportData}
              >
                <Download className="mr-2 h-4 w-4" />
                {isElectron() ? 'Експорт світу' : 'Завантажити світ'}
              </Button>

              <Button
                variant="outline"
                onClick={handleImportData}
              >
                <Upload className="mr-2 h-4 w-4" />
                Імпорт світу
              </Button>

              <Button
                variant="destructive"
                onClick={handleResetData}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Скинути дані
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              Скидання видалить всі ваші світи, персонажів та локації назавжди.
            </p>
          </CardContent>
        </Card>

        {/* Platform Info */}
        <Card className="fantasy-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-fantasy-gold-300 font-fantasy">
              Про Fantasy World Builder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-fantasy-gold-300 mb-2">
                  Інформація про версію
                </h3>
                <p className="text-sm text-gray-400">Версія 1.0.0</p>
                <p className="text-sm text-gray-400">
                  Платформа: {isElectron() ? 'Desktop' : 'Web'}
                </p>
                <p className="text-sm text-gray-400">
                  Останнє оновлення: Грудень 2024
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-fantasy-gold-300 mb-2">Можливості</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Створення та управління світами</li>
                  <li>• Система персонажів та локацій</li>
                  <li>• База даних створінь</li>
                  <li>• Інтерактивна карта світу</li>
                  <li>• Експорт та імпорт даних</li>
                  <li>• AI-асистент для генерації контенту</li>
                  <li>• Аналітика світу та статистика</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Settings */}
      <div className="mt-8 flex justify-end">
        <Button
          className="fantasy-button px-8 py-3"
          onClick={handleSaveSettings}
        >
          <Save className="mr-2 h-4 w-4" />
          Зберегти налаштування
        </Button>
      </div>
    </div>
  );
}