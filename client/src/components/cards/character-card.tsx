import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Star, Edit, Trash2, Eye } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import type { Character } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface CharacterCardProps {
  character: Character;
  viewMode?: "grid" | "list";
  onEdit?: (character: Character) => void;
  onDelete?: (character: Character) => void;
  onView?: (character: Character) => void;
}

const getRaceColor = (race: string): string => {
  const colors: Record<string, string> = {
    Human: "bg-blue-900/30 text-blue-300",
    Elf: "bg-green-900/30 text-green-300",
    Dwarf: "bg-orange-900/30 text-orange-300",
    Halfling: "bg-yellow-900/30 text-yellow-300",
    Orc: "bg-red-900/30 text-red-300",
    Goblin: "bg-red-900/30 text-red-300",
    Angel: "bg-white/20 text-white",
    Demon: "bg-red-900/30 text-red-300",
    Vampire: "bg-red-900/30 text-red-300",
    Werewolf: "bg-orange-900/30 text-orange-300",
  };
  return colors[race] || "bg-gray-900/30 text-gray-300";
};

const getClassColor = (characterClass: string): string => {
  const colors: Record<string, string> = {
    Warrior: "bg-red-900/30 text-red-300",
    Wizard: "bg-purple-900/30 text-purple-300",
    Rogue: "bg-gray-900/30 text-gray-300",
    Cleric: "bg-yellow-900/30 text-yellow-300",
    Ranger: "bg-green-900/30 text-green-300",
    Bard: "bg-pink-900/30 text-pink-300",
    Paladin: "bg-blue-900/30 text-blue-300",
    Sorcerer: "bg-purple-900/30 text-purple-300",
    Warlock: "bg-purple-900/30 text-purple-300",
    Druid: "bg-green-900/30 text-green-300",
  };
  return colors[characterClass] || "bg-gray-900/30 text-gray-300";
};

export default function CharacterCard({
  character,
  viewMode = "grid",
  onEdit,
  onDelete,
  onView,
}: CharacterCardProps) {
  const raceColorClass = getRaceColor(character.race);
  const classColorClass = getClassColor(character.class);

  const { data: events = [] } = useQuery<any[]>({ queryKey: ["/api/events"] });
  const relatedEvents = events.filter((e) => e.characterId === character.id);

  if (viewMode === "list") {
    return (
      <Card className="fantasy-border fantasy-card-hover transition-all duration-300 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full flex items-center justify-center border-2 border-yellow-500">
                <Users className="text-white" size={24} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-fantasy font-semibold text-yellow-200 truncate">
                    {character.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-400" />
                    <span className="text-xs text-gray-400">
                      Level {character.level}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={`text-xs ${raceColorClass}`}>
                    {character.race}
                  </Badge>
                  <Badge className={`text-xs ${classColorClass}`}>
                    {character.class}
                  </Badge>
                </div>

                {character.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {character.description}
                  </p>
                )}

                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
                  <span>
                    {character.updatedAt
                      ? formatTimeAgo(character.updatedAt)
                      : "Recently"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(character);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(character);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(character);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="fantasy-border fantasy-card-hover transition-all duration-300 cursor-pointer group"
      onClick={() => onView?.(character)}
    >
      <CardContent className="p-6">
        {/* Character Avatar */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-yellow-500">
            <Users className="text-white" size={24} />
          </div>

          <h3 className="font-fantasy font-semibold text-yellow-200 mb-1 group-hover:text-yellow-100 transition-colors duration-200">
            {character.name}
          </h3>

          <Badge className={`text-xs ${raceColorClass} mb-2`}>
            {character.race}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="text-center">
            <Badge className={`text-xs ${classColorClass}`}>
              {character.class}
            </Badge>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400" />
              <span className="text-xs text-gray-400">
                Level {character.level}
              </span>
            </div>
          </div>

          {character.description && (
            <p className="text-xs text-gray-300 text-center line-clamp-3">
              {character.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">
              {character.updatedAt
                ? formatTimeAgo(character.updatedAt)
                : "Recently"}
            </span>

            {(onEdit || onDelete) && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(character);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(character);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {relatedEvents.length > 0 && (
          <div className="mt-6">
            <div className="text-xs text-gray-400 mb-1 font-semibold">
              Події за участі персонажа:
            </div>
            <ul className="space-y-1">
              {relatedEvents.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/timeline?event=${event.id}`}
                    className="underline text-yellow-300 hover:text-yellow-200 cursor-pointer"
                  >
                    {event.name}{" "}
                    <span className="text-gray-400">({event.date})</span>{" "}
                    <span className="ml-1 text-xs bg-yellow-900/40 rounded px-1">
                      {event.type}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
