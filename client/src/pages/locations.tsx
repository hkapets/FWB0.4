import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Grid,
  List
} from "lucide-react";
import CreateLocationModal from "@/components/modals/create-location-modal";
import LocationCard from "@/components/cards/location-card";
import type { World, Location } from "@shared/schema";

export default function Locations() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: worlds = [] } = useQuery<World[]>({
    queryKey: ["/api/worlds"],
  });

  // Use the first world as current world for now
  const currentWorld = worlds.length > 0 ? worlds[0] : null;
  const worldId = currentWorld?.id || null;

  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["/api/worlds", worldId, "locations"],
    enabled: !!worldId,
  });

  // Filter and search locations
  const filteredLocations = locations.filter((location) => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || location.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Get unique location types for filter
  const locationTypes = Array.from(new Set(locations.map(l => l.type)));

  if (!currentWorld) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <MapPin className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-fantasy font-bold text-yellow-200 mb-2">
            No World Selected
          </h2>
          <p className="text-gray-300">
            Please select or create a world to manage locations.
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
                Locations
              </h1>
              <p className="text-lg text-gray-300">
                Manage the places and landmarks in {currentWorld.name}
              </p>
            </div>
            <Button 
              className="fantasy-button px-6 py-3"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <Card className="fantasy-border mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search locations..."
                    className="fantasy-input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    className="fantasy-input px-3 py-2 rounded-lg"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    {locationTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

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
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-300">
              Showing {filteredLocations.length} of {locations.length} locations
            </p>
            {locationTypes.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {locationTypes.map((type) => {
                  const count = locations.filter(l => l.type === type).length;
                  return (
                    <Badge key={type} variant="outline" className="bg-purple-900/30">
                      {type} ({count})
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Locations Grid/List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-300">Loading locations...</div>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-12">
              {locations.length === 0 ? (
                <>
                  <MapPin className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-fantasy font-bold text-yellow-200 mb-2">
                    No Locations Yet
                  </h2>
                  <p className="text-gray-300 mb-6 max-w-md mx-auto">
                    Start building your world by adding locations like cities, forests, 
                    mountains, and other landmarks.
                  </p>
                  <Button 
                    className="fantasy-button px-6 py-3"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Location
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
              {filteredLocations.map((location) => (
                <LocationCard 
                  key={location.id} 
                  location={location} 
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {worldId && (
        <CreateLocationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          worldId={worldId}
        />
      )}
    </>
  );
}
