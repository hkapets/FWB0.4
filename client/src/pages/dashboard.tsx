import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MapPin,
  UserPlus,
  Crown,
  BarChart3,
  History,
  HelpCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Compass,
  Sword,
} from "lucide-react";
import { useState, useEffect } from "react";
import CreateWorldModal from "@/components/modals/create-world-modal";
import CreateLocationModal from "@/components/modals/create-location-modal";
import CreateCharacterModal from "@/components/modals/create-character-modal";
import CreateCreatureModal from "@/components/modals/create-creature-modal";
import LocationCard from "@/components/cards/location-card";
import CharacterCard from "@/components/cards/character-card";
import { formatTimeAgo } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import type { World, Location, Character } from "@shared/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { QuickNavigation, WorldStatistics } from "@/components/integration-helpers";
import {
  worldTemplates,
  WorldTemplate,
  saveWorldTemplateLocallyAndRemotely,
  exportFullWorldTemplate,
} from "@/lib/worldTemplates";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface DashboardProps {
  currentWorldId: number | null;
  setCurrentWorldId: (id: number | null) => void;
  trackAction?: (action: string, context?: string, metadata?: any) => void;
}

export default function Dashboard({
  currentWorldId,
  setCurrentWorldId,
  trackAction,
}: DashboardProps) {
  const t = useTranslation();
  const [isCreateWorldModalOpen, setIsCreateWorldModalOpen] = useState(false);
  const [isCreateLocationModalOpen, setIsCreateLocationModalOpen] =
    useState(false);
  const [isCreateCharacterModalOpen, setIsCreateCharacterModalOpen] =
    useState(false);
  const [isCreateCreatureModalOpen, setIsCreateCreatureModalOpen] =
    useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [worldToDelete, setWorldToDelete] = useState<World | null>(null);

  const { data: worlds = [], refetch: refetchWorlds } = useQuery<World[]>({
    queryKey: ["/api/worlds"],
  });

  // Якщо світ не вибрано, вибираємо перший (якщо є)
  useEffect(() => {
    if (!currentWorldId && worlds.length > 0) {
      setCurrentWorldId(worlds[0].id);
    }
  }, [worlds, currentWorldId]);

  const currentWorld = worlds.find((w) => w.id === currentWorldId) || null;
  const worldId = currentWorld?.id || null;

  const { data: stats } = useQuery<{
    locations: number;
    characters: number;
    creatures: number;
    total: number;
  }>({
    queryKey: ["/api/worlds", worldId, "stats"],
    enabled: !!worldId,
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/worlds", worldId, "locations"],
    enabled: !!worldId,
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ["/api/worlds", worldId, "characters"],
    enabled: !!worldId,
  });

  const recentLocations = locations.slice(-3).reverse();
  const recentCharacters = characters.slice(-4).reverse();

  const handleSelectWorld = (id: number) => setCurrentWorldId(id);
  const handleDeleteWorld = (world: World) => {
    setWorldToDelete(world);
    setShowDeleteDialog(true);
  };
  const confirmDeleteWorld = async () => {
    if (!worldToDelete) return;
    await fetch(`/api/worlds/${worldToDelete.id}`, { method: "DELETE" });
    setShowDeleteDialog(false);
    setWorldToDelete(null);
    refetchWorlds();
    setCurrentWorldId(worlds[0]?.id || null);
  };

  const handleSaveAsTemplate = () => {
    if (!currentWorld) return;
    // Мінімальний шаблон: тільки базові поля
    const newTemplate: WorldTemplate = {
      id: `custom-${currentWorld.id}`,
      name: currentWorld.name || "Custom",
      icon: "➕", // icon не зберігається у World з бази
      description: currentWorld.description || "Користувацький шаблон",
      features: [], // features/settings/races/... не зберігаються у мінімальному шаблоні
      races: [],
      classes: [],
      magic: [],
      locations: [],
      bestiary: [],
      artifacts: [],
    };
    // Зберігаємо у localStorage
    const saved = JSON.parse(
      localStorage.getItem("customWorldTemplates") || "[]"
    );
    localStorage.setItem(
      "customWorldTemplates",
      JSON.stringify([...saved, newTemplate])
    );
    toast({ title: "Шаблон збережено!", description: newTemplate.name });
  };

  // --- Додаткові функції для повного шаблону ---
  const handleFullExport = async () => {
    if (!worldId) return;
    await saveWorldTemplateLocallyAndRemotely(worldId);
    toast({
      title: "Повний шаблон збережено!",
      description: "Локально і на сервері",
    });
  };

  const handleExportToFile = async () => {
    if (!worldId) return;
    const template = await exportFullWorldTemplate(worldId);
    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `world-template-${worldId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Шаблон експортовано у файл" });
  };

  const handleImportFromFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const template = JSON.parse(text);
      // Зберігаємо у localStorage
      const saved = JSON.parse(
        localStorage.getItem("customWorldTemplates") || "[]"
      );
      localStorage.setItem(
        "customWorldTemplates",
        JSON.stringify([...saved, template])
      );
      toast({ title: "Шаблон імпортовано у localStorage" });
    } catch {
      toast({
        title: "Помилка імпорту шаблону",
        description: "Некоректний файл",
      });
    }
  };

  const handleRestoreWorldFromTemplate = async (template: any) => {
    // Створюємо новий світ
    const res = await fetch("/api/worlds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: template.name,
        description: template.description,
        icon: template.icon,
        features: template.features,
      }),
    });
    const newWorld = await res.json();
    const newWorldId = newWorld.id;

    // Функція для batch POST запитів
    async function batchPost(url: string, items: any[]) {
      const promises = items.map((item) =>
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...item, worldId: newWorldId }),
        })
      );
      await Promise.all(promises);
    }

    // Відновлюємо дані з шаблону
    if (template.races?.length) await batchPost("/api/races", template.races);
    if (template.classes?.length)
      await batchPost("/api/classes", template.classes);
    if (template.magic?.length) await batchPost("/api/magic", template.magic);
    if (template.locations?.length)
      await batchPost("/api/locations", template.locations);
    if (template.bestiary?.length)
      await batchPost("/api/creatures", template.bestiary);
    if (template.artifacts?.length)
      await batchPost("/api/artifacts", template.artifacts);

    setCurrentWorldId(newWorldId);
    refetchWorlds();
    toast({
      title: "Світ відновлено з шаблону!",
      description: template.name,
    });
  };

  // Якщо немає світу, показуємо привітання
  if (!currentWorldId) {
    return (
      <div className="p-8 relative overflow-hidden">
        {/* Фонове зображення */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: `linear-gradient(135deg, 
              rgba(147, 51, 234, 0.1) 0%, 
              rgba(79, 70, 229, 0.2) 25%, 
              rgba(139, 69, 19, 0.1) 50%, 
              rgba(75, 85, 99, 0.2) 75%, 
              rgba(31, 41, 55, 0.3) 100%), 
            url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"%3E%3Cdefs%3E%3Cfilter id="noise"%3E%3CfeTurbulence baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3C/defs%3E%3Crect width="1200" height="800" fill="%23371B58" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E')`
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center text-center py-12">
          <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mb-6 ring-4 ring-yellow-400/50 shadow-lg">
            <Crown className="text-purple-900 text-5xl" />
          </div>
          <h1 className="text-5xl font-fantasy font-bold text-yellow-200 tracking-wider">
            Fantasy World Builder
          </h1>
          <p className="mt-4 text-xl text-purple-200 max-w-2xl">
            Створюйте епічні світи, розробляйте персонажів та пишіть історії
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12 w-full max-w-6xl">
            {/* Багатий лор */}
            <div className="fantasy-border p-6 rounded-lg text-left bg-black/30 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <BookOpen className="w-8 h-8 text-yellow-400" />
                <h3 className="text-2xl font-fantasy text-yellow-300">
                  Багатий Лор
                </h3>
              </div>
              <p className="text-purple-200">
                Створюйте географію, раси, магію та історію вашого світу
              </p>
            </div>
            {/* Інтерактивні карти */}
            <div className="fantasy-border p-6 rounded-lg text-left bg-black/30 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <Compass className="w-8 h-8 text-yellow-400" />
                <h3 className="text-2xl font-fantasy text-yellow-300">
                  Інтерактивні карти
                </h3>
              </div>
              <p className="text-purple-200">
                Малюйте карти світу, додавайте маркери та локації
              </p>
            </div>
            {/* Персонажі */}
            <div className="fantasy-border p-6 rounded-lg text-left bg-black/30 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-4">
                <Sword className="w-8 h-8 text-yellow-400" />
                <h3 className="text-2xl font-fantasy text-yellow-300">
                  Персонажі та події
                </h3>
              </div>
              <p className="text-purple-200">
                Розробляйте персонажів та створюйте хронологію подій
              </p>
            </div>
          </div>

          <Button
            size="lg"
            className="mt-12 fantasy-button px-8 py-6 text-lg"
            onClick={() => setIsCreateWorldModalOpen(true)}
          >
            <Plus className="mr-2 h-6 w-6" />
            Створити новий світ
          </Button>
        </div>
        <CreateWorldModal
          isOpen={isCreateWorldModalOpen}
          onClose={() => setIsCreateWorldModalOpen(false)}
          onSubmit={async (data) => {
            try {
              const response = await fetch("/api/worlds", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              const world = await response.json();
              setCurrentWorldId(world.id);
              refetchWorlds();
              setIsCreateWorldModalOpen(false);
            } catch (error) {
              console.error("Error creating world:", error);
            }
          }}
        />
      </div>
    );
  }

  // Основний дашборд
  return (
    <div className="p-4 md:p-8 space-y-8 animate-fadein relative overflow-hidden">
      {/* Фонове зображення */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 -z-10"
        style={{
          backgroundImage: `linear-gradient(135deg, 
            rgba(147, 51, 234, 0.1) 0%, 
            rgba(79, 70, 229, 0.2) 25%, 
            rgba(139, 69, 19, 0.1) 50%, 
            rgba(75, 85, 99, 0.2) 75%, 
            rgba(31, 41, 55, 0.3) 100%), 
          url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"%3E%3Cdefs%3E%3Cfilter id="noise"%3E%3CfeTurbulence baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3C/defs%3E%3Crect width="1200" height="800" fill="%23371B58" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E')`
        }}
      />

      {/* Заголовок світу з покращеним дизайном */}
      <div className="relative z-10 bg-gradient-to-r from-purple-900/40 via-gray-900/40 to-purple-800/40 backdrop-blur-sm rounded-xl p-6 fantasy-border border-gold-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center ring-4 ring-yellow-400/30 shadow-lg">
              <Crown className="text-purple-900 text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl font-fantasy font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                {currentWorld?.name}
              </h1>
              <p className="text-purple-200 mt-1 text-lg">
                {currentWorld?.description || "Ваш фентезі світ"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsCreateWorldModalOpen(true)}
              className="fantasy-button px-6 py-3 text-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Новий світ
            </Button>
          </div>
        </div>
      </div>

      {/* Статистика з покращеним дизайном */}
      {stats && (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="fantasy-border bg-gradient-to-br from-green-900/30 to-green-800/20 backdrop-blur-sm border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-200 flex items-center justify-between">
                <span className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-green-400" />
                  Локації
                </span>
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-400" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-1">
                {stats.locations}
              </div>
              <p className="text-xs text-green-200/70">Створених локацій</p>
            </CardContent>
          </Card>

          <Card className="fantasy-border bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-200 flex items-center justify-between">
                <span className="flex items-center">
                  <UserPlus className="mr-2 h-5 w-5 text-purple-400" />
                  Персонажі
                </span>
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-purple-400" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {stats.characters}
              </div>
              <p className="text-xs text-purple-200/70">Активних персонажів</p>
            </CardContent>
          </Card>

          <Card className="fantasy-border bg-gradient-to-br from-orange-900/30 to-orange-800/20 backdrop-blur-sm border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-200 flex items-center justify-between">
                <span className="flex items-center">
                  <Sword className="mr-2 h-5 w-5 text-orange-400" />
                  Істоти
                </span>
                <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Sword className="w-4 h-4 text-orange-400" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400 mb-1">
                {stats.creatures}
              </div>
              <p className="text-xs text-orange-200/70">У бестіарії</p>
            </CardContent>
          </Card>

          <Card className="fantasy-border bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-sm border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-200 flex items-center justify-between">
                <span className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-blue-400" />
                  Всього
                </span>
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {stats.total}
              </div>
              <p className="text-xs text-blue-200/70">Елементів світу</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Швидкі дії з покращеним дизайном */}
      <div className="relative z-10">
        <h2 className="text-2xl font-fantasy font-bold text-yellow-300 mb-6 text-center">
          Швидкі дії
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="fantasy-border bg-gradient-to-br from-green-900/40 to-green-800/30 backdrop-blur-sm border-green-500/40 hover:border-green-400/60 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30"
            onClick={() => setIsCreateLocationModalOpen(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-green-400/30">
                <MapPin className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="font-fantasy font-semibold text-green-300 text-lg mb-2">
                Додати локацію
              </h3>
              <p className="text-green-200/70 text-sm">
                Створіть нове місце у вашому світі
              </p>
            </CardContent>
          </Card>

          <Card 
            className="fantasy-border bg-gradient-to-br from-purple-900/40 to-purple-800/30 backdrop-blur-sm border-purple-500/40 hover:border-purple-400/60 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30"
            onClick={() => setIsCreateCharacterModalOpen(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-purple-400/30">
                <UserPlus className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="font-fantasy font-semibold text-purple-300 text-lg mb-2">
                Створити персонажа
              </h3>
              <p className="text-purple-200/70 text-sm">
                Додайте нового героя або NPC
              </p>
            </CardContent>
          </Card>

          <Card 
            className="fantasy-border bg-gradient-to-br from-orange-900/40 to-orange-800/30 backdrop-blur-sm border-orange-500/40 hover:border-orange-400/60 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/30"
            onClick={() => setIsCreateCreatureModalOpen(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-orange-400/30">
                <Sword className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="font-fantasy font-semibold text-orange-300 text-lg mb-2">
                Додати істоту
              </h3>
              <p className="text-orange-200/70 text-sm">
                Поповніть бестіарій світу
              </p>
            </CardContent>
          </Card>

          <Card 
            className="fantasy-border bg-gradient-to-br from-yellow-900/40 to-yellow-800/30 backdrop-blur-sm border-yellow-500/40 hover:border-yellow-400/60 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/30"
            onClick={() => window.location.href = '/lore'}
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-yellow-400/30">
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="font-fantasy font-semibold text-yellow-300 text-lg mb-2">
                Лор система
              </h3>
              <p className="text-yellow-200/70 text-sm">
                Розширте світ расами та магією
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Остання активність з покращеним дизайном */}
      <div className="relative z-10">
        <h2 className="text-2xl font-fantasy font-bold text-yellow-300 mb-6 text-center">
          Остання активність
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Останні локації */}
          <Card className="fantasy-border bg-gradient-to-br from-green-900/30 to-green-800/20 backdrop-blur-sm border-green-500/30">
            <CardHeader className="border-b border-green-500/20">
              <CardTitle className="flex items-center text-green-300 text-xl">
                <MapPin className="mr-3 h-6 w-6 text-green-400" />
                Останні локації
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recentLocations.length > 0 ? (
                <div className="space-y-4">
                  {recentLocations.map((location) => (
                    <div key={location.id} className="flex items-center gap-4 p-3 rounded-lg bg-green-900/20 border border-green-500/20 hover:border-green-400/40 transition-colors">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-200">{location.name}</h4>
                        <p className="text-sm text-green-300/70 truncate">{location.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-green-400/50" />
                  </div>
                  <p className="text-green-300/70 mb-4">Поки що немає локацій</p>
                  <Button
                    onClick={() => setIsCreateLocationModalOpen(true)}
                    className="fantasy-button"
                  >
                    Додати першу локацію
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Останні персонажі */}
          <Card className="fantasy-border bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm border-purple-500/30">
            <CardHeader className="border-b border-purple-500/20">
              <CardTitle className="flex items-center text-purple-300 text-xl">
                <UserPlus className="mr-3 h-6 w-6 text-purple-400" />
                Останні персонажі
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recentCharacters.length > 0 ? (
                <div className="space-y-4">
                  {recentCharacters.map((character) => (
                    <div key={character.id} className="flex items-center gap-4 p-3 rounded-lg bg-purple-900/20 border border-purple-500/20 hover:border-purple-400/40 transition-colors">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-200">{character.name}</h4>
                        <p className="text-sm text-purple-300/70">{character.race} {character.class}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="h-8 w-8 text-purple-400/50" />
                  </div>
                  <p className="text-purple-300/70 mb-4">Поки що немає персонажів</p>
                  <Button
                    onClick={() => setIsCreateCharacterModalOpen(true)}
                    className="fantasy-button"
                  >
                    Створити першого персонажа
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Navigation */}
      <QuickNavigation currentWorldId={currentWorldId} />

      {/* World Statistics */}
      {currentWorldId && <WorldStatistics worldId={currentWorldId} />}

      {/* Модалки */}
      <CreateWorldModal
        isOpen={isCreateWorldModalOpen}
        onClose={() => setIsCreateWorldModalOpen(false)}
        onSubmit={async (data) => {
          try {
            const response = await fetch("/api/worlds", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            const world = await response.json();
            setCurrentWorldId(world.id);
            refetchWorlds();
            setIsCreateWorldModalOpen(false);
          } catch (error) {
            console.error("Error creating world:", error);
          }
        }}
      />
      {worldId && (
        <>
          <CreateLocationModal
            isOpen={isCreateLocationModalOpen}
            onClose={() => setIsCreateLocationModalOpen(false)}
            worldId={worldId}
          />
          <CreateCharacterModal
            isOpen={isCreateCharacterModalOpen}
            onClose={() => setIsCreateCharacterModalOpen(false)}
            worldId={worldId}
          />
          <CreateCreatureModal
            isOpen={isCreateCreatureModalOpen}
            onClose={() => setIsCreateCreatureModalOpen(false)}
            worldId={worldId}
          />
        </>
      )}

      {/* Діалог видалення */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <h2 className="text-lg font-semibold">Видалити світ?</h2>
          <p className="text-gray-400">
            Це назавжди видалить світ "{worldToDelete?.name}" та всі його дані.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Скасувати
            </Button>
            <Button variant="destructive" onClick={confirmDeleteWorld}>
              Видалити
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
