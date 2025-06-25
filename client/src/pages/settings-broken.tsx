import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Settings } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useElectron, fileUtils } from "@/lib/electron-helpers";

export default function SettingsPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const { isElectron, getVersion } = useElectron();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  const worldId = 1; // TODO: отримати з контексту

  useEffect(() => {
    // Отримуємо версію застосунку
    getVersion().then(version => {
      setAppVersion(version);
    });
  }, []);

  const handleExportWorld = async () => {
    setIsExporting(true);
    try {
      // Збираємо всі дані світу
      const responses = await Promise.all([
        fetch(`/api/worlds/${worldId}`),
        fetch(`/api/worlds/${worldId}/characters`),
        fetch(`/api/worlds/${worldId}/locations`),
        fetch(`/api/worlds/${worldId}/creatures`),
        fetch(`/api/worlds/${worldId}/events`),
        fetch(`/api/worlds/${worldId}/artifacts`),
        fetch(`/api/worlds/${worldId}/races`),
        fetch(`/api/worlds/${worldId}/classes`),
        fetch(`/api/worlds/${worldId}/magic_types`),
        fetch(`/api/worlds/${worldId}/lore`),
      ]);
      
      const [
        world,
        characters,
        locations,
        creatures,
        events,
        artifacts,
        races,
        classes,
        magic,
        lore,
      ] = await Promise.all(responses.map(r => r.json()));
      
      const exportData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        platform: isElectron ? "desktop" : "web",
        world,
        characters,
        locations,
        creatures,
        events,
        artifacts,
        races,
        classes,
        magic,
        lore,
      };
      
      const success = await fileUtils.exportWorldToFile(exportData, world.name || 'world');
      
      if (success) {
        toast({
          title: "Експорт завершено",
          description: "Світ успішно експортовано",
        });
      }
    } catch (error) {
      toast({
        title: "Помилка експорту",
        description: "Не вдалося експортувати світ",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleImportWorld = async () => {
    setIsImporting(true);
    try {
      const importData = await fileUtils.importWorldFromFile();
      
      if (importData) {
        // Тут буде логіка імпорту світу
        console.log("Import data:", importData);
        
        toast({
          title: "Імпорт готується",
          description: "Функція імпорту світу буде додана незабаром",
        });
      }
    } catch (error) {
      toast({
        title: "Помилка імпорту",
        description: "Не вдалося імпортувати світ",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-fantasy font-bold text-fantasy-gold-400 mb-6">
        {t.navigation.settings}
      </h1>
      
      <div className="space-y-6">
        {/* Експорт/Імпорт */}
        <Card className="fantasy-border bg-black/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Експорт та Імпорт
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-yellow-200 font-semibold mb-2">Експорт світу</h4>
              <p className="text-gray-400 text-sm mb-3">
                Експортуйте весь світ у файл JSON для резервного копіювання або перенесення
              </p>
              <Button 
                onClick={handleExportWorld}
                disabled={isExporting}
                className="fantasy-button"
              >
                {isExporting ? (
                  <>Експортую...</>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Експортувати світ
                  </>
                )}
              </Button>
            </div>
            
            <div>
              <h4 className="text-yellow-200 font-semibold mb-2">Імпорт світу</h4>
              <p className="text-gray-400 text-sm mb-3">
                Імпортуйте світ з файлу JSON (увага: це замінить поточні дані)
              </p>
              <Button
                onClick={handleImportWorld}
                disabled={isImporting}
                className="fantasy-button"
              >
                {isImporting ? (
                  <>Імпортую...</>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Вибрати файл
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Інформація про застосунок */}
        <Card className="fantasy-border bg-black/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Про застосунок
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Версія:</span>
              <span className="text-yellow-200">{appVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Платформа:</span>
              <span className="text-yellow-200">
                {isElectron ? 'Desktop' : 'Web'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">База даних:</span>
              <span className="text-yellow-200">
                {isElectron ? 'SQLite (локальна)' : 'PostgreSQL'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Загальні налаштування */}
        <Card className="fantasy-border bg-black/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Загальні налаштування
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Додаткові налаштування застосунку будуть додані в майбутніх версіях.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
                  <div>
                    <Label>Mute All Audio</Label>
                    <p className="text-sm text-gray-400">
                      Disable all music and sound effects
                    </p>
                  </div>
                </div>
                <Switch checked={muted} onCheckedChange={setMuted} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-4 w-4" />
                  <div>
                    <Label>Volume</Label>
                    <p className="text-sm text-gray-400">
                      Adjust global audio volume
                    </p>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="ml-2 w-32 accent-yellow-400 bg-purple-900 rounded-lg h-2 cursor-pointer"
                  style={{ accentColor: "#facc15" }}
                  aria-label="Гучність"
                  disabled={muted}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-4 w-4" />
                  <div>
                    <Label>Notifications</Label>
                    <p className="text-sm text-gray-400">
                      Show system notifications
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Auto-Save Settings */}
          <Card className="fantasy-border">
            <CardHeader>
              <CardTitle className="text-yellow-200 font-fantasy">
                Auto-Save
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Auto-Save</Label>
                  <p className="text-sm text-gray-400">
                    Automatically save your work
                  </p>
                </div>
                <Switch checked={autoSave} onCheckedChange={setAutoSave} />
              </div>

              {autoSave && (
                <div className="space-y-2">
                  <Label htmlFor="autosave-interval">
                    Save Interval (minutes)
                  </Label>
                  <Input
                    id="autosave-interval"
                    type="number"
                    min="1"
                    max="60"
                    value={autoSaveMinutes}
                    onChange={(e) =>
                      setAutoSaveMinutes(parseInt(e.target.value) || 5)
                    }
                    className="fantasy-input"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="fantasy-border">
            <CardHeader>
              <CardTitle className="text-yellow-200 font-fantasy">
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full fantasy-button"
                onClick={handleExportData}
              >
                <Download className="mr-2 h-4 w-4" />
                Export All Worlds
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleImportData}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Worlds
              </Button>

              <Separator />

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleResetData}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Reset All Data
              </Button>
              <p className="text-xs text-gray-500">
                This will permanently delete all your worlds, characters, and
                locations.
              </p>
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
            Save Settings
          </Button>
        </div>

        {/* About Section */}
        <Card className="fantasy-border mt-6">
          <CardHeader>
            <CardTitle className="text-yellow-200 font-fantasy">
              About Fantasy World Builder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-yellow-300 mb-2">
                  Version Information
                </h3>
                <p className="text-sm text-gray-400">Version 1.0.0</p>
                <p className="text-sm text-gray-400">
                  Built with React & Express
                </p>
                <p className="text-sm text-gray-400">
                  Last Updated: December 2024
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-300 mb-2">Features</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• World Creation & Management</li>
                  <li>• Character & Location System</li>
                  <li>• Creature Database</li>
                  <li>• Interactive World Map</li>
                  <li>• Data Export & Import</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
