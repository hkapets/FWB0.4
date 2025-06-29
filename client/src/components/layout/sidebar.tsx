import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  MapPin,
  Users,
  Crown,
  Map,
  Settings,
  Globe,
  Plus,
  ChevronDown,
  ChevronRight,
  UserPlus,
  BookOpen,
  Compass,
  History,
  FileText,
  ScrollText,
  Landmark,
  Sparkles,
  LogOut,
  Trash2,
} from "lucide-react";
import CreateWorldModal from "@/components/modals/create-world-modal";
import { useTranslation } from "@/lib/i18n";
import type { World } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface SidebarProps {
  currentWorldId: number | null;
  setCurrentWorldId: (id: number | null) => void;
}

export default function Sidebar({
  currentWorldId,
  setCurrentWorldId,
}: SidebarProps) {
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [isCreateWorldModalOpen, setIsCreateWorldModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [worldToDelete, setWorldToDelete] = useState<World | null>(null);
  const t = useTranslation();
  const [expandedSections, setExpandedSections] = useState<{
    lore: boolean;
    characters: boolean;
    maps: boolean;
  }>({
    lore: true,
    characters: false,
    maps: false,
  });

  const { data: worlds = [] } = useQuery<World[]>({
    queryKey: ["/api/worlds"],
  });

  const { data: stats } = useQuery<{
    locations: number;
    characters: number;
    creatures: number;
    total: number;
  }>({
    queryKey: ["/api/worlds", currentWorldId, "stats"],
    enabled: !!currentWorldId,
  });

  const currentWorld = worlds.find((w) => w.id === currentWorldId);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleDeleteClick = (world: World) => {
    setWorldToDelete(world);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!worldToDelete) return;

    try {
      const response = await fetch(`/api/worlds/${worldToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete world");
      }

      toast({
        title: "Світ видалено",
        description: `Світ "${worldToDelete.name}" було успішно видалено.`,
      });

      // Оновлюємо кеш TanStack Query
      queryClient.invalidateQueries({ queryKey: ["/api/worlds"] });

      // Переключаємо на інший світ, якщо поточний був видалений
      if (currentWorldId === worldToDelete.id) {
        const remainingWorlds = worlds.filter((w) => w.id !== worldToDelete.id);
        setCurrentWorldId(
          remainingWorlds.length > 0 ? remainingWorlds[0].id : null
        );
      }
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося видалити світ. Спробуйте ще раз.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setWorldToDelete(null);
    }
  };

  const navItems = [
    {
      title: t.navigation.lore,
      icon: BookOpen,
      href: "/lore",
      expanded: expandedSections.lore,
      onToggle: () => toggleSection("lore"),
      children: [
        {
          title: t.lore.geography,
          href: "/lore/geography",
          icon: MapPin,
          count: stats?.locations || 0,
        },
        {
          title: t.lore.bestiary,
          href: "/lore/bestiary",
          icon: Crown,
          count: stats?.creatures || 0,
        },
        {
          title: "Раси",
          href: "/lore/races",
          icon: Users,
          count: 0,
        },
        {
          title: "Магія",
          href: "/lore/magic",
          icon: Sparkles,
          count: 0,
        },
        {
          title: "Артефакти",
          href: "/lore/artifacts",
          icon: Crown,
          count: 0,
        },
        {
          title: "Писемність",
          href: "/lore/writing",
          icon: ScrollText,
          count: 0,
        },
        {
          title: "Політика",
          href: "/lore/politics",
          icon: Landmark,
          count: 0,
        },
        {
          title: "Історія",
          href: "/lore/history",
          icon: History,
          count: 0,
        },
        {
          title: "Події",
          href: "/lore/events",
          icon: FileText,
          count: 0,
        },
      ],
    },
    {
      title: t.navigation.characters,
      icon: UserPlus,
      href: "/characters",
      expanded: expandedSections.characters,
      onToggle: () => toggleSection("characters"),
      children: [
        {
          title: "Персонажі",
          href: "/characters",
          icon: UserPlus,
          count: stats?.characters || 0,
        },
      ],
    },
    {
      title: t.navigation.worldMap,
      icon: Compass,
      href: "/world-map",
      expanded: expandedSections.maps,
      onToggle: () => toggleSection("maps"),
      children: [
        {
          title: "Карта світу",
          href: "/world-map",
          icon: Compass,
          count: 0,
        },
      ],
    },
    {
      title: "Хронологія",
      icon: History,
      href: "/timeline",
      count: 0,
    },
    {
      title: "Нотатки",
      icon: FileText,
      href: "/notes",
      count: 0,
    },
    {
      title: "Сценарії",
      icon: ScrollText,
      href: "/scenarios",
      count: 0,
    },
    {
      title: "Зв'язки",
      icon: Users,
      href: "/relations",
      count: 0,
    },
    {
      title: t.navigation.settings,
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <>
      <aside className="w-64 fantasy-border shadow-lg border-r border-yellow-500/20 overflow-y-auto scroll-fantasy">
        <nav className="p-4 space-y-2">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-fantasy font-semibold text-yellow-300">
                <Globe className="inline mr-2" size={20} />
                {t.navigation.currentWorld}
              </h2>
              <Button
                size="sm"
                className="fantasy-button p-2"
                onClick={() => setIsCreateWorldModalOpen(true)}
              >
                <Plus size={16} />
              </Button>
            </div>

            {currentWorld ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="fantasy-border p-3 bg-purple-900/20 cursor-pointer hover:bg-purple-900/40">
                    <h3 className="font-semibold text-yellow-200">
                      {currentWorld.name}
                    </h3>
                    <p className="text-sm text-gray-300 mt-1 truncate">
                      {currentWorld.description}
                    </p>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 fantasy-input">
                  {worlds.map((world) => (
                    <DropdownMenuItem
                      key={world.id}
                      onSelect={(e) => {
                        e.preventDefault();
                        setCurrentWorldId(world.id);
                      }}
                      className={
                        world.id === currentWorldId ? "bg-purple-700/50" : ""
                      }
                    >
                      <span className="flex-1">{world.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto hover:bg-red-500/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(world);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="fantasy-border p-3 bg-purple-900/20">
                <p className="text-sm text-gray-400">
                  {t.dashboard.noWorldSelected}
                </p>
                <Button
                  size="sm"
                  className="fantasy-button mt-2 w-full"
                  onClick={() => setIsCreateWorldModalOpen(true)}
                >
                  {t.dashboard.createWorld}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <div key={item.href}>
                {item.children ? (
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-left hover:bg-purple-700/30 transition-colors duration-200"
                      onClick={item.onToggle}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-300">{item.title}</span>
                      </div>
                      {item.expanded ? (
                        <ChevronDown className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-yellow-400" />
                      )}
                    </Button>
                    {item.expanded && (
                      <div className="ml-6 mt-2 space-y-1">
                        {item.children.map((child) => (
                          <Link key={child.href} href={child.href}>
                            <Button
                              variant="ghost"
                              className={`w-full justify-between text-left text-sm ${
                                location === child.href
                                  ? "bg-purple-700/30 text-yellow-200"
                                  : "hover:bg-purple-700/20 text-gray-300"
                              }`}
                            >
                              <div className="flex items-center">
                                <child.icon className="mr-2 h-3 w-3" />
                                <span>{child.title}</span>
                              </div>
                              {child.count > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {child.count}
                                </Badge>
                              )}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-between text-left ${
                        location === item.href
                          ? "bg-purple-700/30 text-yellow-200"
                          : "hover:bg-purple-700/20 text-gray-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      {item.count !== undefined && item.count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {item.count}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {worlds.length > 0 && (
            <div className="pt-4 border-t border-yellow-500/20">
              <h3 className="text-sm font-fantasy font-semibold text-yellow-300 mb-2">
                Recent Worlds
              </h3>
              <div className="space-y-1">
                {worlds.slice(0, 3).map((world) => (
                  <Button
                    key={world.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left hover:bg-purple-700/20 transition-colors duration-200"
                    onClick={() => setCurrentWorldId(world.id)}
                  >
                    <Globe className="mr-2 h-3 w-3 text-green-400" />
                    <span className="truncate">{world.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </nav>
      </aside>

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
            setIsCreateWorldModalOpen(false);
          } catch (error) {
            console.error("Error creating world:", error);
          }
        }}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="fantasy-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
            <AlertDialogDescription>
              Ця дія є незворотною. Світ "{worldToDelete?.name}" буде видалено
              назавжди.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
