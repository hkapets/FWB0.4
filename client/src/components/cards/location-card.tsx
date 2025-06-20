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
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { formatTimeAgo, getDangerLevelColor } from "@/lib/utils";
import type { Location } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface LocationCardProps {
  location: Location;
  viewMode?: "grid" | "list";
  onEdit?: (location: Location) => void;
  onDelete?: (location: Location) => void;
  onView?: (location: Location) => void;
}

const getDangerIcon = (dangerLevel: string) => {
  if (dangerLevel === "Extreme" || dangerLevel === "Legendary") {
    return <AlertTriangle className="h-3 w-3" />;
  }
  return null;
};

export default function LocationCard({
  location,
  viewMode = "grid",
  onEdit,
  onDelete,
  onView,
}: LocationCardProps) {
  const dangerColorClass = getDangerLevelColor(location.dangerLevel);

  const { data: events = [] } = useQuery<any[]>({ queryKey: ["/api/events"] });
  const relatedEvents = events.filter((e) => e.locationId === location.id);

  if (viewMode === "list") {
    return (
      <TooltipProvider>
        <Card className="fantasy-border fantasy-card-hover transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center transition-transform duration-200 hover:scale-110">
                  <MapPin className="text-white" size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-fantasy font-semibold text-yellow-200 truncate hover:text-yellow-100 transition-colors duration-200">
                      {location.name}
                    </h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="bg-purple-900/30 text-purple-300 border-purple-500/30 transition-all duration-200 hover:scale-105"
                        >
                          {location.type}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Тип локації: {location.type}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                    {location.description || "No description provided"}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>
                        {location.updatedAt
                          ? formatTimeAgo(location.updatedAt)
                          : "Recently"}
                      </span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          className={`text-xs ${dangerColorClass} border transition-all duration-200 hover:scale-105`}
                        >
                          {getDangerIcon(location.dangerLevel)}
                          <span className="ml-1">{location.dangerLevel}</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Рівень небезпеки: {location.dangerLevel}</p>
                      </TooltipContent>
                    </Tooltip>
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
                          onView(location);
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
                          onEdit(location);
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
                          onDelete(location);
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
        className="fantasy-border fantasy-card-hover transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/10"
        onClick={() => onView?.(location)}
      >
        <CardContent className="p-6">
          {/* Placeholder image with fantasy styling */}
          <div className="w-full h-32 bg-gradient-to-br from-green-600 via-green-700 to-green-900 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden transition-transform duration-200 group-hover:scale-105">
            <div className="absolute inset-0 bg-black/20"></div>
            <MapPin
              className="text-white/80 z-10 transition-transform duration-200 group-hover:scale-110"
              size={32}
            />
            <div className="absolute bottom-2 right-2 z-10">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    className={`text-xs ${dangerColorClass} border transition-all duration-200 hover:scale-105`}
                  >
                    {getDangerIcon(location.dangerLevel)}
                    <span className="ml-1">{location.dangerLevel}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Рівень небезпеки: {location.dangerLevel}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-fantasy font-semibold text-yellow-200 mb-1 group-hover:text-yellow-100 transition-colors duration-200">
                {location.name}
              </h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="bg-purple-900/30 text-purple-300 text-xs border-purple-500/30 transition-all duration-200 hover:scale-105"
                  >
                    {location.type}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Тип локації: {location.type}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {location.description && (
              <p className="text-sm text-gray-300 line-clamp-3 group-hover:text-gray-200 transition-colors duration-200">
                {location.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Calendar size={12} />
                <span>
                  {location.updatedAt
                    ? formatTimeAgo(location.updatedAt)
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
                            onEdit(location);
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
                            onDelete(location);
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

          {relatedEvents.length > 0 && (
            <div className="mt-6">
              <div className="text-xs text-gray-400 mb-1 font-semibold">
                Події, пов'язані з локацією:
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
