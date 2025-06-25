import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, MapPin, Sword, Target, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConnectionAnalyzer from './connection-analyzer';
import WorldHeatmap from './world-heatmap';

interface WorldAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldId: number;
}

interface Analytics {
  overview: {
    totalEntities: number;
    entityBreakdown: Record<string, number>;
    connectionsCount: number;
    completionScore: number;
  };
  entityStats: {
    races: Array<{ name: string; count: number; percentage: number }>;
    classes: Array<{ name: string; count: number; percentage: number }>;
    locationTypes: Array<{ type: string; count: number; percentage: number }>;
  };
  connectionMap: {
    nodes: Array<{ id: string; name: string; type: string; connections: number }>;
    edges: Array<{ from: string; to: string; type: string; strength: number }>;
  };
  gaps: {
    emptyRegions: string[];
    underutilizedElements: string[];
    missingConnections: Array<{ entities: string[]; suggestion: string }>;
  };
  timeline: {
    eventsPerPeriod: Record<string, number>;
    importanceDistribution: Record<number, number>;
    eventTypes: Record<string, number>;
  };
}

const COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'];

export default function WorldAnalyticsModal({ isOpen, onClose, worldId }: WorldAnalyticsModalProps) {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && worldId) {
      loadAnalytics();
    }
  }, [isOpen, worldId]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/worlds/${worldId}/analytics`);
      if (!response.ok) throw new Error('Failed to load analytics');
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося завантажити аналітику світу',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh] fantasy-border bg-black/90 backdrop-blur-sm">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
              <p className="text-gray-300">Аналізуємо ваш світ...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!analytics) return null;

  const entityBreakdownData = Object.entries(analytics.overview.entityBreakdown).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value
  }));

  const raceChartData = analytics.entityStats.races.slice(0, 5).map(race => ({
    name: race.name,
    count: race.count,
    percentage: race.percentage
  }));

  const locationTypeData = analytics.entityStats.locationTypes.slice(0, 5).map(loc => ({
    name: loc.type,
    count: loc.count
  }));

  const timelineData = Object.entries(analytics.timeline.eventsPerPeriod).map(([period, count]) => ({
    period,
    events: count
  }));

  const importanceData = Object.entries(analytics.timeline.importanceDistribution).map(([importance, count]) => ({
    importance: `${importance} зірок`,
    count
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden fantasy-border bg-black/90 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-fantasy-gold-300 font-fantasy text-2xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Аналітика світу
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto h-full mt-4">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="overview" className="text-gray-300">Огляд</TabsTrigger>
              <TabsTrigger value="entities" className="text-gray-300">Сутності</TabsTrigger>
              <TabsTrigger value="connections" className="text-gray-300">Звязки</TabsTrigger>
              <TabsTrigger value="gaps" className="text-gray-300">Прогалини</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Загальна статистика */}
                <Card className="fantasy-border bg-black/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-fantasy-gold-300 text-sm">Всього сутностей</CardTitle>
                    <Users className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{analytics.overview.totalEntities}</div>
                    <p className="text-xs text-gray-400">елементів у світі</p>
                  </CardContent>
                </Card>

                <Card className="fantasy-border bg-black/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-fantasy-gold-300 text-sm">Звязки</CardTitle>
                    <Target className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{analytics.overview.connectionsCount}</div>
                    <p className="text-xs text-gray-400">між елементами</p>
                  </CardContent>
                </Card>

                <Card className="fantasy-border bg-black/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-fantasy-gold-300 text-sm">Завершеність</CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{analytics.overview.completionScore}%</div>
                    <p className="text-xs text-gray-400">розвитку світу</p>
                  </CardContent>
                </Card>
              </div>

              {/* Розподіл сутностей */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="fantasy-border bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-fantasy-gold-300">Розподіл сутностей</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={entityBreakdownData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {entityBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="fantasy-border bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-fantasy-gold-300">Події по періодах</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="period" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="events" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="entities" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Статистика рас */}
                <Card className="fantasy-border bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-fantasy-gold-300">Популярні раси</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={raceChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="count" fill="#a855f7" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Типи локацій */}
                <Card className="fantasy-border bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-fantasy-gold-300">Типи локацій</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={locationTypeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ name, count }) => `${name}: ${count}`}
                        >
                          {locationTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Важливість подій */}
                <Card className="fantasy-border bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-fantasy-gold-300">Розподіл важливості подій</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={importanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="importance" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="count" fill="#c084fc" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Детальна статистика */}
                <Card className="fantasy-border bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-fantasy-gold-300">Детальна статистика</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="text-gray-400">Найпопулярніша раса:</span>
                        <span className="text-purple-200 ml-2">
                          {analytics.entityStats.races[0]?.name || 'Не визначено'} 
                          ({analytics.entityStats.races[0]?.count || 0})
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-gray-400">Найпопулярніший клас:</span>
                        <span className="text-purple-200 ml-2">
                          {analytics.entityStats.classes[0]?.name || 'Не визначено'} 
                          ({analytics.entityStats.classes[0]?.count || 0})
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-gray-400">Найчастіший тип локації:</span>
                        <span className="text-purple-200 ml-2">
                          {analytics.entityStats.locationTypes[0]?.type || 'Не визначено'} 
                          ({analytics.entityStats.locationTypes[0]?.count || 0})
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="text-gray-400">Всього подій:</span>
                        <span className="text-purple-200 ml-2">
                          {Object.values(analytics.timeline.eventsPerPeriod).reduce((a, b) => a + b, 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="connections" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Імпортуємо компонент аналізатора звя'язків */}
                <div className="space-y-4">
                  <ConnectionAnalyzer worldId={worldId} />
                  <WorldHeatmap worldId={worldId} />
                </div>
              </div>
              <Card className="fantasy-border bg-black/20">
                <CardHeader>
                  <CardTitle className="text-fantasy-gold-300">Мережа звязків</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Найбільш звя'язані елементи */}
                    <div>
                      <h4 className="text-fantasy-gold-300 font-semibold mb-3">Найактивніші елементи</h4>
                      <div className="space-y-2">
                        {analytics.connectionMap.nodes
                          .sort((a, b) => b.connections - a.connections)
                          .slice(0, 10)
                          .map((node, index) => (
                            <div key={node.id} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                              <div>
                                <span className="text-purple-200 font-medium">{node.name}</span>
                                <span className="text-xs text-gray-400 ml-2">({node.type})</span>
                              </div>
                              <span className="text-yellow-200 text-sm">{node.connections} звязків</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Типи звязків */}
                    <div>
                      <h4 className="text-fantasy-gold-300 font-semibold mb-3">Типи звязків</h4>
                      <div className="space-y-2">
                        {Object.entries(
                          analytics.connectionMap.edges.reduce((acc: Record<string, number>, edge) => {
                            acc[edge.type] = (acc[edge.type] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([type, count]) => (
                          <div key={type} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                            <span className="text-purple-200">{type}</span>
                            <span className="text-yellow-200 text-sm">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gaps" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Порожні регіони */}
                <Card className="fantasy-border bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Порожні регіони
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.gaps.emptyRegions.length === 0 ? (
                      <p className="text-gray-400 text-sm">Всі регіони добре заповнені!</p>
                    ) : (
                      <div className="space-y-2">
                        {analytics.gaps.emptyRegions.map((region, index) => (
                          <div key={index} className="p-2 bg-yellow-900/20 border border-yellow-600/30 rounded text-sm">
                            <span className="text-yellow-200">{region}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Недовикористані елементи */}
                <Card className="fantasy-border bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Недовикористані елементи
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.gaps.underutilizedElements.length === 0 ? (
                      <p className="text-gray-400 text-sm">Всі елементи добре розроблені!</p>
                    ) : (
                      <div className="space-y-2">
                        {analytics.gaps.underutilizedElements.map((element, index) => (
                          <div key={index} className="p-2 bg-orange-900/20 border border-orange-600/30 rounded text-sm">
                            <span className="text-orange-200">{element}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Пропозиції звязків */}
                <Card className="fantasy-border bg-black/20 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
                      <Sword className="w-5 h-5" />
                      Пропозиції для покращення
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.gaps.missingConnections.length === 0 ? (
                      <p className="text-gray-400 text-sm">Звязки між елементами добре розроблені!</p>
                    ) : (
                      <div className="space-y-3">
                        {analytics.gaps.missingConnections.map((connection, index) => (
                          <div key={index} className="p-3 bg-purple-900/20 border border-purple-600/30 rounded">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-purple-200 font-medium">
                                {connection.entities.join(' + ')}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm">{connection.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}