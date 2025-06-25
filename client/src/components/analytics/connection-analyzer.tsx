import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, Sparkles, Users, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConnectionSuggestion {
  type: 'relationship' | 'event' | 'location_connection';
  entities: string[];
  description: string;
  strength: number;
}

interface ConnectionAnalyzerProps {
  worldId: number;
}

export default function ConnectionAnalyzer({ worldId }: ConnectionAnalyzerProps) {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSuggestions = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/suggest-connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worldId })
      });

      if (!response.ok) throw new Error('Failed to analyze connections');

      const connections = await response.json();
      setSuggestions(connections);
      
      toast({
        title: 'Аналіз завершено',
        description: `Знайдено ${connections.length} пропозицій для звязків`,
      });
    } catch (error) {
      toast({
        title: 'Помилка аналізу',
        description: 'Не вдалося проаналізувати звязки. Перевірте налаштування API.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'relationship':
        return <Users className="w-4 h-4" />;
      case 'location_connection':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Network className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'relationship':
        return 'bg-blue-900/30 text-blue-200 border-blue-600/30';
      case 'location_connection':
        return 'bg-green-900/30 text-green-200 border-green-600/30';
      case 'event':
        return 'bg-purple-900/30 text-purple-200 border-purple-600/30';
      default:
        return 'bg-gray-900/30 text-gray-200 border-gray-600/30';
    }
  };

  const getStrengthBadge = (strength: number) => {
    if (strength >= 8) return { text: 'Сильний', color: 'bg-green-600' };
    if (strength >= 5) return { text: 'Середній', color: 'bg-yellow-600' };
    return { text: 'Слабкий', color: 'bg-red-600' };
  };

  return (
    <Card className="fantasy-border bg-black/20">
      <CardHeader>
        <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
          <Network className="w-5 h-5" />
          Аналізатор звя'язків
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Button
            onClick={analyzeSuggestions}
            disabled={isAnalyzing}
            className="fantasy-button"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Аналізую звязки...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Проаналізувати звязки
              </>
            )}
          </Button>
          <p className="text-gray-400 text-sm mt-2">
            AI проаналізує ваш світ та запропонує цікаві звязки між елементами
          </p>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-fantasy-gold-300 font-semibold">
              Пропозиції звязків ({suggestions.length})
            </h4>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {suggestions.map((suggestion, index) => {
                const strengthBadge = getStrengthBadge(suggestion.strength);
                
                return (
                  <div
                    key={index}
                    className={`p-3 rounded border ${getTypeColor(suggestion.type)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(suggestion.type)}
                        <span className="font-medium">
                          {suggestion.entities.join(' ↔ ')}
                        </span>
                      </div>
                      <Badge className={`${strengthBadge.color} text-white text-xs`}>
                        {strengthBadge.text}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-2">
                      {suggestion.description}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        Сила звязку: {suggestion.strength}/10
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {suggestions.length === 0 && !isAnalyzing && (
          <div className="text-center text-gray-500 py-4">
            <Network className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Натисніть кнопку вище, щоб проаналізувати звязки у вашому світі</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}