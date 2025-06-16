import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  Filter,
  Grid,
  List
} from "lucide-react";
import CreateCharacterModal from "@/components/modals/create-character-modal";
import CharacterCard from "@/components/cards/character-card";
import type { World, Character } from "@shared/schema";

export default function Characters() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRace, setFilterRace] = useState<string>("all");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: worlds = [] } = useQuery<World[]>({
    queryKey: ["/api/worlds"],
  });

  // Use the first world as current world for now
  const currentWorld = worlds.length > 0 ? worlds[0] : null;
  const worldId = currentWorld?.id || null;

  const { data: characters = [], isLoading } = useQuery<Character[]>({
    queryKey: ["/api/worlds", worldId, "characters"],
    enabled: !!worldId,
  });

  // Filter and search characters
  const filteredCharacters = characters.filter((character) => {
    const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         character.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRace = filterRace === "all" || character.race.toLowerCase() === filterRace.toLowerCase();
    const matchesClass = filterClass === "all" || character.class.toLowerCase() === filterClass.toLowerCase();
    return matchesSearch && matchesRace && matchesClass;
  });

  // Get unique races and classes for filters
  const races = Array.from(new Set(characters.map(c => c.race)));
  const classes = Array.from(new Set(characters.map(c => c.class)));

  if (!currentWorld) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Users className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-fantasy font-bold text-yellow-200 mb-2">
            No World Selected
          </h2>
          <p className="text-gray-300">
            Please select or create a world to manage characters.
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
                Characters
              </h1>
              <p className="text-lg text-gray-300">
                Manage the heroes, villains, and NPCs in {currentWorld.name}
              </p>
            </div>
            <Button 
              className="fantasy-button px-6 py-3"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Character
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <Card className="fantasy-border mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search characters..."
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
                      value={filterRace}
                      onChange={(e) => setFilterRace(e.target.value)}
                    >
                      <option value="all">All Races</option>
                      {races.map((race) => (
                        <option key={race} value={race}>
                          {race}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    className="fantasy-input px-3 py-2 rounded-lg"
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                  >
                    <option value="all">All Classes</option>
                    {classes.map((characterClass) => (
                      <option key={characterClass} value={characterClass}>
                        {characterClass}
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
              Showing {filteredCharacters.length} of {characters.length} characters
            </p>
            <div className="flex gap-2 flex-wrap">
              {races.length > 0 && races.map((race) => {
                const count = characters.filter(c => c.race === race).length;
                return (
                  <Badge key={race} variant="outline" className="bg-yellow-900/30">
                    {race} ({count})
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Characters Grid/List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-300">Loading characters...</div>
            </div>
          ) : filteredCharacters.length === 0 ? (
            <div className="text-center py-12">
              {characters.length === 0 ? (
                <>
                  <Users className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-fantasy font-bold text-yellow-200 mb-2">
                    No Characters Yet
                  </h2>
                  <p className="text-gray-300 mb-6 max-w-md mx-auto">
                    Bring your world to life by creating characters like heroes, villains, 
                    merchants, and other inhabitants.
                  </p>
                  <Button 
                    className="fantasy-button px-6 py-3"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Character
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
                      setFilterRace("all");
                      setFilterClass("all");
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
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {filteredCharacters.map((character) => (
                <CharacterCard 
                  key={character.id} 
                  character={character} 
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {worldId && (
        <CreateCharacterModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          worldId={worldId}
        />
      )}
    </>
  );
}
