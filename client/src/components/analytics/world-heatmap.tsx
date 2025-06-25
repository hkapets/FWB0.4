import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, MapPin, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HeatmapData {
  regions: Array<{
    name: string;
    activity: number; // 0-100
    entities: number;
    connections: number;
  }>;
  entityTypes: Array<{
    type: string;
    usage: number; // 0-100
    lastUpdated: string;
  }>;
}

interface WorldHeatmapProps {
  worldId: number;
}

export default function WorldHeatmap({ worldId }: WorldHeatmapProps) {
  const { toast } = useToast();
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHeatmapData();
  }, [worldId]);

  const loadHeatmapData = async () => {
    try {
      const response = await fetch(`/api/worlds/${worldId}/heatmap`);
      if (!response.ok) throw new Error('Failed to load heatmap');
      
      const data = await response.json();
      setHeatmapData(data);
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити карту активності',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityColor = (activity: number) => {
    if (activity >= 80) return 'bg-green-500';
    if (activity >= 60) return 'bg-yellow-500';
    if (activity >= 40) return 'bg-orange-500';
    if (activity >= 20) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getActivityLabel = (activity: number) => {
    if (activity >= 80) return 'Дуже активний';
    if (activity >= 60) return 'Активний';
    if (activity >= 40) return 'Помірний';
    if (activity >= 20) return 'Низький';
    return 'Неактивний';
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 90) return 'text-green-400';
    if (usage >= 70) return 'text-yellow-400';
    if (usage >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <Card className="fantasy-border bg-black/20">
        <CardHeader>
          <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Карта активності
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!heatmapData) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Активність регіонів */}
      <Card className="fantasy-border bg-black/20">
        <CardHeader>
          <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Активність регіонів
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {heatmapData.regions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                Немає даних про регіони
              </p>
            ) : (
              heatmapData.regions
                .sort((a, b) => b.activity - a.activity)
                .map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-3 h-3 rounded-full ${getActivityColor(region.activity)}`}
                          title={`Активність: ${region.activity}%`}
                        />
                        <span className="text-purple-200 font-medium">{region.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getActivityLabel(region.activity)}
                      </Badge>
                    </div>
                    
                    <div className="text-right text-sm">
                      <div className="text-gray-300">
                        {region.entities} елементів
                      </div>
                      <div className="text-gray-400 text-xs">
                        {region.connections} звя'язків
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
          
          {/* Легенда */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <h5 className="text-fantasy-gold-300 text-sm font-semibold mb-2">Легенда активності:</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-300">80-100% (Дуже активний)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-gray-300">60-79% (Активний)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-gray-300">40-59% (Помірний)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-gray-300">20-39% (Низький)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Використання типів сутностей */}
      <Card className="fantasy-border bg-black/20">
        <CardHeader>
          <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Використання сутностей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {heatmapData.entityTypes.map((entityType, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                <div>
                  <span className="text-purple-200 font-medium">{entityType.type}</span>
                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {entityType.lastUpdated}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${getUsageColor(entityType.usage)}`}>
                    {entityType.usage}%
                  </div>
                  <div className="text-xs text-gray-400">використання</div>
                </div>
              </div>
            ))}
          </div>

          {/* Прогрес бари */}
          <div className="mt-4 pt-4 border-t border-gray-600">
            <h5 className="text-fantasy-gold-300 text-sm font-semibold mb-3">Візуалізація використання:</h5>
            <div className="space-y-2">
              {heatmapData.entityTypes.map((entityType, index) => (
                <div key={index}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{entityType.type}</span>
                    <span className={getUsageColor(entityType.usage)}>{entityType.usage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        entityType.usage >= 70 ? 'bg-green-500' :
                        entityType.usage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${entityType.usage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}