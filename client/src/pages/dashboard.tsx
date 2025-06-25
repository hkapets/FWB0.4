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
}

export default function DashboardPage({
  currentWorldId,
  setCurrentWorldId,
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
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"%3E%3Cdefs%3E%3CradialGradient id="a" cx="50%25" cy="50%25" r="50%25"%3E%3Cstop offset="0%25" stop-color="%23c084fc" stop-opacity="0.3"/%3E%3Cstop offset="100%25" stop-color="%231e1b4b" stop-opacity="0.8"/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width="1200" height="800" fill="url(%23a)"/%3E%3C/svg%3E\')',
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
    <div className="p-4 md:p-8 grid gap-8 animate-fadein">
      {/* Заголовок світу */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-fantasy font-bold text-fantasy-gold-400">
            {currentWorld?.name}
          </h1>
          <p className="text-gray-400 mt-1">
            {currentWorld?.description || "Ваш фентезі світ"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateWorldModalOpen(true)}
            className="fantasy-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Новий світ
          </Button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="fantasy-border bg-black/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-fantasy-green-400" />
                Локації
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fantasy-green-400">
                {stats.locations}
              </div>
            </CardContent>
          </Card>
          <Card className="fantasy-border bg-black/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <UserPlus className="mr-2 h-4 w-4 text-fantasy-purple-400" />
                Персонажі
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fantasy-purple-400">
                {stats.characters}
              </div>
            </CardContent>
          </Card>
          <Card className="fantasy-border bg-black/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <Sword className="mr-2 h-4 w-4 text-fantasy-gold-400" />
                Істоти
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-fantasy-gold-400">
                {stats.creatures}
              </div>
            </CardContent>
          </Card>
          <Card className="fantasy-border bg-black/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                <BarChart3 className="mr-2 h-4 w-4 text-blue-400" />
                Всього
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {stats.total}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Швидкі дії */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={() => setIsCreateLocationModalOpen(true)}
          className="fantasy-button h-auto p-4 flex flex-col items-center"
        >
          <MapPin className="h-8 w-8 mb-2 text-fantasy-green-400" />
          <span className="font-semibold">Додати локацію</span>
        </Button>
        <Button
          onClick={() => setIsCreateCharacterModalOpen(true)}
          className="fantasy-button h-auto p-4 flex flex-col items-center"
        >
          <UserPlus className="h-8 w-8 mb-2 text-fantasy-purple-400" />
          <span className="font-semibold">Створити персонажа</span>
        </Button>
        <Button
          onClick={() => setIsCreateCreatureModalOpen(true)}
          className="fantasy-button h-auto p-4 flex flex-col items-center"
        >
          <Sword className="h-8 w-8 mb-2 text-fantasy-gold-400" />
          <span className="font-semibold">Додати істоту</span>
        </Button>
        <Button
          onClick={handleSaveAsTemplate}
          className="fantasy-button h-auto p-4 flex flex-col items-center"
        >
          <Sparkles className="h-8 w-8 mb-2 text-fantasy-purple-400" />
          <span className="font-semibold">Зберегти як шаблон</span>
        </Button>
      </div>

      {/* Остання активність */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Останні локації */}
        <Card className="fantasy-border bg-black/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-fantasy-green-400">
              <MapPin className="mr-2 h-5 w-5" />
              Останні локації
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLocations.length > 0 ? (
              <div className="space-y-3">
                {recentLocations.map((location) => (
                  <LocationCard key={location.id} location={location} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Поки що немає локацій</p>
                <Button
                  onClick={() => setIsCreateLocationModalOpen(true)}
                  variant="outline"
                  className="mt-4"
                >
                  Додати першу локацію
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Останні персонажі */}
        <Card className="fantasy-border bg-black/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-fantasy-purple-400">
              <UserPlus className="mr-2 h-5 w-5" />
              Останні персонажі
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentCharacters.length > 0 ? (
              <div className="space-y-3">
                {recentCharacters.map((character) => (
                  <CharacterCard key={character.id} character={character} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Поки що немає персонажів</p>
                <Button
                  onClick={() => setIsCreateCharacterModalOpen(true)}
                  variant="outline"
                  className="mt-4"
                >
                  Створити першого персонажа
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
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
