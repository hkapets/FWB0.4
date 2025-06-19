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
import { useState } from "react";
import CreateWorldModal from "@/components/modals/create-world-modal";
import CreateLocationModal from "@/components/modals/create-location-modal";
import CreateCharacterModal from "@/components/modals/create-character-modal";
import CreateCreatureModal from "@/components/modals/create-creature-modal";
import LocationCard from "@/components/cards/location-card";
import CharacterCard from "@/components/cards/character-card";
import { formatTimeAgo } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import type { World, Location, Character } from "@shared/schema";

export default function DashboardPage() {
  const t = useTranslation();
  const [isCreateWorldModalOpen, setIsCreateWorldModalOpen] = useState(false);
  const [isCreateLocationModalOpen, setIsCreateLocationModalOpen] =
    useState(false);
  const [isCreateCharacterModalOpen, setIsCreateCharacterModalOpen] =
    useState(false);
  const [isCreateCreatureModalOpen, setIsCreateCreatureModalOpen] =
    useState(false);
  const [currentWorldId, setCurrentWorldId] = useState<number | null>(null);

  const { data: worlds = [] } = useQuery<World[]>({
    queryKey: ["/api/worlds"],
  });

  // Use the first world as current world for now
  const currentWorld = worlds.length > 0 ? worlds[0] : null;
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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{t.navigation.dashboard}</h1>
      <p>Dashboard content coming soon...</p>
    </div>
  );
}
