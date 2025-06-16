import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, MapPin, Users, Crown, Compass } from "lucide-react";
import type { World, Location, Character, Creature } from "@shared/schema";

export default function WorldMap() {
  const { data: worlds = [] } = useQuery<World[]>({
    queryKey: ["/api/worlds"],
  });

  // Use the first world as current world for now
  const currentWorld = worlds.length > 0 ? worlds[0] : null;
  const worldId = currentWorld?.id || null;

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/worlds", worldId, "locations"],
    enabled: !!worldId,
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ["/api/worlds", worldId, "characters"],
    enabled: !!worldId,
  });

  const { data: creatures = [] } = useQuery<Creature[]>({
    queryKey: ["/api/worlds", worldId, "creatures"],
    enabled: !!worldId,
  });

  if (!currentWorld) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Map className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-fantasy font-bold text-yellow-200 mb-2">
            No World Selected
          </h2>
          <p className="text-gray-300">
            Please select or create a world to view the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-fantasy font-bold text-yellow-200 mb-2">
            World Map
          </h1>
          <p className="text-lg text-gray-300">
            Visual overview of {currentWorld.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Visualization */}
          <div className="lg:col-span-3">
            <Card className="fantasy-border h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-200 font-fantasy">
                  <Compass className="mr-2" />
                  Interactive Map
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="w-full h-full bg-gradient-to-br from-green-900/20 via-brown-900/20 to-blue-900/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Stylized fantasy map background */}
                  <div className="absolute inset-0 opacity-10">
                    <svg
                      viewBox="0 0 800 600"
                      className="w-full h-full"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Decorative fantasy map elements */}
                      <defs>
                        <pattern id="mapTexture" patternUnits="userSpaceOnUse" width="40" height="40">
                          <rect width="40" height="40" fill="#1a1a1a" />
                          <circle cx="20" cy="20" r="1" fill="#4a5568" />
                        </pattern>
                      </defs>
                      <rect width="800" height="600" fill="url(#mapTexture)" />
                      
                      {/* Mountain ranges */}
                      <path d="M100 200 L150 150 L200 200 L250 150 L300 200" stroke="#68D391" strokeWidth="2" fill="none" />
                      <path d="M400 300 L450 250 L500 300 L550 250 L600 300" stroke="#68D391" strokeWidth="2" fill="none" />
                      
                      {/* Rivers */}
                      <path d="M0 350 Q200 320 400 350 T800 350" stroke="#63B3ED" strokeWidth="3" fill="none" />
                      <path d="M150 0 Q180 200 200 400 T250 600" stroke="#63B3ED" strokeWidth="2" fill="none" />
                    </svg>
                  </div>

                  {/* Location markers */}
                  {locations.map((location, index) => {
                    // Simple positioning algorithm for demo
                    const x = (index * 120 + 100) % 600;
                    const y = (Math.floor(index / 5) * 100 + 150) % 400;
                    
                    return (
                      <div
                        key={location.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                        style={{ left: `${x}px`, top: `${y}px` }}
                      >
                        <div className="bg-purple-600 rounded-full p-2 shadow-lg cursor-pointer hover:bg-purple-500 transition-colors">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {location.name}
                        </div>
                      </div>
                    );
                  })}

                  {locations.length === 0 && (
                    <div className="text-center text-gray-400">
                      <Map className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-fantasy">Your map awaits locations...</p>
                      <p className="text-sm">Add locations to see them appear on the map</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Legend and Info */}
          <div className="space-y-6">
            {/* Legend */}
            <Card className="fantasy-border">
              <CardHeader>
                <CardTitle className="text-yellow-200 font-fantasy">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-600 rounded-full p-1">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-300">Locations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-600 rounded-full p-1">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-300">Characters</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-red-600 rounded-full p-1">
                    <Crown className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-300">Creatures</span>
                </div>
              </CardContent>
            </Card>

            {/* Map Statistics */}
            <Card className="fantasy-border">
              <CardHeader>
                <CardTitle className="text-yellow-200 font-fantasy">Map Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Locations</span>
                  <span className="text-purple-400 font-semibold">{locations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Characters</span>
                  <span className="text-green-400 font-semibold">{characters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Creatures</span>
                  <span className="text-red-400 font-semibold">{creatures.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Locations */}
            {locations.length > 0 && (
              <Card className="fantasy-border">
                <CardHeader>
                  <CardTitle className="text-yellow-200 font-fantasy">Recent Locations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {locations.slice(-5).reverse().map((location) => (
                    <div key={location.id} className="flex items-center space-x-2 p-2 rounded bg-purple-900/20 hover:bg-purple-900/30 transition-colors cursor-pointer">
                      <MapPin className="h-3 w-3 text-purple-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{location.name}</p>
                        <p className="text-xs text-gray-400">{location.type}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Map Controls */}
            <Card className="fantasy-border">
              <CardHeader>
                <CardTitle className="text-yellow-200 font-fantasy">Map Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-400">
                  Interactive map features coming soon:
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Zoom and pan</li>
                  <li>• Location details on hover</li>
                  <li>• Custom markers</li>
                  <li>• Route planning</li>
                  <li>• Terrain layers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
