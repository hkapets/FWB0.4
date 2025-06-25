import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, Download, Star, Search, Filter, Grid, List,
  Zap, Palette, FileOutput, Dice6, BarChart3, Settings,
  ExternalLink, Heart, Eye, User, Calendar, Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PluginInfo {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: string;
  rating: number;
  downloads: number;
  lastUpdated: string;
  featured: boolean;
  price: number; // 0 for free
  screenshots: string[];
  permissions: string[];
  tags: string[];
  size: string;
}

interface PluginStoreProps {
  language?: 'uk' | 'pl' | 'en';
  onInstallPlugin?: (plugin: PluginInfo) => void;
}

export default function PluginStore({ language = 'uk', onInstallPlugin }: PluginStoreProps) {
  const { toast } = useToast();
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating' | 'name'>('popular');
  const [installedPlugins, setInstalledPlugins] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPlugins();
    loadInstalledPlugins();
  }, []);

  const loadPlugins = async () => {
    setLoading(true);
    try {
      // Mock data для демонстрації
      const mockPlugins: PluginInfo[] = [
        {
          id: 'procedural-city-gen',
          name: 'Procedural City Generator',
          version: '2.1.0',
          author: 'CityBuilder Studios',
          description: 'Автоматично генерує детальні міста з районами, вулицями та будівлями. Підтримує різні архітектурні стилі та культури.',
          category: 'world-generators',
          rating: 4.8,
          downloads: 15420,
          lastUpdated: '2024-12-20',
          featured: true,
          price: 0,
          screenshots: [],
          permissions: ['read:world', 'write:world'],
          tags: ['procedural', 'cities', 'buildings', 'streets'],
          size: '2.4 MB'
        },
        {
          id: 'ukrainian-grammar-check',
          name: 'Ukrainian Grammar Checker',
          version: '1.5.2',
          author: 'LanguageTools UA',
          description: 'Професійна перевірка української граматики та стилістики для описів світу. Підтримує діалекти та історичні форми.',
          category: 'content-enhancers',
          rating: 4.9,
          downloads: 8930,
          lastUpdated: '2024-12-18',
          featured: true,
          price: 5.99,
          screenshots: [],
          permissions: ['read:world'],
          tags: ['ukrainian', 'grammar', 'language', 'quality'],
          size: '1.8 MB'
        },
        {
          id: 'foundry-vtt-enhanced',
          name: 'Enhanced Foundry VTT Export',
          version: '3.0.1',
          author: 'VTT Masters',
          description: 'Розширений експорт для Foundry VTT з повною підтримкою токенів, освітлення, стін та спецефектів.',
          category: 'export-formats',
          rating: 4.7,
          downloads: 12800,
          lastUpdated: '2024-12-15',
          featured: false,
          price: 9.99,
          screenshots: [],
          permissions: ['read:world', 'export:data'],
          tags: ['foundry', 'vtt', 'export', 'gaming'],
          size: '3.1 MB'
        },
        {
          id: 'pathfinder2e-complete',
          name: 'Pathfinder 2e Complete',
          version: '1.2.0',
          author: 'RPG Forge',
          description: 'Повна підтримка Pathfinder 2e системи з генерацією статблоків, зустрічей та автоматичним розрахунком CR.',
          category: 'rpg-systems',
          rating: 4.6,
          downloads: 7650,
          lastUpdated: '2024-12-12',
          featured: false,
          price: 12.99,
          screenshots: [],
          permissions: ['read:world', 'rpg:tools'],
          tags: ['pathfinder', 'pf2e', 'statblocks', 'encounters'],
          size: '4.2 MB'
        },
        {
          id: '3d-world-renderer',
          name: '3D World Renderer',
          version: '0.9.3',
          author: 'Visual Worlds',
          description: 'Створює 3D візуалізації ваших світів з можливістю експорту в різні формати та віртуальних турів.',
          category: 'visualization',
          rating: 4.4,
          downloads: 5430,
          lastUpdated: '2024-12-10',
          featured: false,
          price: 19.99,
          screenshots: [],
          permissions: ['read:world', 'ui:modify'],
          tags: ['3d', 'visualization', 'rendering', 'tours'],
          size: '8.7 MB'
        },
        {
          id: 'auto-backup-manager',
          name: 'Auto Backup Manager',
          version: '2.0.0',
          author: 'Safety First',
          description: 'Автоматичне створення резервних копій світів з налаштуваннями частоти, хмарної синхронізації та відновлення.',
          category: 'automation',
          rating: 4.5,
          downloads: 9870,
          lastUpdated: '2024-12-08',
          featured: false,
          price: 0,
          screenshots: [],
          permissions: ['read:world', 'fs:limited'],
          tags: ['backup', 'automation', 'safety', 'cloud'],
          size: '1.2 MB'
        }
      ];

      setPlugins(mockPlugins);
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

  const loadInstalledPlugins = () => {
    // Mock installed plugins
    setInstalledPlugins(new Set(['procedural-city-gen', 'auto-backup-manager']));
  };

  const handleInstallPlugin = async (plugin: PluginInfo) => {
    try {
      // Simulate installation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setInstalledPlugins(prev => new Set([...prev, plugin.id]));
      
      toast({
        title: getLocalizedText('pluginInstalled', language),
        description: `${plugin.name} ${getLocalizedText('installedSuccessfully', language)}`,
      });

      if (onInstallPlugin) {
        onInstallPlugin(plugin);
      }
    } catch (error) {
      toast({
        title: getLocalizedText('installationFailed', language),
        description: getLocalizedText('tryAgainLater', language),
        variant: 'destructive',
      });
    }
  };

  const handleUninstallPlugin = async (plugin: PluginInfo) => {
    try {
      setInstalledPlugins(prev => {
        const newSet = new Set(prev);
        newSet.delete(plugin.id);
        return newSet;
      });
      
      toast({
        title: getLocalizedText('pluginUninstalled', language),
        description: `${plugin.name} ${getLocalizedText('uninstalledSuccessfully', language)}`,
      });
    } catch (error) {
      toast({
        title: getLocalizedText('uninstallationFailed', language),
        description: getLocalizedText('tryAgainLater', language),
        variant: 'destructive',
      });
    }
  };

  const categories = [
    { id: 'all', name: getLocalizedText('allCategories', language), icon: Grid },
    { id: 'world-generators', name: getLocalizedText('worldGenerators', language), icon: Zap },
    { id: 'content-enhancers', name: getLocalizedText('contentEnhancers', language), icon: Palette },
    { id: 'export-formats', name: getLocalizedText('exportFormats', language), icon: FileOutput },
    { id: 'rpg-systems', name: getLocalizedText('rpgSystems', language), icon: Dice6 },
    { id: 'visualization', name: getLocalizedText('visualization', language), icon: BarChart3 },
    { id: 'automation', name: getLocalizedText('automation', language), icon: Settings }
  ];

  const filteredPlugins = plugins
    .filter(plugin => {
      const matchesSearch = searchQuery === '' || 
        plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'newest':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : Package;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return getLocalizedText('free', language);
    return `$${price.toFixed(2)}`;
  };

  const renderPluginCard = (plugin: PluginInfo) => {
    const isInstalled = installedPlugins.has(plugin.id);
    const IconComponent = getCategoryIcon(plugin.category);

    return (
      <Card key={plugin.id} className="fantasy-border bg-black/20 hover:bg-black/30 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-purple-200 text-lg">{plugin.name}</CardTitle>
                <p className="text-gray-400 text-sm">
                  {getLocalizedText('by', language)} {plugin.author}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {plugin.featured && (
                <Badge className="bg-yellow-900/20 text-yellow-200 border-yellow-600/30">
                  <Award className="w-3 h-3 mr-1" />
                  {getLocalizedText('featured', language)}
                </Badge>
              )}
              <Badge variant="outline">{formatPrice(plugin.price)}</Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-sm line-clamp-3">{plugin.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              {plugin.rating}
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {plugin.downloads.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(plugin.lastUpdated).toLocaleDateString(language === 'uk' ? 'uk-UA' : language === 'pl' ? 'pl-PL' : 'en-US')}
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {plugin.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-500">
              v{plugin.version} • {plugin.size}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="w-3 h-3 mr-1" />
                {getLocalizedText('preview', language)}
              </Button>
              
              {isInstalled ? (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleUninstallPlugin(plugin)}
                >
                  {getLocalizedText('uninstall', language)}
                </Button>
              ) : (
                <Button 
                  className="fantasy-button" 
                  size="sm"
                  onClick={() => handleInstallPlugin(plugin)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  {getLocalizedText('install', language)}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-fantasy text-fantasy-gold-300 flex items-center gap-2">
          <Package className="w-6 h-6" />
          {getLocalizedText('pluginStore', language)}
        </h2>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={getLocalizedText('searchPlugins', language)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 fantasy-input"
          />
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 bg-gray-800 border border-gray-600 rounded text-gray-300"
        >
          <option value="popular">{getLocalizedText('popular', language)}</option>
          <option value="newest">{getLocalizedText('newest', language)}</option>
          <option value="rating">{getLocalizedText('rating', language)}</option>
          <option value="name">{getLocalizedText('name', language)}</option>
        </select>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 bg-gray-800">
          {categories.map(category => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="text-gray-300 gap-2 text-xs"
              >
                <IconComponent className="w-3 h-3" />
                <span className="hidden lg:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category.id} value={category.id}>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i} className="fantasy-border bg-black/20">
                    <CardContent className="p-6">
                      <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                        <div className="h-20 bg-gray-700 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPlugins.length === 0 ? (
              <Card className="fantasy-border bg-black/20">
                <CardContent className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400">{getLocalizedText('noPluginsFound', language)}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlugins.map(renderPluginCard)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Stats */}
      <Card className="fantasy-border bg-black/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              {getLocalizedText('showingPlugins', language)}: {filteredPlugins.length} {getLocalizedText('of', language)} {plugins.length}
            </span>
            <span>
              {getLocalizedText('installedPlugins', language)}: {installedPlugins.size}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Локалізація
function getLocalizedText(key: string, language: 'uk' | 'pl' | 'en'): string {
  const texts = {
    uk: {
      pluginStore: 'Магазин розширень',
      allCategories: 'Усі категорії',
      worldGenerators: 'Генератори світів',
      contentEnhancers: 'Покращення контенту', 
      exportFormats: 'Формати експорту',
      rpgSystems: 'RPG системи',
      visualization: 'Візуалізація',
      automation: 'Автоматизація',
      searchPlugins: 'Пошук розширень...',
      popular: 'Популярні',
      newest: 'Найновіші',
      rating: 'За рейтингом',
      name: 'За назвою',
      free: 'Безкоштовно',
      by: 'від',
      featured: 'Рекомендовано',
      preview: 'Перегляд',
      install: 'Встановити',
      uninstall: 'Видалити',
      pluginInstalled: 'Розширення встановлено',
      installedSuccessfully: 'успішно встановлено',
      pluginUninstalled: 'Розширення видалено',
      uninstalledSuccessfully: 'успішно видалено',
      installationFailed: 'Помилка встановлення',
      uninstallationFailed: 'Помилка видалення',
      tryAgainLater: 'Спробуйте пізніше',
      loadPluginsError: 'Помилка завантаження розширень',
      error: 'Помилка',
      noPluginsFound: 'Розширення не знайдено',
      showingPlugins: 'Показано розширень',
      of: 'з',
      installedPlugins: 'Встановлено розширень'
    },
    pl: {
      pluginStore: 'Sklep rozszerzeń',
      allCategories: 'Wszystkie kategorie',
      worldGenerators: 'Generatory światów',
      contentEnhancers: 'Ulepszenia treści',
      exportFormats: 'Formaty eksportu',
      rpgSystems: 'Systemy RPG',
      visualization: 'Wizualizacja',
      automation: 'Automatyzacja',
      searchPlugins: 'Szukaj rozszerzeń...',
      popular: 'Popularne',
      newest: 'Najnowsze',
      rating: 'Według oceny',
      name: 'Według nazwy',
      free: 'Darmowe',
      by: 'od',
      featured: 'Polecane',
      preview: 'Podgląd',
      install: 'Zainstaluj',
      uninstall: 'Usuń',
      pluginInstalled: 'Rozszerzenie zainstalowane',
      installedSuccessfully: 'pomyślnie zainstalowano',
      pluginUninstalled: 'Rozszerzenie usunięte',
      uninstalledSuccessfully: 'pomyślnie usunięto',
      installationFailed: 'Błąd instalacji',
      uninstallationFailed: 'Błąd usuwania',
      tryAgainLater: 'Spróbuj później',
      loadPluginsError: 'Błąd ładowania rozszerzeń',
      error: 'Błąd',
      noPluginsFound: 'Nie znaleziono rozszerzeń',
      showingPlugins: 'Pokazano rozszerzeń',
      of: 'z',
      installedPlugins: 'Zainstalowane rozszerzenia'
    },
    en: {
      pluginStore: 'Plugin Store',
      allCategories: 'All Categories',
      worldGenerators: 'World Generators',
      contentEnhancers: 'Content Enhancers',
      exportFormats: 'Export Formats',
      rpgSystems: 'RPG Systems',
      visualization: 'Visualization',
      automation: 'Automation',
      searchPlugins: 'Search plugins...',
      popular: 'Popular',
      newest: 'Newest',
      rating: 'By Rating',
      name: 'By Name',
      free: 'Free',
      by: 'by',
      featured: 'Featured',
      preview: 'Preview',
      install: 'Install',
      uninstall: 'Uninstall',
      pluginInstalled: 'Plugin installed',
      installedSuccessfully: 'installed successfully',
      pluginUninstalled: 'Plugin uninstalled',
      uninstalledSuccessfully: 'uninstalled successfully',
      installationFailed: 'Installation failed',
      uninstallationFailed: 'Uninstallation failed',
      tryAgainLater: 'Try again later',
      loadPluginsError: 'Failed to load plugins',
      error: 'Error',
      noPluginsFound: 'No plugins found',
      showingPlugins: 'Showing plugins',
      of: 'of',
      installedPlugins: 'Installed plugins'
    }
  };

  return texts[language]?.[key] || texts.uk[key] || key;
}