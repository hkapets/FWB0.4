import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, MapPin, Crown, Sparkles, ScrollText } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

// Component for cross-section references
export function SectionLinker({
  sectionType,
  selectedIds = [],
  onSelectionChange,
  worldId,
  placeholder = "Виберіть елементи..."
}: {
  sectionType: 'characters' | 'locations' | 'artifacts' | 'events' | 'races' | 'classes';
  selectedIds?: number[];
  onSelectionChange: (ids: number[]) => void;
  worldId: number;
  placeholder?: string;
}) {
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ["/api/worlds", worldId, sectionType],
    enabled: !!worldId,
  });

  const getIcon = () => {
    switch (sectionType) {
      case 'characters': return <Users className="w-4 h-4" />;
      case 'locations': return <MapPin className="w-4 h-4" />;
      case 'artifacts': return <Sparkles className="w-4 h-4" />;
      case 'events': return <ScrollText className="w-4 h-4" />;
      case 'races': return <Users className="w-4 h-4" />;
      case 'classes': return <Crown className="w-4 h-4" />;
      default: return null;
    }
  };

  const getSectionLabel = () => {
    switch (sectionType) {
      case 'characters': return 'Персонажі';
      case 'locations': return 'Локації';
      case 'artifacts': return 'Артефакти';
      case 'events': return 'Події';
      case 'races': return 'Раси';
      case 'classes': return 'Класи';
      default: return sectionType;
    }
  };

  const selectedItems = items.filter((item: any) => selectedIds.includes(item.id));

  const toggleItem = (itemId: number) => {
    const newSelection = selectedIds.includes(itemId)
      ? selectedIds.filter(id => id !== itemId)
      : [...selectedIds, itemId];
    onSelectionChange(newSelection);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-yellow-200 flex items-center gap-2">
        {getIcon()}
        Пов'язані {getSectionLabel().toLowerCase()}
      </label>
      
      {/* Selected items display */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item: any) => (
            <Badge 
              key={item.id} 
              variant="secondary" 
              className="bg-purple-900/50 text-yellow-200 hover:bg-purple-800/50"
            >
              {item.name?.uk || item.name || `${getSectionLabel()} ${item.id}`}
              <button
                onClick={() => toggleItem(item.id)}
                className="ml-2 text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Selection interface */}
      <Select onValueChange={(value) => toggleItem(Number(value))}>
        <SelectTrigger className="fantasy-select">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="fantasy-select">
          {items.map((item: any) => (
            <SelectItem 
              key={item.id} 
              value={item.id.toString()}
              disabled={selectedIds.includes(item.id)}
            >
              <div className="flex items-center gap-2">
                {selectedIds.includes(item.id) && <span className="text-green-400">✓</span>}
                {item.name?.uk || item.name || `${getSectionLabel()} ${item.id}`}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Quick navigation component
export function QuickNavigation({ currentWorldId }: { currentWorldId: number | null }) {
  const t = useTranslation();

  if (!currentWorldId) return null;

  const navItems = [
    { href: `/lore/races`, icon: <Users className="w-4 h-4" />, label: 'Раси' },
    { href: `/lore/classes`, icon: <Crown className="w-4 h-4" />, label: 'Класи' },
    { href: `/lore/magic`, icon: <Sparkles className="w-4 h-4" />, label: 'Магія' },
    { href: `/lore/artifacts`, icon: <Sparkles className="w-4 h-4" />, label: 'Артефакти' },
    { href: `/characters`, icon: <Users className="w-4 h-4" />, label: 'Персонажі' },
    { href: `/world-map`, icon: <MapPin className="w-4 h-4" />, label: 'Карта' },
    { href: `/timeline`, icon: <ScrollText className="w-4 h-4" />, label: 'Хронологія' },
    { href: `/lore/events`, icon: <ScrollText className="w-4 h-4" />, label: 'Події' },
  ];

  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-gray-800/20 rounded-lg p-4 border border-yellow-600/20 mb-6">
      <h3 className="text-lg font-bold text-yellow-200 mb-3">Швидка навігація</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            size="sm"
            className="bg-purple-900/30 hover:bg-purple-800/50 text-yellow-100 hover:text-yellow-50 border border-yellow-600/20 hover:border-yellow-500/40 transition-all duration-200 justify-start text-sm"
            onClick={() => window.location.href = item.href}
          >
            {item.icon}
            <span className="ml-2">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

// Cross-references component for showing related items
export function CrossReferences({ 
  itemType,
  itemId,
  worldId 
}: {
  itemType: string;
  itemId: number;
  worldId: number;
}) {
  const { data: references = [] } = useQuery({
    queryKey: ["/api/worlds", worldId, "cross-references", itemType, itemId],
    enabled: !!worldId && !!itemId,
  });

  if (references.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-gray-900/50 to-purple-900/50 rounded-lg p-4 border border-yellow-600/20">
      <h4 className="text-md font-bold text-yellow-200 mb-2">Пов'язані елементи</h4>
      <div className="space-y-2">
        {references.map((ref: any) => (
          <div key={ref.id} className="flex items-center gap-2 text-sm text-gray-300">
            <Badge variant="outline" className="text-xs bg-purple-900/50">
              {ref.type}
            </Badge>
            <span>{ref.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Enhanced statistics component
export function WorldStatistics({ worldId }: { worldId: number }) {
  const { data: stats } = useQuery({
    queryKey: ["/api/worlds", worldId, "stats"],
    enabled: !!worldId,
  });

  if (!stats) return null;

  const statCards = [
    { label: 'Локації', value: stats.locations || 0, icon: <MapPin className="w-4 h-4" />, color: 'text-blue-400' },
    { label: 'Персонажі', value: stats.characters || 0, icon: <Users className="w-4 h-4" />, color: 'text-green-400' },
    { label: 'Істоти', value: stats.creatures || 0, icon: <Crown className="w-4 h-4" />, color: 'text-red-400' },
    { label: 'Артефакти', value: stats.artifacts || 0, icon: <Sparkles className="w-4 h-4" />, color: 'text-purple-400' },
    { label: 'Події', value: stats.events || 0, icon: <ScrollText className="w-4 h-4" />, color: 'text-yellow-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat) => (
        <Card key={stat.label} className="bg-gradient-to-br from-gray-900/80 to-purple-900/80 border-yellow-600/20">
          <CardContent className="p-4 text-center">
            <div className={`mx-auto mb-2 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-yellow-200 mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-gray-400">
              {stat.label}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}