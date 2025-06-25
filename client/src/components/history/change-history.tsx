import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Clock, RotateCcw } from 'lucide-react';

interface ChangeRecord {
  id: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  timestamp: string;
}

interface ChangeHistoryProps {
  entityType: string;
  entityId: number;
}

export default function ChangeHistory({ entityType, entityId }: ChangeHistoryProps) {
  const [history, setHistory] = useState<ChangeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChange, setSelectedChange] = useState<ChangeRecord | null>(null);

  useEffect(() => {
    loadHistory();
  }, [entityType, entityId]);

  const loadHistory = async () => {
    try {
      const response = await fetch(`/api/history/${entityType}/${entityId}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('uk-UA');
  };

  const getDiffDisplay = (change: ChangeRecord) => {
    try {
      const oldVal = change.oldValue ? JSON.parse(change.oldValue) : null;
      const newVal = change.newValue ? JSON.parse(change.newValue) : null;
      
      return {
        old: oldVal,
        new: newVal
      };
    } catch {
      return {
        old: change.oldValue,
        new: change.newValue
      };
    }
  };

  const getChangeType = (change: ChangeRecord) => {
    if (!change.oldValue && change.newValue) return 'added';
    if (change.oldValue && !change.newValue) return 'deleted';
    return 'modified';
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'added': return 'bg-green-900/20 text-green-200 border-green-600/30';
      case 'deleted': return 'bg-red-900/20 text-red-200 border-red-600/30';
      default: return 'bg-blue-900/20 text-blue-200 border-blue-600/30';
    }
  };

  if (loading) {
    return (
      <Card className="fantasy-border bg-black/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
            <span className="ml-2 text-gray-400">Завантаження історії...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fantasy-border bg-black/20">
      <CardHeader>
        <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
          <History className="w-5 h-5" />
          Історія змін
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Немає записів про зміни</p>
          </div>
        ) : (
          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="timeline" className="text-gray-300">
                Хронологія
              </TabsTrigger>
              <TabsTrigger value="diff" className="text-gray-300">
                Порівняння
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-3">
              <div className="max-h-96 overflow-y-auto space-y-3">
                {history.map((change) => {
                  const changeType = getChangeType(change);
                  return (
                    <div
                      key={change.id}
                      className="p-3 bg-gray-800/50 border border-gray-600/30 rounded cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => setSelectedChange(change)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={getChangeTypeColor(changeType)}
                          >
                            {changeType === 'added' ? 'Додано' : 
                             changeType === 'deleted' ? 'Видалено' : 'Змінено'}
                          </Badge>
                          <span className="text-purple-200 font-medium">
                            {change.fieldName}
                          </span>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {formatTimestamp(change.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="diff" className="space-y-4">
              {selectedChange ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-fantasy-gold-300 font-semibold">
                      Зміна поля: {selectedChange.fieldName}
                    </h3>
                    <span className="text-gray-400 text-sm">
                      {formatTimestamp(selectedChange.timestamp)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-red-300 font-medium">Було:</h4>
                      <div className="p-3 bg-red-900/10 border border-red-600/30 rounded">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                          {selectedChange.oldValue || 'Пусто'}
                        </pre>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-green-300 font-medium">Стало:</h4>
                      <div className="p-3 bg-green-900/10 border border-green-600/30 rounded">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                          {selectedChange.newValue || 'Пусто'}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Відкатити зміну
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>Оберіть зміну з хронології для порівняння</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}