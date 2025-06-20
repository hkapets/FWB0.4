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
    let errors: string[] = [];
    // Допоміжна функція для batch POST
    async function batchPost(url: string, items: any[]) {
      for (const item of items) {
        try {
          await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...item, worldId: newWorldId }),
          });
        } catch (e) {
          errors.push(url);
        }
      }
    }
    // races
    if (Array.isArray(template.races) && template.races.length) {
      await batchPost(
        `/api/worlds/${newWorldId}/races`,
        template.races.map((name: any) => ({ name }))
      );
    }
    // classes
    if (Array.isArray(template.classes) && template.classes.length) {
      await batchPost(
        `/api/worlds/${newWorldId}/classes`,
        template.classes.map((name: any) => ({ name }))
      );
    }
    // magic
    if (Array.isArray(template.magic) && template.magic.length) {
      await batchPost(
        `/api/worlds/${newWorldId}/magic`,
        template.magic.map((name: any) => ({ name }))
      );
    }
    // locations
    if (Array.isArray(template.locations) && template.locations.length) {
      await batchPost(
        `/api/worlds/${newWorldId}/locations`,
        template.locations.map((name: any) => ({ name }))
      );
    }
    // creatures
    if (Array.isArray(template.creatures) && template.creatures.length) {
      await batchPost(
        `/api/worlds/${newWorldId}/creatures`,
        template.creatures
      );
    }
    // artifacts
    if (Array.isArray(template.artifacts) && template.artifacts.length) {
      await batchPost(
        `/api/worlds/${newWorldId}/artifacts`,
        template.artifacts
      );
    }
    // lore
    if (Array.isArray(template.lore) && template.lore.length) {
      await batchPost(`/api/worlds/${newWorldId}/lore`, template.lore);
    }
    // characters
    if (Array.isArray(template.characters) && template.characters.length) {
      await batchPost(
        `/api/worlds/${newWorldId}/characters`,
        template.characters
      );
    }
    // events
    if (Array.isArray(template.events) && template.events.length) {
      await batchPost(`/api/worlds/${newWorldId}/events`, template.events);
    }
    // regions
    if (Array.isArray(template.regions) && template.regions.length) {
      await batchPost(`/api/worlds/${newWorldId}/regions`, template.regions);
    }
    // relations
    if (Array.isArray(template.relations) && template.relations.length) {
      await batchPost(
        `/api/worlds/${newWorldId}/relations`,
        template.relations
      );
    }
    if (errors.length === 0) {
      toast({
        title: "Світ повністю створено з шаблону!",
        description: newWorld.name,
      });
    } else {
      toast({
        title: "Світ створено, але деякі сутності не імпортовано",
        description: errors.join(", "),
      });
    }
    setCurrentWorldId(newWorldId);
  };

  const quickActions = [
    {
      title: t.dashboard.createWorld,
      description: t.dashboard.createWorldDesc,
      icon: Plus,
      color: "bg-green-600 hover:bg-green-500",
      onClick: () => setIsCreateWorldModalOpen(true),
    },
    {
      title: t.dashboard.addLocation,
      description: t.dashboard.addLocationDesc,
      icon: MapPin,
      color: "bg-purple-600 hover:bg-purple-500",
      onClick: () => setIsCreateLocationModalOpen(true),
      disabled: !worldId,
    },
    {
      title: t.dashboard.createCharacter,
      description: t.dashboard.createCharacterDesc,
      icon: UserPlus,
      color: "bg-yellow-600 hover:bg-yellow-500",
      onClick: () => setIsCreateCharacterModalOpen(true),
      disabled: !worldId,
    },
    {
      title: t.dashboard.addCreature,
      description: t.dashboard.addCreatureDesc,
      icon: Crown,
      color: "bg-red-600 hover:bg-red-500",
      onClick: () => setIsCreateCreatureModalOpen(true),
      disabled: !worldId,
    },
  ];

  // --- СТАРТОВИЙ ЕКРАН ---
  if (!currentWorld) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
        <img
          src="/attached_assets/image_1750090217986.png"
          alt="Fantasy background"
          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none select-none"
        />
        <div className="relative z-10 max-w-xl mx-auto text-center p-8 bg-black/60 rounded-xl shadow-lg">
          <h1 className="text-4xl font-fantasy font-bold text-yellow-200 mb-4">
            Fantasy World Builder
          </h1>
          <p className="text-lg text-gray-200 mb-6">
            {t.header.title}. {t.dashboard.subtitle}
          </p>
          <Button
            size="lg"
            className="mb-4 bg-yellow-700 hover:bg-yellow-600"
            onClick={() => setIsCreateWorldModalOpen(true)}
          >
            {t.navigation.createWorld}
          </Button>
          {worlds.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold text-yellow-100 mb-2">
                {t.navigation.recentWorlds}
              </h2>
              <ul className="space-y-2">
                {worlds.map((w) => (
                  <li
                    key={w.id}
                    className="flex items-center justify-between bg-black/40 rounded px-4 py-2"
                  >
                    <span
                      className="text-lg text-white font-semibold cursor-pointer"
                      onClick={() => handleSelectWorld(w.id)}
                    >
                      {w.name}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectWorld(w.id)}
                      >
                        {t.actions.edit}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteWorld(w)}
                      >
                        {t.actions.delete}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <CreateWorldModal
          isOpen={isCreateWorldModalOpen}
          onClose={() => setIsCreateWorldModalOpen(false)}
          onSubmit={() => {
            setIsCreateWorldModalOpen(false);
            refetchWorlds();
          }}
        />
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <div className="text-lg mb-4">
              Видалити світ <b>{worldToDelete?.name}</b>?
            </div>
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

  // --- ДАШБОРД ДЛЯ ВИБРАНОГО СВІТУ ---
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Порожній стан для світів */}
      {worlds.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
          <img
            src="/empty-worlds.svg"
            alt="Порожньо"
            className="w-32 h-32 mb-4 opacity-70"
          />
          <div className="text-lg mb-2">У вас ще немає жодного світу</div>
          <div className="mb-4 text-sm text-gray-500">
            Створіть свій перший світ, щоб розпочати!
          </div>
          <Button
            onClick={() => setIsCreateWorldModalOpen(true)}
            size="lg"
            className="mt-2"
          >
            Створити світ
          </Button>
        </div>
      )}
      {/* Quick actions */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start">
        {quickActions.map((action) => (
          <Tooltip key={action.title}>
            <TooltipTrigger asChild>
              <Button
                className={`flex flex-col items-center justify-center w-36 h-32 text-center text-white font-semibold text-base shadow-md transition-all duration-200 ${action.color}`}
                onClick={action.onClick}
                disabled={action.disabled}
                size="lg"
              >
                <span className="mb-2">
                  <action.icon size={32} />
                </span>
                {action.title}
                <span className="text-xs font-normal mt-1 text-gray-200 opacity-70">
                  {action.description}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{action.description}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      {/* Останні локації */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-yellow-100 mb-2">
          Останні локації
        </h2>
        {recentLocations.length === 0 ? (
          <div className="text-gray-400 text-sm flex items-center gap-2">
            Немає локацій.{" "}
            <Button
              size="sm"
              onClick={() => setIsCreateLocationModalOpen(true)}
            >
              Додати
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 animate-fadein">
            {recentLocations.map((loc) => (
              <LocationCard key={loc.id} location={loc} viewMode="list" />
            ))}
          </div>
        )}
      </div>
      {/* Останні персонажі */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-yellow-100 mb-2">
          Останні персонажі
        </h2>
        {recentCharacters.length === 0 ? (
          <div className="text-gray-400 text-sm flex items-center gap-2">
            Немає персонажів.{" "}
            <Button
              size="sm"
              onClick={() => setIsCreateCharacterModalOpen(true)}
            >
              Додати
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 animate-fadein">
            {recentCharacters.map((char) => (
              <CharacterCard key={char.id} character={char} viewMode="list" />
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="fantasy-border">
          <CardHeader>
            <CardTitle className="text-yellow-200 font-fantasy">
              {t.dashboard.worldStats}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
              <span>
                {t.dashboard.locations}: {stats?.locations ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <UserPlus className="w-6 h-6 text-yellow-400" />
              <span>
                {t.dashboard.characters}: {stats?.characters ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Crown className="w-6 h-6 text-yellow-400" />
              <span>
                {t.dashboard.creatures}: {stats?.creatures ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <History className="w-6 h-6 text-yellow-400" />
              <span>
                {t.dashboard.totalElements}: {stats?.total ?? 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="fantasy-border">
          <CardHeader>
            <CardTitle className="text-yellow-200 font-fantasy">
              {t.dashboard.quickHelp}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <HelpCircle className="w-6 h-6 text-yellow-400" />
              <span>{t.dashboard.gettingStartedDesc}</span>
            </div>
            <div className="flex items-center gap-4">
              <ArrowRight className="w-6 h-6 text-yellow-400" />
              <span>{t.dashboard.worldMapHelpDesc}</span>
            </div>
            <div className="flex items-center gap-4">
              <ArrowRight className="w-6 h-6 text-yellow-400" />
              <span>{t.dashboard.exportShareDesc}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
