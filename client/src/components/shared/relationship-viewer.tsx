import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Users, MapPin, Sparkles, ScrollText, Crown } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface RelationshipViewerProps {
  entityType: string;
  entityId: number;
  entityName: string;
  worldId: number;
}

export function RelationshipViewer({ entityType, entityId, entityName, worldId }: RelationshipViewerProps) {
  const t = useTranslation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const { data: relationships = {} } = useQuery({
    queryKey: ["/api/worlds", worldId, "relationships", entityType, entityId],
    enabled: !!worldId && !!entityId,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'characters': return <Users className="w-4 h-4" />;
      case 'locations': return <MapPin className="w-4 h-4" />;
      case 'artifacts': return <Sparkles className="w-4 h-4" />;
      case 'events': return <ScrollText className="w-4 h-4" />;
      case 'races': return <Users className="w-4 h-4" />;
      case 'classes': return <Crown className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getSectionLabel = (type: string) => {
    switch (type) {
      case 'characters': return 'Персонажі';
      case 'locations': return 'Локації';
      case 'artifacts': return 'Артефакти';
      case 'events': return 'Події';
      case 'races': return 'Раси';
      case 'classes': return 'Класи';
      default: return type;
    }
  };

  const relationshipSections = Object.entries(relationships).filter(([_, items]) => 
    Array.isArray(items) && items.length > 0
  );

  if (relationshipSections.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-gray-900/50 to-purple-900/50 border-yellow-600/20">
        <CardContent className="p-4">
          <p className="text-gray-400 text-sm">Немає пов'язаних елементів</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-gray-900/50 to-purple-900/50 border-yellow-600/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-yellow-200 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Пов'язані з "{entityName}"
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {relationshipSections.map(([sectionType, items]) => (
          <Collapsible
            key={sectionType}
            open={expandedSections[sectionType]}
            onOpenChange={() => toggleSection(sectionType)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-2 h-auto text-left hover:bg-purple-800/30"
              >
                <div className="flex items-center gap-2">
                  {getSectionIcon(sectionType)}
                  <span className="text-yellow-200 font-medium">
                    {getSectionLabel(sectionType)} ({(items as any[]).length})
                  </span>
                </div>
                {expandedSections[sectionType] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-6 space-y-2">
              {(items as any[]).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-gray-800/30 rounded border border-gray-700/50"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-purple-900/50">
                      {item.type || sectionType}
                    </Badge>
                    <span className="text-gray-200 text-sm">
                      {item.name?.uk || item.name || `${getSectionLabel(sectionType)} ${item.id}`}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-yellow-300 hover:text-yellow-200"
                    onClick={() => {
                      // Navigate to the related item
                      const baseUrl = sectionType === 'characters' ? '/characters' : 
                                     sectionType === 'locations' ? '/world-map' :
                                     `/lore/${sectionType}`;
                      window.location.href = `${baseUrl}?highlight=${item.id}`;
                    }}
                  >
                    Переглянути
                  </Button>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}