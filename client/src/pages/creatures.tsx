import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Plus,
  Search,
  Filter,
  Grid,
  List
} from "lucide-react";
import CreateCreatureModal from "@/components/modals/create-creature-modal";
import CreatureCard from "@/components/cards/creature-card";
import type { World, Creature } from "@shared/schema";

export default function Creatures() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDanger, setFilterDanger] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: worlds = [] } = useQuery<World[]>({
    queryKey: ["/api/worlds"],
  });

  // Use the first world as current world for now
  const currentWorld = worlds.length > 0 ? worlds[0] : null;
  const worldId = currentWorld?.id || null;

  const { data: creatures = [], isLoading } = useQuery<Creature[]>({
    queryKey: ["/api/worlds", worldId, "creatures"],
    enabled: !!worldId,
  });

  // Filter and search creatures
  const filteredCreatures = creatures.filter((creature) => {
    const matchesSearch = creature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creature.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || creature.type.toLowerCase() === filterType.toLowerCase();
    const matchesDanger = filterDanger === "all" || creature.dangerLevel.toLowerCase() === filterDanger.toLowerCase();
    return matchesSearch && matchesType && matchesDanger;
  });

  // Get unique types and danger levels for filters
  const creatureTypes = Array.from(new Set(creatures.map(c => c.type)));
  const dangerLevels = Array.from(new Set(creatures.map(c => c.dangerLevel)));

  if (!currentWorld) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Crown className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-fantasy font-bold text-yellow-200 mb-2">
            No World Selected
          </h2>
          <p className="text-gray-300">
            Please select or create a world to manage creatures.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-fantasy font-bold text-yellow-200 mb-2">
                Creatures
              </h1>
              <p className="text-lg text-gray-300">
                Manage the monsters and mythical beings in {currentWorld.name}
              </p>
            </div>
            <Button 
              className="fantasy-button px-6 py-3"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Creature
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <Card className="fantasy-border mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search creatures..."
                    className="fantasy-input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      className="fantasy-input px-3 py-2 rounded-lg"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      {creatureTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    className="fantasy-input px-3 py-2 rounded-lg"
                    value={filterDanger}
                    onChange={(e) => setFilterDanger(e.target.value)}
                  >
                    <option value="all">All Danger Levels</option>
                    {dangerLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-300">
              Showing {filteredCreatures.length} of {creatures.length} creatures
            </p>
            <div className="flex gap-2 flex-wrap">
              {dangerLevels.length > 0 && dangerLevels.map((level) => {
                const count = creatures.filter(c => c.dangerLevel === level).length;
                return (
                  <Badge key={level} variant="outline" className="bg-red-900/30">
                    {level} ({count})
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Creatures Grid/List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-300">Loading creatures...</div>
            </div>
          ) : filteredCreatures.length === 0 ? (
            <div className="text-center py-12">
              {creatures.length === 0 ? (
                <>
                  <Crown className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-fantasy font-bold text-yellow-200 mb-2">
                    No Creatures Yet
                  </h2>
                  <p className="text-gray-300 mb-6 max-w-md mx-auto">
                    Populate your world with fascinating creatures like dragons, 
                    unicorns, goblins, and other mythical beings.
                  </p>
                  <Button 
                    className="fantasy-button px-6 py-3"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Creature
                  </Button>
                </>
              ) : (
                <>
                  <Search className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-fantasy font-bold text-yellow-200 mb-2">
                    No Results Found
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Try adjusting your search terms or filter settings.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterType("all");
                      setFilterDanger("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredCreatures.map((creature) => (
                <CreatureCard 
                  key={creature.id} 
                  creature={creature} 
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {worldId && (
        <CreateCreatureModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          worldId={worldId}
        />
      )}
    </>
  );
}
