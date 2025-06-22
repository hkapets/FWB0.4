import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Users, Edit, Trash2, Eye } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import type { Character } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";

interface CharacterCardProps {
  character: Character;
  viewMode?: "grid" | "list";
  onEdit?: (character: Character) => void;
  onDelete?: (character: Character) => void;
  onView?: (character: Character) => void;
}

const getRaceColor = (race: string): string => {
  const colors: Record<string, string> = {
    Human: "bg-blue-900/30 text-blue-300 border-blue-500/30",
    Elf: "bg-green-900/30 text-green-300 border-green-500/30",
    Dwarf: "bg-orange-900/30 text-orange-300 border-orange-500/30",
    Halfling: "bg-yellow-900/30 text-yellow-300 border-yellow-500/30",
    Orc: "bg-red-900/30 text-red-300 border-red-500/30",
    Goblin: "bg-red-900/30 text-red-300 border-red-500/30",
    Angel: "bg-white/20 text-white border-white/30",
    Demon: "bg-red-900/30 text-red-300 border-red-500/30",
    Vampire: "bg-red-900/30 text-red-300 border-red-500/30",
    Werewolf: "bg-orange-900/30 text-orange-300 border-orange-500/30",
  };
  return colors[race] || "bg-gray-900/30 text-gray-300 border-gray-500/30";
};

const getMultilangValue = (
  value: unknown,
  language: string,
  fallback: string
): string => {
  if (typeof value === "object" && value !== null) {
    const castedValue = value as Record<string, unknown>;
    return String(castedValue[language] || castedValue["uk"] || fallback);
  }
  if (value) return String(value);
  return fallback;
};

export default function CharacterCard({
  character,
  viewMode = "grid",
  onEdit,
  onDelete,
  onView,
}: CharacterCardProps) {
  const { language } = useI18n();
  const raceColorClass = getRaceColor(character.race);

  const { data: events = [] } = useQuery<any[]>({ queryKey: ["/api/events"] });
  const relatedEvents = events.filter((e) => e.characterId === character.id);

  const characterName = getMultilangValue(
    character.name,
    language,
    "Без імені"
  );
  const characterDescription = getMultilangValue(
    character.description,
    language,
    ""
  );
  const ethnicity = getMultilangValue(character.ethnicity, language, "");

  if (viewMode === "list") {
    return (
      <TooltipProvider>
        <Card className="fantasy-border fantasy-card-hover transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full flex items-center justify-center border-2 border-yellow-500 transition-transform duration-200 hover:scale-110">
                  <Users className="text-white" size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-fantasy font-semibold text-yellow-200 truncate hover:text-yellow-100 transition-colors duration-200">
                      {characterName}
                    </h3>
                    {character.age && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className="text-xs bg-purple-900/30 text-purple-300 border-purple-500/30">
                            {character.age} років
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Вік: {character.age} років</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 mb-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          className={`text-xs ${raceColorClass} border transition-all duration-200 hover:scale-105`}
                        >
                          {character.race}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Раса: {character.race}</p>
                      </TooltipContent>
                    </Tooltip>
                    {ethnicity && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className="text-xs bg-blue-900/30 text-blue-300 border-blue-500/30">
                            {ethnicity}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Етнічна приналежність: {ethnicity}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {characterDescription && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {characterDescription}
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(character);
                        }}
                        className="transition-all duration-200 hover:scale-110 hover:bg-blue-500/20"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Переглянути деталі</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {onEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(character);
                        }}
                        className="transition-all duration-200 hover:scale-110 hover:bg-yellow-500/20"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Редагувати</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(character);
                        }}
                        className="transition-all duration-200 hover:scale-110 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Видалити</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Card
        className="fantasy-border fantasy-card-hover transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/10"
        onClick={() => onView?.(character)}
      >
        <CardContent className="p-6">
          {/* Character Avatar */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-yellow-500 transition-transform duration-200 group-hover:scale-110">
              <Users className="text-white" size={24} />
            </div>

            <h3 className="font-fantasy font-semibold text-yellow-200 mb-1 group-hover:text-yellow-100 transition-colors duration-200">
              {characterName}
            </h3>

            <div className="flex items-center justify-center space-x-2 mb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    className={`text-xs ${raceColorClass} border transition-all duration-200 hover:scale-105`}
                  >
                    {character.race}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Раса: {character.race}</p>
                </TooltipContent>
              </Tooltip>
              {character.age && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="text-xs bg-purple-900/30 text-purple-300 border-purple-500/30">
                      {character.age}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Вік: {character.age} років</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {ethnicity && (
              <div className="text-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="text-xs bg-blue-900/30 text-blue-300 border-blue-500/30">
                      {ethnicity}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Етнічна приналежність: {ethnicity}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {characterDescription && (
              <p className="text-xs text-gray-300 text-center line-clamp-3 group-hover:text-gray-200 transition-colors duration-200">
                {characterDescription}
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(character);
                          }}
                          className="transition-all duration-200 hover:scale-110 hover:bg-yellow-500/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Редагувати</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(character);
                          }}
                          className="transition-all duration-200 hover:scale-110 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Видалити</p>
                      </TooltipContent>
                    </Tooltip>
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
                      className="underline text-yellow-300 hover:text-yellow-200 cursor-pointer transition-colors duration-200"
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
    </TooltipProvider>
  );
}
