import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, Package, Play, Pause, Trash2, RefreshCw, 
  AlertTriangle, CheckCircle, Info, ExternalLink, Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PluginStore from './plugin-store';

interface InstalledPlugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: string;
  enabled: boolean;
  permissions: string[];
  size: string;
  installDate: string;
  updateAvailable?: boolean;
  status: 'active' | 'inactive' | 'error';
}

interface PluginManagerProps {
  language?: 'uk' | 'pl' | 'en';
}

export default function PluginManager({ language = 'uk' }: PluginManagerProps) {
  const { toast } = useToast();
  const [installedPlugins, setInstalledPlugins] = useState<InstalledPlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('installed');

  useEffect(() => {
    loadInstalledPlugins();
  }, []);

  const loadInstalledPlugins = async () => {
    setLoading(true);
    try {
      // Mock data для демонстрації
      const mockPlugins: InstalledPlugin[] = [
        {
          id: 'procedural-city-gen',
          name: 'Procedural City Generator',
          version: '2.1.0',
          author: 'CityBuilder Studios',
          description: 'Автоматично генерує детальні міста з районами та вулицями.',
          category: 'world-generators',
          enabled: true,
          permissions: ['read:world', 'write:world'],
          size: '2.4 MB',
          installDate: '2024-12-15',
          updateAvailable: false,
          status: 'active'
        },
        {
          id: 'auto-backup-manager',
          name: 'Auto Backup Manager',
          version: '2.0.0',
          author: 'Safety First',
          description: 'Автоматичне створення резервних копій світів.',
          category: 'automation',
          enabled: true,
          permissions: ['read:world', 'fs:limited'],
          size: '1.2 MB',
          installDate: '2024-12-10',
          updateAvailable: false,
          status: 'active'
        },
        {
          id: 'old-plugin-example',
          name: 'Old Plugin Example',
          version: '1.0.0',
          author: 'Legacy Dev',
          description: 'Застарілий приклад плагіна для демонстрації.',
          category: 'utilities',
          enabled: false,
          permissions: ['read:world'],
          size: '0.8 MB',
          installDate: '2024-11-20',
          updateAvailable: true,
          status: 'inactive'
        }
      ];

      setInstalledPlugins(mockPlugins);
    } catch (error) {
      toast({
        title: getLocalizedText('error', language),
        description: getLocalizedText('loadPluginsError', language),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      setInstalledPlugins(prev => 
        prev.map(plugin => 
          plugin.id === pluginId 
            ? { ...plugin, enabled, status: enabled ? 'active' : 'inactive' }
            : plugin
        )
      );

      toast({
        title: enabled ? getLocalizedText('pluginEnabled', language) : getLocalizedText('pluginDisabled', language),
        description: getLocalizedText('settingsUpdated', language),
      });
    } catch (error) {
      toast({
        title: getLocalizedText('error', language),
        description: getLocalizedText('failedToTogglePlugin', language),
        variant: 'destructive',
      });
    }
  };

  const uninstallPlugin = async (pluginId: string) => {
    try {
      setInstalledPlugins(prev => prev.filter(plugin => plugin.id !== pluginId));
      
      toast({
        title: getLocalizedText('pluginUninstalled', language),
        description: getLocalizedText('uninstalledSuccessfully', language),
      });
    } catch (error) {
      toast({
        title: getLocalizedText('uninstallationFailed', language),
        description: getLocalizedText('tryAgainLater', language),
        variant: 'destructive',
      });
    }
  };

  const updatePlugin = async (pluginId: string) => {
    try {
      setInstalledPlugins(prev =>
        prev.map(plugin =>
          plugin.id === pluginId
            ? { ...plugin, updateAvailable: false, version: '2.1.0' }
            : plugin
        )
      );

      toast({
        title: getLocalizedText('pluginUpdated', language),
        description: getLocalizedText('updateSuccessful', language),
      });
    } catch (error) {
      toast({
        title: getLocalizedText('updateFailed', language),
        description: getLocalizedText('tryAgainLater', language),
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-gray-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'inactive': return <Pause className="w-4 h-4 text-gray-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderInstalledPlugin = (plugin: InstalledPlugin) => (
    <Card key={plugin.id} className="fantasy-border bg-black/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-purple-200">{plugin.name}</h3>
                {plugin.updateAvailable && (
                  <Badge className="bg-orange-900/20 text-orange-200 border-orange-600/30">
                    {getLocalizedText('updateAvailable', language)}
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-400 text-sm mb-2">{plugin.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{getLocalizedText('by', language)} {plugin.author}</span>
                <span>v{plugin.version}</span>
                <span>{plugin.size}</span>
                <span>{getLocalizedText('installed', language)} {new Date(plugin.installDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusIcon(plugin.status)}
            <Switch
              checked={plugin.enabled}
              onCheckedChange={(enabled) => togglePlugin(plugin.id, enabled)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {plugin.permissions.map(permission => (
              <Badge key={permission} variant="secondary" className="text-xs">
                {permission}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {plugin.updateAvailable && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updatePlugin(plugin.id)}
                className="gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                {getLocalizedText('update', language)}
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
            >
              <Settings className="w-3 h-3" />
              {getLocalizedText('configure', language)}
            </Button>
            
            <Button
              size="sm"
              variant="destructive"
              onClick={() => uninstallPlugin(plugin.id)}
              className="gap-1"
            >
              <Trash2 className="w-3 h-3" />
              {getLocalizedText('uninstall', language)}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-fantasy text-fantasy-gold-300 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          {getLocalizedText('pluginManager', language)}
        </h2>
        
        <Button className="fantasy-button gap-2">
          <Upload className="w-4 h-4" />
          {getLocalizedText('installFromFile', language)}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="installed" className="text-gray-300 gap-2">
            <Package className="w-4 h-4" />
            {getLocalizedText('installed', language)} ({installedPlugins.length})
          </TabsTrigger>
          <TabsTrigger value="store" className="text-gray-300 gap-2">
            <ExternalLink className="w-4 h-4" />
            {getLocalizedText('store', language)}
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-gray-300 gap-2">
            <Settings className="w-4 h-4" />
            {getLocalizedText('settings', language)}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="installed" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="fantasy-border bg-black/20">
                  <CardContent className="p-4">
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : installedPlugins.length === 0 ? (
            <Card className="fantasy-border bg-black/20">
              <CardContent className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400 mb-4">{getLocalizedText('noPluginsInstalled', language)}</p>
                <Button onClick={() => setActiveTab('store')} className="fantasy-button">
                  {getLocalizedText('browseStore', language)}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {installedPlugins.map(renderInstalledPlugin)}
            </div>
          )}

          {/* Summary */}
          {installedPlugins.length > 0 && (
            <Card className="fantasy-border bg-black/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-300">
                      {installedPlugins.filter(p => p.status === 'active').length}
                    </div>
                    <div className="text-gray-400 text-sm">{getLocalizedText('active', language)}</div>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold text-gray-300">
                      {installedPlugins.filter(p => p.status === 'inactive').length}
                    </div>
                    <div className="text-gray-400 text-sm">{getLocalizedText('inactive', language)}</div>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold text-orange-300">
                      {installedPlugins.filter(p => p.updateAvailable).length}
                    </div>
                    <div className="text-gray-400 text-sm">{getLocalizedText('updatesAvailable', language)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="store">
          <PluginStore 
            language={language}
            onInstallPlugin={(plugin) => {
              // Handle plugin installation
              console.log('Installing plugin:', plugin);
            }}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="fantasy-border bg-black/20">
            <CardHeader>
              <CardTitle className="text-fantasy-gold-300">{getLocalizedText('pluginSettings', language)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-300 font-medium">{getLocalizedText('autoUpdates', language)}</label>
                  <p className="text-gray-400 text-sm">{getLocalizedText('autoUpdatesDescription', language)}</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-300 font-medium">{getLocalizedText('allowBetaPlugins', language)}</label>
                  <p className="text-gray-400 text-sm">{getLocalizedText('betaPluginsDescription', language)}</p>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-gray-300 font-medium">{getLocalizedText('sendUsageData', language)}</label>
                  <p className="text-gray-400 text-sm">{getLocalizedText('usageDataDescription', language)}</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="fantasy-border bg-black/20">
            <CardHeader>
              <CardTitle className="text-fantasy-gold-300">{getLocalizedText('developers', language)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full gap-2">
                <ExternalLink className="w-4 h-4" />
                {getLocalizedText('pluginDocumentation', language)}
              </Button>
              
              <Button variant="outline" className="w-full gap-2">
                <Package className="w-4 h-4" />
                {getLocalizedText('createPlugin', language)}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Локалізація
function getLocalizedText(key: string, language: 'uk' | 'pl' | 'en'): string {
  const texts = {
    uk: {
      pluginManager: 'Менеджер розширень',
      installed: 'Встановлені',
      store: 'Магазин',
      settings: 'Налаштування',
      installFromFile: 'Встановити з файлу',
      noPluginsInstalled: 'Немає встановлених розширень',
      browseStore: 'Переглянути магазин',
      by: 'від',
      updateAvailable: 'Доступне оновлення',
      update: 'Оновити',
      configure: 'Налаштувати',
      uninstall: 'Видалити',
      active: 'Активні',
      inactive: 'Неактивні',
      updatesAvailable: 'Доступні оновлення',
      pluginEnabled: 'Розширення увімкнено',
      pluginDisabled: 'Розширення вимкнено',
      settingsUpdated: 'Налаштування оновлено',
      pluginUninstalled: 'Розширення видалено',
      uninstalledSuccessfully: 'успішно видалено',
      uninstallationFailed: 'Помилка видалення',
      pluginUpdated: 'Розширення оновлено',
      updateSuccessful: 'Оновлення успішне',
      updateFailed: 'Помилка оновлення',
      failedToTogglePlugin: 'Не вдалося перемкнути розширення',
      tryAgainLater: 'Спробуйте пізніше',
      loadPluginsError: 'Помилка завантаження розширень',
      error: 'Помилка',
      pluginSettings: 'Налаштування розширень',
      autoUpdates: 'Автоматичні оновлення',
      autoUpdatesDescription: 'Автоматично оновлювати розширення',
      allowBetaPlugins: 'Дозволити бета-розширення',
      betaPluginsDescription: 'Показувати тестові версії розширень',
      sendUsageData: 'Надсилати дані використання',
      usageDataDescription: 'Допомогти покращити якість розширень',
      developers: 'Для розробників',
      pluginDocumentation: 'Документація API',
      createPlugin: 'Створити розширення'
    },
    pl: {
      pluginManager: 'Menedżer rozszerzeń',
      installed: 'Zainstalowane',
      store: 'Sklep',
      settings: 'Ustawienia',
      installFromFile: 'Zainstaluj z pliku',
      noPluginsInstalled: 'Brak zainstalowanych rozszerzeń',
      browseStore: 'Przeglądaj sklep',
      by: 'od',
      updateAvailable: 'Dostępna aktualizacja',
      update: 'Aktualizuj',
      configure: 'Konfiguruj',
      uninstall: 'Usuń',
      active: 'Aktywne',
      inactive: 'Nieaktywne', 
      updatesAvailable: 'Dostępne aktualizacje',
      pluginEnabled: 'Rozszerzenie włączone',
      pluginDisabled: 'Rozszerzenie wyłączone',
      settingsUpdated: 'Ustawienia zaktualizowane',
      pluginUninstalled: 'Rozszerzenie usunięte',
      uninstalledSuccessfully: 'pomyślnie usunięto',
      uninstallationFailed: 'Błąd usuwania',
      pluginUpdated: 'Rozszerzenie zaktualizowane',
      updateSuccessful: 'Aktualizacja udana',
      updateFailed: 'Błąd aktualizacji',
      failedToTogglePlugin: 'Nie udało się przełączyć rozszerzenia',
      tryAgainLater: 'Spróbuj później',
      loadPluginsError: 'Błąd ładowania rozszerzeń',
      error: 'Błąd',
      pluginSettings: 'Ustawienia rozszerzeń',
      autoUpdates: 'Automatyczne aktualizacje',
      autoUpdatesDescription: 'Automatycznie aktualizuj rozszerzenia',
      allowBetaPlugins: 'Zezwól na rozszerzenia beta',
      betaPluginsDescription: 'Pokaż wersje testowe rozszerzeń',
      sendUsageData: 'Wyślij dane użytkowania',
      usageDataDescription: 'Pomóż ulepszyć jakość rozszerzeń',
      developers: 'Dla deweloperów',
      pluginDocumentation: 'Dokumentacja API',
      createPlugin: 'Utwórz rozszerzenie'
    },
    en: {
      pluginManager: 'Plugin Manager',
      installed: 'Installed',
      store: 'Store',
      settings: 'Settings',
      installFromFile: 'Install from File',
      noPluginsInstalled: 'No plugins installed',
      browseStore: 'Browse Store',
      by: 'by',
      updateAvailable: 'Update Available',
      update: 'Update',
      configure: 'Configure',
      uninstall: 'Uninstall',
      active: 'Active',
      inactive: 'Inactive',
      updatesAvailable: 'Updates Available',
      pluginEnabled: 'Plugin enabled',
      pluginDisabled: 'Plugin disabled',
      settingsUpdated: 'Settings updated',
      pluginUninstalled: 'Plugin uninstalled',
      uninstalledSuccessfully: 'uninstalled successfully',
      uninstallationFailed: 'Uninstallation failed',
      pluginUpdated: 'Plugin updated',
      updateSuccessful: 'Update successful',
      updateFailed: 'Update failed',
      failedToTogglePlugin: 'Failed to toggle plugin',
      tryAgainLater: 'Try again later',
      loadPluginsError: 'Failed to load plugins',
      error: 'Error',
      pluginSettings: 'Plugin Settings',
      autoUpdates: 'Auto Updates',
      autoUpdatesDescription: 'Automatically update plugins',
      allowBetaPlugins: 'Allow Beta Plugins',
      betaPluginsDescription: 'Show test versions of plugins',
      sendUsageData: 'Send Usage Data',
      usageDataDescription: 'Help improve plugin quality',
      developers: 'For Developers',
      pluginDocumentation: 'API Documentation',
      createPlugin: 'Create Plugin'
    }
  };

  return texts[language]?.[key] || texts.uk[key] || key;
}