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
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import CreateWorldModal from "@/components/modals/create-world-modal";
import CreateLocationModal from "@/components/modals/create-location-modal";
import CreateCharacterModal from "@/components/modals/create-character-modal";
import CreateCreatureModal from "@/components/modals/create-creature-modal";
import LocationCard from "@/components/cards/location-card";
import CharacterCard from "@/components/cards/character-card";
import { formatTimeAgo } from "@/lib/utils";
import type { World, Location, Character } from "@shared/schema";

export default function Dashboard() {
  const [isCreateWorldModalOpen, setIsCreateWorldModalOpen] = useState(false);
  const [isCreateLocationModalOpen, setIsCreateLocationModalOpen] = useState(false);
  const [isCreateCharacterModalOpen, setIsCreateCharacterModalOpen] = useState(false);
  const [isCreateCreatureModalOpen, setIsCreateCreatureModalOpen] = useState(false);
  const [currentWorldId, setCurrentWorldId] = useState<number | null>(null);

  const { data: worlds = [] } = useQuery<World[]>({
    queryKey: ["/api/worlds"],
  });

  // Use the first world as current world for now
  const currentWorld = worlds.length > 0 ? worlds[0] : null;
  const worldId = currentWorld?.id || null;

  const { data: stats } = useQuery({
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
      title: "Create World",
      description: "Start building a new fantasy realm",
      icon: Plus,
      color: "bg-green-600 hover:bg-green-500",
      onClick: () => setIsCreateWorldModalOpen(true),
    },
    {
      title: "Add Location",
      description: "Create cities, forests, and landmarks",
      icon: MapPin,
      color: "bg-purple-600 hover:bg-purple-500",
      onClick: () => setIsCreateLocationModalOpen(true),
      disabled: !worldId,
    },
    {
      title: "Create Character",
      description: "Design heroes, villains, and NPCs",
      icon: UserPlus,
      color: "bg-yellow-600 hover:bg-yellow-500",
      onClick: () => setIsCreateCharacterModalOpen(true),
      disabled: !worldId,
    },
    {
      title: "Add Creature",
      description: "Create monsters and mythical beings",
      icon: Crown,
      color: "bg-red-600 hover:bg-red-500",
      onClick: () => setIsCreateCreatureModalOpen(true),
      disabled: !worldId,
    },
  ];

  return (
    <>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-fantasy font-bold text-yellow-200 mb-2">
              Welcome to Your Fantasy World
            </h1>
            <p className="text-lg text-gray-300">
              Build, explore, and manage your mystical realms with powerful world-building tools
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  className={`fantasy-border p-6 h-auto fantasy-card-hover transition-all duration-300 group ${
                    action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  variant="ghost"
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  <div className="text-center w-full">
                    <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <h3 className="font-fantasy font-semibold text-yellow-200 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-400">{action.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* World Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* World Stats */}
            <Card className="fantasy-border">
              <CardHeader>
                <CardTitle className="text-xl font-fantasy font-semibold text-yellow-200 flex items-center">
                  <BarChart3 className="mr-2" />
                  World Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Locations</span>
                      <span className="text-green-400 font-semibold">{stats.locations}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Characters</span>
                      <span className="text-yellow-400 font-semibold">{stats.characters}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Creatures</span>
                      <span className="text-purple-400 font-semibold">{stats.creatures}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Elements</span>
                      <span className="text-yellow-200 font-bold">{stats.total}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-400">
                    {worldId ? "Loading..." : "No world selected"}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="fantasy-border">
              <CardHeader>
                <CardTitle className="text-xl font-fantasy font-semibold text-yellow-200 flex items-center">
                  <History className="mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {locations.length === 0 && characters.length === 0 ? (
                  <div className="text-center text-gray-400">
                    No recent activity
                  </div>
                ) : (
                  <>
                    {recentLocations.slice(0, 2).map((location) => (
                      <div key={location.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-300">
                          Added location "{location.name}"
                        </span>
                      </div>
                    ))}
                    {recentCharacters.slice(0, 2).map((character) => (
                      <div key={character.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-300">
                          Created character "{character.name}"
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Help */}
            <Card className="fantasy-border">
              <CardHeader>
                <CardTitle className="text-xl font-fantasy font-semibold text-yellow-200 flex items-center">
                  <HelpCircle className="mr-2" />
                  Quick Help
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <h4 className="font-semibold text-yellow-300 text-sm">Getting Started</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Begin by creating your first world or selecting an existing one
                  </p>
                </div>
                <div className="p-3 bg-green-900/30 rounded-lg">
                  <h4 className="font-semibold text-yellow-300 text-sm">World Map</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Visualize your world with our interactive map tool
                  </p>
                </div>
                <div className="p-3 bg-yellow-900/30 rounded-lg">
                  <h4 className="font-semibold text-yellow-300 text-sm">Export & Share</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Export your world as JSON or formatted text
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Locations */}
          {recentLocations.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
                  <MapPin className="mr-2" />
                  Recent Locations
                </h2>
                <Button className="fantasy-button px-4 py-2">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentLocations.map((location) => (
                  <LocationCard key={location.id} location={location} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Characters */}
          {recentCharacters.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-fantasy font-bold text-yellow-200 flex items-center">
                  <UserPlus className="mr-2" />
                  Recent Characters
                </h2>
                <Button className="fantasy-button px-4 py-2">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentCharacters.map((character) => (
                  <CharacterCard key={character.id} character={character} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!currentWorld && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="text-white" size={48} />
              </div>
              <h2 className="text-2xl font-fantasy font-bold text-yellow-200 mb-2">
                Welcome to Fantasy World Builder
              </h2>
              <p className="text-gray-300 mb-6 max-w-md mx-auto">
                Create your first fantasy world to begin your world-building journey. 
                Add locations, characters, and creatures to bring your realm to life.
              </p>
              <Button 
                className="fantasy-button px-6 py-3"
                onClick={() => setIsCreateWorldModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First World
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateWorldModal
        isOpen={isCreateWorldModalOpen}
        onClose={() => setIsCreateWorldModalOpen(false)}
        onWorldCreated={(world) => {
          setCurrentWorldId(world.id);
          setIsCreateWorldModalOpen(false);
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
    </>
  );
}
