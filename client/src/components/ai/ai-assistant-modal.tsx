import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Sparkles, Users, MapPin, Sword, Scroll, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldId: number;
}

interface GeneratedResult {
  type: string;
  data: any;
}

export default function AIAssistantModal({ isOpen, onClose, worldId }: AIAssistantModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('names');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedResult[]>([]);

  // Name Generator State
  const [nameParams, setNameParams] = useState({
    type: 'character',
    race: '',
    culture: '',
    theme: '',
    count: 5
  });

  // Description Generator State
  const [descParams, setDescParams] = useState({
    name: '',
    type: 'character',
    context: '',
    style: 'detailed'
  });

  // Timeline Generator State
  const [timelineParams, setTimelineParams] = useState({
    timelineName: '',
    context: '',
    count: 5
  });

  const handleGenerateNames = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nameParams)
      });

      if (!response.ok) throw new Error('Failed to generate names');

      const names = await response.json();
      setResults(prev => [...prev, { type: 'names', data: { params: nameParams, names } }]);
      
      toast({
        title: 'Імена згенеровано',
        description: `Створено ${names.length} нових імен`,
      });
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося згенерувати імена. Перевірте налаштування API.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!descParams.name.trim()) {
      toast({
        title: 'Помилка',
        description: 'Введіть назву для генерації опису',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(descParams)
      });

      if (!response.ok) throw new Error('Failed to generate description');

      const description = await response.text();
      setResults(prev => [...prev, { 
        type: 'description', 
        data: { params: descParams, description } 
      }]);
      
      toast({
        title: 'Опис згенеровано',
        description: 'Створено детальний опис',
      });
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося згенерувати опис. Перевірте налаштування API.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTimeline = async () => {
    if (!timelineParams.timelineName.trim()) {
      toast({
        title: 'Помилка',
        description: 'Введіть назву часової лінії',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...timelineParams, worldId })
      });

      if (!response.ok) throw new Error('Failed to generate timeline');

      const events = await response.json();
      setResults(prev => [...prev, { 
        type: 'timeline', 
        data: { params: timelineParams, events } 
      }]);
      
      toast({
        title: 'Події згенеровано',
        description: `Створено ${events.length} історичних подій`,
      });
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося згенерувати події. Перевірте налаштування API.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden fantasy-border bg-black/90 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-fantasy-gold-300 font-fantasy text-2xl flex items-center gap-2">
            <Wand2 className="w-6 h-6" />
            AI Асистент світобудування
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full gap-4 mt-4">
          {/* Ліва панель - генератори */}
          <div className="w-1/2 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="names" className="text-gray-300">
                  <Users className="w-4 h-4 mr-1" />
                  Імена
                </TabsTrigger>
                <TabsTrigger value="descriptions" className="text-gray-300">
                  <Scroll className="w-4 h-4 mr-1" />
                  Описи
                </TabsTrigger>
                <TabsTrigger value="timeline" className="text-gray-300">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Події
                </TabsTrigger>
              </TabsList>

              <TabsContent value="names" className="space-y-4 mt-4">
                <Card className="fantasy-border bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-fantasy-gold-300">Генератор імен</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Тип</Label>
                      <Select value={nameParams.type} onValueChange={(value) => 
                        setNameParams(prev => ({ ...prev, type: value }))
                      }>
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="character">Персонаж</SelectItem>
                          <SelectItem value="location">Локація</SelectItem>
                          <SelectItem value="artifact">Артефакт</SelectItem>
                          <SelectItem value="organization">Організація</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Раса/Народ</Label>
                      <Input
                        value={nameParams.race}
                        onChange={(e) => setNameParams(prev => ({ ...prev, race: e.target.value }))}
                        placeholder="Наприклад: ельфи, люди, орки"
                        className="bg-gray-800 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label>Культурний стиль</Label>
                      <Input
                        value={nameParams.culture}
                        onChange={(e) => setNameParams(prev => ({ ...prev, culture: e.target.value }))}
                        placeholder="Наприклад: скандинавський, східний"
                        className="bg-gray-800 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label>Тема</Label>
                      <Input
                        value={nameParams.theme}
                        onChange={(e) => setNameParams(prev => ({ ...prev, theme: e.target.value }))}
                        placeholder="Наприклад: магічний, воїнський, мирний"
                        className="bg-gray-800 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label>Кількість</Label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={nameParams.count}
                        onChange={(e) => setNameParams(prev => ({ ...prev, count: parseInt(e.target.value) || 5 }))}
                        className="bg-gray-800 border-gray-600"
                      />
                    </div>

                    <Button 
                      onClick={handleGenerateNames}
                      disabled={isGenerating}
                      className="fantasy-button w-full"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4 mr-2" />
                      )}
                      Згенерувати імена
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="descriptions" className="space-y-4 mt-4">
                <Card className="fantasy-border bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-fantasy-gold-300">Генератор описів</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Назва</Label>
                      <Input
                        value={descParams.name}
                        onChange={(e) => setDescParams(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Введіть назву для опису"
                        className="bg-gray-800 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label>Тип</Label>
                      <Select value={descParams.type} onValueChange={(value) => 
                        setDescParams(prev => ({ ...prev, type: value }))
                      }>
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="character">Персонаж</SelectItem>
                          <SelectItem value="location">Локація</SelectItem>
                          <SelectItem value="artifact">Артефакт</SelectItem>
                          <SelectItem value="creature">Створіння</SelectItem>
                          <SelectItem value="event">Подія</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Контекст</Label>
                      <Textarea
                        value={descParams.context}
                        onChange={(e) => setDescParams(prev => ({ ...prev, context: e.target.value }))}
                        placeholder="Додатковий контекст про світ або ситуацію"
                        className="bg-gray-800 border-gray-600 min-h-[80px]"
                      />
                    </div>

                    <div>
                      <Label>Стиль</Label>
                      <Select value={descParams.style} onValueChange={(value) => 
                        setDescParams(prev => ({ ...prev, style: value }))
                      }>
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brief">Короткий</SelectItem>
                          <SelectItem value="detailed">Детальний</SelectItem>
                          <SelectItem value="poetic">Поетичний</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={handleGenerateDescription}
                      disabled={isGenerating}
                      className="fantasy-button w-full"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Scroll className="w-4 h-4 mr-2" />
                      )}
                      Згенерувати опис
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4 mt-4">
                <Card className="fantasy-border bg-black/20">
                  <CardHeader>
                    <CardTitle className="text-fantasy-gold-300">Генератор подій</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Назва часової лінії</Label>
                      <Input
                        value={timelineParams.timelineName}
                        onChange={(e) => setTimelineParams(prev => ({ ...prev, timelineName: e.target.value }))}
                        placeholder="Наприклад: Велика війна, Ера королів"
                        className="bg-gray-800 border-gray-600"
                      />
                    </div>

                    <div>
                      <Label>Контекст світу</Label>
                      <Textarea
                        value={timelineParams.context}
                        onChange={(e) => setTimelineParams(prev => ({ ...prev, context: e.target.value }))}
                        placeholder="Опишіть світ та його ключові елементи"
                        className="bg-gray-800 border-gray-600 min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label>Кількість подій</Label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={timelineParams.count}
                        onChange={(e) => setTimelineParams(prev => ({ ...prev, count: parseInt(e.target.value) || 5 }))}
                        className="bg-gray-800 border-gray-600"
                      />
                    </div>

                    <Button 
                      onClick={handleGenerateTimeline}
                      disabled={isGenerating}
                      className="fantasy-button w-full"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Згенерувати події
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Права панель - результати */}
          <div className="w-1/2 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-fantasy-gold-300 font-fantasy text-lg">Результати</h3>
              {results.length > 0 && (
                <Button 
                  onClick={clearResults}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300"
                >
                  Очистити
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {results.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Використовуйте генератори ліворуч для створення контенту</p>
                </div>
              ) : (
                results.map((result, index) => (
                  <Card key={index} className="fantasy-border bg-black/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-fantasy-gold-300 text-sm">
                        {result.type === 'names' && 'Згенеровані імена'}
                        {result.type === 'description' && 'Згенерований опис'}
                        {result.type === 'timeline' && 'Згенеровані події'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {result.type === 'names' && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-400">
                            {result.data.params.type} • {result.data.params.race} • {result.data.params.culture}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {result.data.names.map((name: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-purple-900/30 text-purple-200 rounded text-sm">
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.type === 'description' && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-400">
                            {result.data.params.name} • {result.data.params.type} • {result.data.params.style}
                          </p>
                          <div className="text-gray-300 text-sm bg-gray-800/50 p-3 rounded">
                            {result.data.description}
                          </div>
                        </div>
                      )}

                      {result.type === 'timeline' && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-400">
                            {result.data.params.timelineName}
                          </p>
                          <div className="space-y-2">
                            {result.data.events.map((event: any, i: number) => (
                              <div key={i} className="bg-gray-800/50 p-2 rounded text-sm">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-purple-200 font-semibold">{event.name}</span>
                                  <span className="text-xs text-gray-400">{event.date}</span>
                                </div>
                                <p className="text-gray-300 text-xs">{event.description}</p>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-xs px-1 py-0.5 bg-purple-900/30 text-purple-200 rounded">
                                    {event.type}
                                  </span>
                                  <span className="text-xs px-1 py-0.5 bg-yellow-900/30 text-yellow-200 rounded">
                                    Важливість: {event.importance}/5
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}