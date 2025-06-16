import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Edit, Trash2, Eye } from "lucide-react";
import { formatTimeAgo, getDangerLevelColor } from "@/lib/utils";
import type { Location } from "@shared/schema";

interface LocationCardProps {
  location: Location;
  viewMode?: "grid" | "list";
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
  onView?: (location: Location) => void;
}

export default function LocationCard({ 
  location, 
  viewMode = "grid",
  onEdit,
  onDelete,
  onView 
}: LocationCardProps) {
  const dangerColorClass = getDangerLevelColor(location.dangerLevel);

  if (viewMode === "list") {
    return (
      <Card className="fantasy-border fantasy-card-hover transition-all duration-300 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                <MapPin className="text-white" size={24} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-fantasy font-semibold text-yellow-200 truncate">
                    {location.name}
                  </h3>
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-300">
                    {location.type}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                  {location.description || "No description provided"}
                </p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar size={12} />
                    <span>{location.updatedAt ? formatTimeAgo(location.updatedAt) : "Recently"}</span>
                  </div>
                  <Badge className={`text-xs ${dangerColorClass}`}>
                    {location.dangerLevel}
                  </Badge>
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
                    onView(location);
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
                    onEdit(location);
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
                    onDelete(location);
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
      onClick={() => onView?.(location)}
    >
      <CardContent className="p-6">
        {/* Placeholder image with fantasy styling */}
        <div className="w-full h-32 bg-gradient-to-br from-green-600 via-green-700 to-green-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <MapPin className="text-white/80 z-10" size={32} />
          <div className="absolute bottom-2 right-2 z-10">
            <Badge className={`text-xs ${dangerColorClass}`}>
              {location.dangerLevel}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-fantasy font-semibold text-yellow-200 mb-1 group-hover:text-yellow-100 transition-colors duration-200">
              {location.name}
            </h3>
            <Badge variant="outline" className="bg-purple-900/30 text-purple-300 text-xs">
              {location.type}
            </Badge>
          </div>
          
          {location.description && (
            <p className="text-sm text-gray-300 line-clamp-3">
              {location.description}
            </p>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Calendar size={12} />
              <span>{location.updatedAt ? formatTimeAgo(location.updatedAt) : "Recently"}</span>
            </div>
            
            {(onEdit || onDelete) && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(location);
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
                      onDelete(location);
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
