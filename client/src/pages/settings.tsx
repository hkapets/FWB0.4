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

  const handleResetData = () => {
    toast({
      title: "Reset Confirmation",
      description: "This action would permanently delete all world data.",
      variant: "destructive",
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-fantasy font-bold text-yellow-200 mb-2 flex items-center">
            <SettingsIcon className="mr-3" />
            Settings
          </h1>
          <p className="text-lg text-gray-300">
            Customize your Fantasy World Builder experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <Card className="fantasy-border">
            <CardHeader>
              <CardTitle className="text-yellow-200 font-fantasy">
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isDarkMode ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-gray-400">
                      Use dark theme for the interface
                    </p>
                  </div>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Fantasy Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-600 cursor-pointer">
                    <div className="w-full h-4 bg-gradient-to-r from-purple-600 to-purple-800 rounded mb-2"></div>
                    <p className="text-xs text-center">Purple (Active)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-900/30 border border-green-600 cursor-pointer opacity-50">
                    <div className="w-full h-4 bg-gradient-to-r from-green-600 to-green-800 rounded mb-2"></div>
                    <p className="text-xs text-center">Forest</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-600 cursor-pointer opacity-50">
                    <div className="w-full h-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded mb-2"></div>
                    <p className="text-xs text-center">Ocean</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audio & Notifications */}
          <Card className="fantasy-border">
            <CardHeader>
              <CardTitle className="text-yellow-200 font-fantasy">
                Audio & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-4 w-4" />
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
