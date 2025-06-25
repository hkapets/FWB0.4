import React, { useState, useEffect, useMemo } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

const TYPE_LABELS: Record<string, string> = {
  character: "Персонажі",
  location: "Локації",
  event: "Події",
  artifact: "Артефакти",
  race: "Раси",
  creature: "Істоти",
  note: "Нотатки",
  scenario: "Сценарії",
};

interface SearchableItem {
  id: number;
  type: string;
  name: string;
  description: string;
  route: string;
}

export default function GlobalSearch({ worldId }: { worldId?: number }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  
  // Завантажуємо дані з усіх розділів
  const { data: characters = [] } = useQuery({
    queryKey: ["/api/worlds", worldId, "characters"],
    enabled: !!worldId,
  });
  
  const { data: locations = [] } = useQuery({
    queryKey: ["/api/worlds", worldId, "locations"],
    enabled: !!worldId,
  });
  
  const { data: events = [] } = useQuery({
    queryKey: ["/api/worlds", worldId, "events"],
    enabled: !!worldId,
  });
  
  const { data: artifacts = [] } = useQuery({
    queryKey: ["/api/worlds", worldId, "artifacts"],
    enabled: !!worldId,
  });
  
  const { data: races = [] } = useQuery({
    queryKey: ["/api/worlds", worldId, "races"],
    enabled: !!worldId,
  });
  
  const { data: creatures = [] } = useQuery({
    queryKey: ["/api/worlds", worldId, "creatures"],
    enabled: !!worldId,
  });

  // Об'єднуємо всі дані для пошуку
  const searchableData = useMemo((): SearchableItem[] => {
    const items: SearchableItem[] = [];
    
    characters.forEach((char: any) => {
      items.push({
        id: char.id,
        type: "character",
        name: char.name?.uk || char.name || "Персонаж",
        description: char.description?.uk || char.description || "",
        route: "/characters"
      });
    });
    
    locations.forEach((loc: any) => {
      items.push({
        id: loc.id,
        type: "location",
        name: loc.name?.uk || loc.name || "Локація",
        description: loc.description?.uk || loc.description || "",
        route: "/lore/geography"
      });
    });
    
    events.forEach((event: any) => {
      items.push({
        id: event.id,
        type: "event",
        name: event.name?.uk || event.name || "Подія",
        description: event.description?.uk || event.description || "",
        route: "/timeline"
      });
    });
    
    artifacts.forEach((art: any) => {
      items.push({
        id: art.id,
        type: "artifact",
        name: art.name?.uk || art.name || "Артефакт",
        description: art.description?.uk || art.description || "",
        route: "/lore/artifacts"
      });
    });
    
    races.forEach((race: any) => {
      items.push({
        id: race.id,
        type: "race",
        name: race.name?.uk || race.name || "Раса",
        description: race.description?.uk || race.description || "",
        route: "/lore/races"
      });
    });
    
    creatures.forEach((creature: any) => {
      items.push({
        id: creature.id,
        type: "creature",
        name: creature.name?.uk || creature.name || "Істота",
        description: creature.description?.uk || creature.description || "",
        route: "/lore/bestiary"
      });
    });
    
    return items;
  }, [characters, locations, events, artifacts, races, creatures]);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    
    const queryLower = query.toLowerCase();
    return searchableData.filter(item =>
      item.name.toLowerCase().includes(queryLower) ||
      item.description.toLowerCase().includes(queryLower)
    ).slice(0, 20); // Обмежуємо результати
  }, [query, searchableData]);

  // Групування результатів за типом
  const grouped = results.reduce<Record<string, typeof results>>(
    (acc, item) => {
      acc[item.type] = acc[item.type] || [];
      acc[item.type].push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="relative w-80">
      <div className="flex items-center bg-gradient-to-r from-purple-900/90 to-purple-800/90 border border-yellow-400/60 rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm focus-within:ring-2 focus-within:ring-yellow-400/50 focus-within:border-yellow-300 transition-all duration-300">
        <Search className="h-5 w-5 text-yellow-300 mr-3 flex-shrink-0" />
        <input
          type="text"
          className="bg-transparent outline-none text-yellow-100 placeholder:text-yellow-400/70 flex-1 font-medium"
          placeholder="Глобальний пошук..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="ml-2 text-yellow-400/60 hover:text-yellow-300 transition-colors"
          >
            ×
          </button>
        )}
      </div>
      {focused && query.length > 1 && (
        <div className="absolute left-0 mt-3 w-full bg-gradient-to-br from-gray-900/95 to-purple-900/95 border border-yellow-400/60 rounded-xl shadow-2xl backdrop-blur-md z-50 max-h-96 overflow-hidden animate-fade-in">
          {results.length === 0 ? (
            <div className="p-6 text-center">
              <Search className="h-12 w-12 text-yellow-400/50 mx-auto mb-3" />
              <p className="text-yellow-300/80 font-medium">Нічого не знайдено</p>
              <p className="text-yellow-400/50 text-sm mt-1">Спробуйте інший запит</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {Object.entries(grouped).map(([type, items]) => (
                <div key={type} className="border-b border-yellow-900/30 last:border-b-0">
                  <div className="px-5 py-3 text-xs uppercase text-yellow-400 font-bold bg-purple-900/40 border-b border-yellow-900/20">
                    {TYPE_LABELS[type]} ({items.length})
                  </div>
                  {items.map((item, idx) => (
                    <Link
                      key={item.id + "-" + item.type}
                      href={item.route}
                      className="block px-5 py-4 hover:bg-gradient-to-r hover:from-yellow-400/10 hover:to-purple-600/10 cursor-pointer transition-all duration-200 border-b border-yellow-900/10 last:border-b-0 group"
                      onClick={() => setQuery("")}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-yellow-200 group-hover:text-yellow-100 mb-1">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-300/80 group-hover:text-gray-200/90 truncate">
                            {item.description}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-yellow-400/50 group-hover:text-yellow-300 ml-3 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
