import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
  Plus
} from "lucide-react";
import CreateWorldModal from "@/components/modals/create-world-modal";
import { useTranslation } from "@/lib/i18n";
import type { World } from "@shared/schema";

interface SidebarProps {
  currentWorldId: number | null;
  setCurrentWorldId: (id: number | null) => void;
}

export default function Sidebar({ currentWorldId, setCurrentWorldId }: SidebarProps) {
  const [location] = useLocation();
  const [isCreateWorldModalOpen, setIsCreateWorldModalOpen] = useState(false);
  const t = useTranslation();

  const { data: worlds = [] } = useQuery<World[]>({
    queryKey: ["/api/worlds"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/worlds", currentWorldId, "stats"],
    enabled: !!currentWorldId,
  });

  const currentWorld = worlds.find(w => w.id === currentWorldId);

  const navigationItems = [
    { path: "/dashboard", icon: Home, label: t.navigation.dashboard, count: null },
    { path: "/locations", icon: MapPin, label: t.navigation.locations, count: stats?.locations },
    { path: "/characters", icon: Users, label: t.navigation.characters, count: stats?.characters },
    { path: "/creatures", icon: Crown, label: t.navigation.creatures, count: stats?.creatures },
    { path: "/world-map", icon: Map, label: t.navigation.worldMap, count: null },
    { path: "/settings", icon: Settings, label: t.navigation.settings, count: null },
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
              <div className="fantasy-border p-3 bg-purple-900/20">
                <h3 className="font-semibold text-yellow-200">{currentWorld.name}</h3>
                <p className="text-sm text-gray-300 mt-1">{currentWorld.description}</p>
              </div>
            ) : (
              <div className="fantasy-border p-3 bg-purple-900/20">
                <p className="text-sm text-gray-400">{t.dashboard.noWorldSelected}</p>
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
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || (location === "/" && item.path === "/dashboard");
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start nav-item hover:bg-purple-700/30 transition-colors duration-200 ${
                      isActive ? "active" : ""
                    }`}
                  >
                    <Icon className="mr-3 h-4 w-4 text-yellow-400" />
                    <span className="font-medium">{item.label}</span>
                    {item.count !== null && item.count !== undefined && (
                      <Badge variant="secondary" className="ml-auto bg-purple-600">
                        {item.count}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
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
        onWorldCreated={(world) => {
          setCurrentWorldId(world.id);
          setIsCreateWorldModalOpen(false);
        }}
      />
    </>
  );
}
