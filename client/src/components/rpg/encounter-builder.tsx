import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Swords, Users, Plus, Trash, Calculator, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EncounterCreature {
  id: string;
  name: string;
  cr: string;
  count: number;
  hp: number;
  ac: number;
}

interface EncounterDifficulty {
  totalXP: number;
  adjustedXP: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Deadly';
}

interface TreasureResult {
  coins: { cp: number; sp: number; gp: number };
  items: string[];
  totalValue: number;
}

export default function EncounterBuilder() {
  const { toast } = useToast();
  const [creatures, setCreatures] = useState<EncounterCreature[]>([]);
  const [partyLevel, setPartyLevel] = useState(1);
  const [partySize, setPartySize] = useState(4);
  const [difficulty, setDifficulty] = useState<EncounterDifficulty | null>(null);
  const [treasure, setTreasure] = useState<TreasureResult | null>(null);
  const [environment, setEnvironment] = useState('');

  // Нове створіння для додавання
  const [newCreature, setNewCreature] = useState({
    name: '',
    cr: '1/4',
    count: 1
  });

  // Розрахунок складності зустрічі
  const calculateDifficulty = async () => {
    if (creatures.length === 0) return;

    try {
      const response = await fetch('/api/rpg/encounter-difficulty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatures: creatures.map(c => ({ name: c.name, cr: c.cr, count: c.count })),
          partyLevel,
          partySize
        })
      });

      if (response.ok) {
        const result = await response.json();
        setDifficulty(result);
      }
    } catch (error) {
      toast({
        title: 'Помилка розрахунку',
        description: 'Не вдалося розрахувати складність зустрічі',
        variant: 'destructive',
      });
    }
  };

  // Генерація скарбів
  const generateTreasure = async () => {
    if (!difficulty) return;

    try {
      const avgCR = creatures.reduce((sum, c) => {
        const crNum = c.cr.includes('/') ? 0.5 : parseInt(c.cr);
        return sum + crNum * c.count;
      }, 0) / creatures.reduce((sum, c) => sum + c.count, 0);

      const response = await fetch('/api/rpg/generate-treasure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeRating: Math.floor(avgCR).toString(),
          type: difficulty.difficulty === 'Deadly' ? 'hoard' : 'individual'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTreasure(result);
        
        toast({
          title: 'Скарби згенеровано',
          description: `Загальна вартість: ${result.totalValue} зм`,
        });
      }
    } catch (error) {
      toast({
        title: 'Помилка генерації',
        description: 'Не вдалося згенерувати скарби',
        variant: 'destructive',
      });
    }
  };

  // Додавання створіння
  const addCreature = () => {
    if (!newCreature.name) return;

    const creature: EncounterCreature = {
      id: `${Date.now()}_${Math.random()}`,
      name: newCreature.name,
      cr: newCreature.cr,
      count: newCreature.count,
      hp: getCRDefaultHP(newCreature.cr),
      ac: getCRDefaultAC(newCreature.cr)
    };

    setCreatures(prev => [...prev, creature]);
    setNewCreature({ name: '', cr: '1/4', count: 1 });
  };

  // Видалення створіння
  const removeCreature = (id: string) => {
    setCreatures(prev => prev.filter(c => c.id !== id));
  };

  // Оновлення кількості створінь
  const updateCreatureCount = (id: string, count: number) => {
    setCreatures(prev => prev.map(c => 
      c.id === id ? { ...c, count: Math.max(1, count) } : c
    ));
  };

  // Базові характеристики за CR
  const getCRDefaultHP = (cr: string): number => {
    const hpTable: Record<string, number> = {
      "0": 1, "1/8": 2, "1/4": 4, "1/2": 8,
      "1": 15, "2": 25, "3": 40, "4": 55, "5": 70
    };
    return hpTable[cr] || 15;
  };

  const getCRDefaultAC = (cr: string): number => {
    const acTable: Record<string, number> = {
      "0": 10, "1/8": 11, "1/4": 12, "1/2": 13,
      "1": 13, "2": 14, "3": 15, "4": 16, "5": 17
    };
    return acTable[cr] || 13;
  };

  // Отримання кольору складності
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'bg-green-900/20 text-green-200 border-green-600/30';
      case 'Medium': return 'bg-yellow-900/20 text-yellow-200 border-yellow-600/30';
      case 'Hard': return 'bg-orange-900/20 text-orange-200 border-orange-600/30';
      case 'Deadly': return 'bg-red-900/20 text-red-200 border-red-600/30';
      default: return 'bg-gray-900/20 text-gray-200 border-gray-600/30';
    }
  };

  useEffect(() => {
    if (creatures.length > 0) {
      calculateDifficulty();
    }
  }, [creatures, partyLevel, partySize]);

  return (
    <div className="space-y-6">
      {/* Налаштування партії */}
      <Card className="fantasy-border bg-black/20">
        <CardHeader>
          <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
            <Swords className="w-5 h-5" />
            Конструктор зустрічей D&D 5e
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Рівень партії
              </label>
              <Select value={partyLevel.toString()} onValueChange={(value) => setPartyLevel(parseInt(value))}>
                <SelectTrigger className="fantasy-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
                    <SelectItem key={level} value={level.toString()}>{level} рівень</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Розмір партії
              </label>
              <Input
                type="number"
                min="1"
                max="8"
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value) || 4)}
                className="fantasy-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Додавання створінь */}
      <Card className="fantasy-border bg-black/20">
        <CardHeader>
          <CardTitle className="text-fantasy-gold-300">Створіння у зустрічі</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Форма додавання */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="Назва створіння"
              value={newCreature.name}
              onChange={(e) => setNewCreature(prev => ({ ...prev, name: e.target.value }))}
              className="fantasy-input"
            />
            
            <Select 
              value={newCreature.cr} 
              onValueChange={(value) => setNewCreature(prev => ({ ...prev, cr: value }))}
            >
              <SelectTrigger className="fantasy-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">CR 0</SelectItem>
                <SelectItem value="1/8">CR 1/8</SelectItem>
                <SelectItem value="1/4">CR 1/4</SelectItem>
                <SelectItem value="1/2">CR 1/2</SelectItem>
                <SelectItem value="1">CR 1</SelectItem>
                <SelectItem value="2">CR 2</SelectItem>
                <SelectItem value="3">CR 3</SelectItem>
                <SelectItem value="4">CR 4</SelectItem>
                <SelectItem value="5">CR 5</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="number"
              min="1"
              placeholder="Кількість"
              value={newCreature.count}
              onChange={(e) => setNewCreature(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
              className="fantasy-input"
            />
            
            <Button onClick={addCreature} disabled={!newCreature.name} className="fantasy-button">
              <Plus className="w-4 h-4 mr-1" />
              Додати
            </Button>
          </div>

          {/* Список створінь */}
          {creatures.length > 0 && (
            <div className="space-y-2">
              {creatures.map((creature) => (
                <div key={creature.id} className="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-600/30 rounded">
                  <div className="flex items-center gap-4">
                    <span className="text-purple-200 font-medium">{creature.name}</span>
                    <Badge variant="outline">CR {creature.cr}</Badge>
                    <span className="text-gray-400 text-sm">
                      HP: {creature.hp}, AC: {creature.ac}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={creature.count}
                      onChange={(e) => updateCreatureCount(creature.id, parseInt(e.target.value) || 1)}
                      className="w-16 text-center"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCreature(creature.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Аналіз складності */}
      {difficulty && (
        <Card className="fantasy-border bg-black/20">
          <CardHeader>
            <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Аналіз зустрічі
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-300">{difficulty.totalXP}</p>
                <p className="text-gray-400 text-sm">Базовий XP</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-300">{difficulty.adjustedXP}</p>
                <p className="text-gray-400 text-sm">Скоригований XP</p>
              </div>
              
              <div className="text-center">
                <Badge className={getDifficultyColor(difficulty.difficulty)}>
                  {difficulty.difficulty}
                </Badge>
                <p className="text-gray-400 text-sm mt-1">Складність</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={generateTreasure} className="fantasy-button gap-2">
                <Coins className="w-4 h-4" />
                Згенерувати скарби
              </Button>
              
              <Button variant="outline">
                Зберегти зустріч
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Скарби */}
      {treasure && (
        <Card className="fantasy-border bg-black/20">
          <CardHeader>
            <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Скарби зустрічі
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-yellow-300 font-bold text-lg">{treasure.coins.gp}</p>
                <p className="text-gray-400 text-sm">Золотих</p>
              </div>
              <div>
                <p className="text-gray-300 font-bold text-lg">{treasure.coins.sp}</p>
                <p className="text-gray-400 text-sm">Срібних</p>
              </div>
              <div>
                <p className="text-orange-300 font-bold text-lg">{treasure.coins.cp}</p>
                <p className="text-gray-400 text-sm">Мідних</p>
              </div>
            </div>

            {treasure.items.length > 0 && (
              <div>
                <h4 className="text-fantasy-gold-300 font-semibold mb-2">Магічні предмети:</h4>
                <div className="space-y-1">
                  {treasure.items.map((item, index) => (
                    <p key={index} className="text-purple-200">• {item}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-green-300 font-semibold">
                Загальна вартість: {treasure.totalValue} зм
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}