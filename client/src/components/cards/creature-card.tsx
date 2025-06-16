import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Edit, Trash2, Eye, Calendar } from "lucide-react";
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
    "Harmless": "bg-green-900/30 text-green-300",
    "Low": "bg-blue-900/30 text-blue-300",
    "Moderate": "bg-yellow-900/30 text-yellow-300",
    "High": "bg-orange-900/30 text-orange-300",
    "Extreme": "bg-red-900/30 text-red-300",
    "Legendary": "bg-purple-900/30 text-purple-300",
  };
  return colors[dangerLevel] || "bg-gray-900/30 text-gray-300";
};

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    "Crown": "bg-red-900/30 text-red-300",
    "Beast": "bg-green-900/30 text-green-300",
    "Undead": "bg-gray-900/30 text-gray-300",
    "Demon": "bg-red-900/30 text-red-300",
    "Angel": "bg-yellow-900/30 text-yellow-300",
    "Elemental": "bg-blue-900/30 text-blue-300",
    "Fey": "bg-pink-900/30 text-pink-300",
    "Giant": "bg-orange-900/30 text-orange-300",
    "Spirit": "bg-purple-900/30 text-purple-300",
  };
  return colors[type] || "bg-gray-900/30 text-gray-300";
};

export default function CreatureCard({ 
  creature, 
  viewMode = "grid",
  onEdit,
  onDelete,
  onView 
}: CreatureCardProps) {
  const dangerColorClass = getDangerColor(creature.dangerLevel);
  const typeColorClass = getTypeColor(creature.type);

  if (viewMode === "list") {
    return (
      <Card className="fantasy-border fantasy-card-hover transition-all duration-300 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Crown className="text-white" size={24} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-fantasy font-semibold text-yellow-200 truncate">
                    {creature.name}
                  </h3>
                  <Badge className={`text-xs ${dangerColorClass}`}>
                    {creature.dangerLevel}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={`text-xs ${typeColorClass}`}>
                    {creature.type}
                  </Badge>
                  {creature.abilities && creature.abilities.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Zap className="h-3 w-3 text-purple-400" />
                      <span className="text-xs text-purple-400">
                        {creature.abilities.length} abilities
                      </span>
                    </div>
                  )}
                </div>
                
                {creature.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                    {creature.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar size={12} />
                  <span>{creature.updatedAt ? formatTimeAgo(creature.updatedAt) : "Recently"}</span>
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
                    onView(creature);
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
                    onEdit(creature);
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
                    onDelete(creature);
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
      onClick={() => onView?.(creature)}
    >
      <CardContent className="p-6">
        {/* Creature Image Placeholder */}
        <div className="w-full h-32 bg-gradient-to-br from-red-600 via-red-700 to-red-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <Crown className="text-white/80 z-10" size={32} />
          <div className="absolute top-2 right-2 z-10">
            <Badge className={`text-xs ${dangerColorClass}`}>
              {creature.dangerLevel}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-fantasy font-semibold text-yellow-200 mb-1 group-hover:text-yellow-100 transition-colors duration-200">
              {creature.name}
            </h3>
            <Badge className={`text-xs ${typeColorClass}`}>
              {creature.type}
            </Badge>
          </div>
          
          {creature.description && (
            <p className="text-sm text-gray-300 line-clamp-3">
              {creature.description}
            </p>
          )}
          
          {creature.abilities && creature.abilities.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <Zap className="h-3 w-3 text-purple-400" />
                <span className="text-xs text-purple-400 font-medium">Abilities</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {creature.abilities.slice(0, 3).map((ability, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-purple-900/20 text-purple-300"
                  >
                    {ability}
                  </Badge>
                ))}
                {creature.abilities.length > 3 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-gray-900/20 text-gray-400"
                  >
                    +{creature.abilities.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Calendar size={12} />
              <span>{creature.updatedAt ? formatTimeAgo(creature.updatedAt) : "Recently"}</span>
            </div>
            
            {(onEdit || onDelete) && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(creature);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(creature);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
