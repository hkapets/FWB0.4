import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Crown,
  Zap,
  Edit,
  Trash2,
  Eye,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import type { Creature } from "@shared/schema";

interface CreatureCardProps {
  creature: Creature;
  viewMode?: "grid" | "list";
  onEdit?: (creature: Creature) => void;
  onDelete?: (creature: Creature) => void;
  onView?: (creature: Creature) => void;
}

const getDangerColor = (dangerLevel: string): string => {
  const colors: Record<string, string> = {
    Harmless: "bg-green-900/30 text-green-300 border-green-500/30",
    Low: "bg-blue-900/30 text-blue-300 border-blue-500/30",
    Moderate: "bg-yellow-900/30 text-yellow-300 border-yellow-500/30",
    High: "bg-orange-900/30 text-orange-300 border-orange-500/30",
    Extreme: "bg-red-900/30 text-red-300 border-red-500/30",
    Legendary: "bg-purple-900/30 text-purple-300 border-purple-500/30",
  };
  return (
    colors[dangerLevel] || "bg-gray-900/30 text-gray-300 border-gray-500/30"
  );
};

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    Crown: "bg-red-900/30 text-red-300 border-red-500/30",
    Beast: "bg-green-900/30 text-green-300 border-green-500/30",
    Undead: "bg-gray-900/30 text-gray-300 border-gray-500/30",
    Demon: "bg-red-900/30 text-red-300 border-red-500/30",
    Angel: "bg-yellow-900/30 text-yellow-300 border-yellow-500/30",
    Elemental: "bg-blue-900/30 text-blue-300 border-blue-500/30",
    Fey: "bg-pink-900/30 text-pink-300 border-pink-500/30",
    Giant: "bg-orange-900/30 text-orange-300 border-orange-500/30",
    Spirit: "bg-purple-900/30 text-purple-300 border-purple-500/30",
  };
  return colors[type] || "bg-gray-900/30 text-gray-300 border-gray-500/30";
};

const getDangerIcon = (dangerLevel: string) => {
  if (dangerLevel === "Extreme" || dangerLevel === "Legendary") {
    return <AlertTriangle className="h-3 w-3" />;
  }
  return null;
};

export default function CreatureCard({
  creature,
  viewMode = "grid",
  onEdit,
  onDelete,
  onView,
}: CreatureCardProps) {
  const dangerColorClass = getDangerColor(creature.dangerLevel);
  const typeColorClass = getTypeColor(creature.type);

  if (viewMode === "list") {
    return (
      <TooltipProvider>
        <Card className="fantasy-border fantasy-card-hover transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center transition-transform duration-200 hover:scale-110">
                  <Crown className="text-white" size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-fantasy font-semibold text-yellow-200 truncate hover:text-yellow-100 transition-colors duration-200">
                      {creature.name}
                    </h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          className={`text-xs ${dangerColorClass} border transition-all duration-200 hover:scale-105`}
                        >
                          {getDangerIcon(creature.dangerLevel)}
                          <span className="ml-1">{creature.dangerLevel}</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Рівень небезпеки: {creature.dangerLevel}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="flex items-center space-x-2 mb-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          className={`text-xs ${typeColorClass} border transition-all duration-200 hover:scale-105`}
                        >
                          {creature.type}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Тип істоти: {creature.type}</p>
                      </TooltipContent>
                    </Tooltip>
                    {creature.abilities && creature.abilities.length > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center space-x-1 cursor-help">
                            <Zap className="h-3 w-3 text-purple-400" />
                            <span className="text-xs text-purple-400">
                              {creature.abilities.length} abilities
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{creature.abilities.length} здібностей</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {creature.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                      {creature.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>
                      {creature.updatedAt
                        ? formatTimeAgo(creature.updatedAt)
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
                          onView(creature);
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
                          onEdit(creature);
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
                          onDelete(creature);
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
        onClick={() => onView?.(creature)}
      >
        <CardContent className="p-6">
          {/* Creature Image Placeholder */}
          <div className="w-full h-32 bg-gradient-to-br from-red-600 via-red-700 to-red-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden transition-transform duration-200 group-hover:scale-105">
            <div className="absolute inset-0 bg-black/20"></div>
            <Crown
              className="text-white/80 z-10 transition-transform duration-200 group-hover:scale-110"
              size={32}
            />
            <div className="absolute top-2 right-2 z-10">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    className={`text-xs ${dangerColorClass} border transition-all duration-200 hover:scale-105`}
                  >
                    {getDangerIcon(creature.dangerLevel)}
                    <span className="ml-1">{creature.dangerLevel}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Рівень небезпеки: {creature.dangerLevel}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-fantasy font-semibold text-yellow-200 mb-1 group-hover:text-yellow-100 transition-colors duration-200">
                {creature.name}
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    className={`text-xs ${typeColorClass} border transition-all duration-200 hover:scale-105`}
                  >
                    {creature.type}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Тип істоти: {creature.type}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {creature.description && (
              <p className="text-sm text-gray-300 line-clamp-3 group-hover:text-gray-200 transition-colors duration-200">
                {creature.description}
              </p>
            )}

            {creature.abilities && creature.abilities.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-1">
                  <Zap className="h-3 w-3 text-purple-400" />
                  <span className="text-xs text-purple-400 font-medium">
                    Abilities
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {creature.abilities.slice(0, 3).map((ability, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="text-xs bg-purple-900/20 text-purple-300 border-purple-500/30 transition-all duration-200 hover:scale-105 hover:bg-purple-900/30"
                        >
                          {ability}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{ability}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {creature.abilities.length > 3 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="text-xs bg-gray-900/20 text-gray-400 border-gray-500/30 transition-all duration-200 hover:scale-105 hover:bg-gray-900/30"
                        >
                          +{creature.abilities.length - 3} more
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ще {creature.abilities.length - 3} здібностей</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Calendar size={12} />
                <span>
                  {creature.updatedAt
                    ? formatTimeAgo(creature.updatedAt)
                    : "Recently"}
                </span>
              </div>

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
                            onEdit(creature);
                          }}
                          className="transition-all duration-200 hover:scale-110 hover:bg-yellow-500/20"
                        >
                          <Edit className="h-3 w-3" />
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
                            onDelete(creature);
                          }}
                          className="transition-all duration-200 hover:scale-110 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-3 w-3 text-red-400" />
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
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
