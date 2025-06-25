import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sword, Shield, Heart, Zap, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StatblockData {
  name: string;
  type: string;
  level: number;
  hp: number;
  ac: number;
  speed: string;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  cr: string;
  proficiency: number;
  attacks?: any[];
}

interface StatblockGeneratorProps {
  entityId?: number;
  entityType?: string;
  onSave?: (statblock: StatblockData) => void;
}

export default function StatblockGenerator({ entityId, entityType, onSave }: StatblockGeneratorProps) {
  const { toast } = useToast();
  const [statblock, setStatblock] = useState<StatblockData>({
    name: '',
    type: 'humanoid',
    level: 1,
    hp: 8,
    ac: 12,
    speed: '30 ft',
    str: 10,
    dex: 12,
    con: 11,
    int: 10,
    wis: 12,
    cha: 11,
    cr: '1/4',
    proficiency: 2
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Генерація статблоку на основі типу та рівня
  const generateStatblock = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/rpg/generate-statblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: statblock.name,
          type: statblock.type,
          level: statblock.level
        })
      });

      if (response.ok) {
        const generated = await response.json();
        setStatblock(prev => ({ ...prev, ...generated }));
        
        toast({
          title: 'Статблок згенеровано',
          description: `Створено D&D 5e статблок для ${statblock.name}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Помилка генерації',
        description: 'Не вдалося згенерувати статблок',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Збереження статблоку
  const handleSave = async () => {
    try {
      const response = await fetch('/api/rpg/statblocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...statblock,
          entityId,
          entityType
        })
      });

      if (response.ok) {
        toast({
          title: 'Статблок збережено',
          description: 'D&D 5e статблок додано до бази даних',
        });
        
        if (onSave) onSave(statblock);
      }
    } catch (error) {
      toast({
        title: 'Помилка збереження',
        description: 'Не вдалося зберегти статблок',
        variant: 'destructive',
      });
    }
  };

  // Копіювання у буфер обміну
  const copyToClipboard = () => {
    const statblockText = formatStatblockText(statblock);
    navigator.clipboard.writeText(statblockText);
    
    toast({
      title: 'Скопійовано',
      description: 'Статблок скопійовано у буфер обміну',
    });
  };

  // Форматування статблоку у текст
  const formatStatblockText = (data: StatblockData): string => {
    const abilityMod = (score: number) => Math.floor((score - 10) / 2);
    const formatMod = (mod: number) => mod >= 0 ? `+${mod}` : `${mod}`;

    return `**${data.name}**
*${data.type}*

**Armor Class** ${data.ac}
**Hit Points** ${data.hp}
**Speed** ${data.speed}

**STR** ${data.str} (${formatMod(abilityMod(data.str))}) **DEX** ${data.dex} (${formatMod(abilityMod(data.dex))}) **CON** ${data.con} (${formatMod(abilityMod(data.con))})
**INT** ${data.int} (${formatMod(abilityMod(data.int))}) **WIS** ${data.wis} (${formatMod(abilityMod(data.wis))}) **CHA** ${data.cha} (${formatMod(abilityMod(data.cha))})

**Challenge** ${data.cr} (${getCRExperience(data.cr)} XP)
**Proficiency Bonus** ${formatMod(data.proficiency)}`;
  };

  const getCRExperience = (cr: string): number => {
    const xpTable: Record<string, number> = {
      "0": 10, "1/8": 25, "1/4": 50, "1/2": 100,
      "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800
    };
    return xpTable[cr] || 200;
  };

  const abilityMod = (score: number) => Math.floor((score - 10) / 2);
  const formatMod = (mod: number) => mod >= 0 ? `+${mod}` : `${mod}`;

  return (
    <div className="space-y-6">
      {/* Налаштування генерації */}
      <Card className="fantasy-border bg-black/20">
        <CardHeader>
          <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
            <Sword className="w-5 h-5" />
            D&D 5e Генератор статблоків
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Назва створіння</Label>
              <Input
                value={statblock.name}
                onChange={(e) => setStatblock(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введіть назву"
                className="fantasy-input"
              />
            </div>
            
            <div>
              <Label>Тип створіння</Label>
              <Select 
                value={statblock.type} 
                onValueChange={(value) => setStatblock(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="fantasy-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="humanoid">Гуманоїд</SelectItem>
                  <SelectItem value="beast">Звір</SelectItem>
                  <SelectItem value="monstrosity">Монстр</SelectItem>
                  <SelectItem value="undead">Нежить</SelectItem>
                  <SelectItem value="fey">Фея</SelectItem>
                  <SelectItem value="dragon">Дракон</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Рівень/HD</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={statblock.level}
                onChange={(e) => setStatblock(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                className="fantasy-input"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={generateStatblock}
              disabled={isGenerating || !statblock.name}
              className="fantasy-button gap-2"
            >
              {isGenerating ? (
                <>
                  <Zap className="w-4 h-4 animate-pulse" />
                  Генерую...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Згенерувати статблок
                </>
              )}
            </Button>
            
            <Button onClick={handleSave} disabled={!statblock.name} variant="outline">
              Зберегти
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Відображення статблоку */}
      {statblock.name && (
        <Card className="fantasy-border bg-black/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-fantasy-gold-300">
                {statblock.name}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Основна інформація */}
            <div className="text-center">
              <p className="text-purple-200 text-lg font-semibold">{statblock.name}</p>
              <p className="text-gray-400 italic capitalize">{statblock.type}</p>
            </div>
            
            <Separator />
            
            {/* Захист та здоров'я */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-blue-300" />
                <div>
                  <p className="text-blue-300 font-semibold">AC {statblock.ac}</p>
                  <p className="text-xs text-gray-400">Клас захисту</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-4 h-4 text-red-300" />
                <div>
                  <p className="text-red-300 font-semibold">{statblock.hp} HP</p>
                  <p className="text-xs text-gray-400">Очки здоров'я</p>
                </div>
              </div>
              
              <div>
                <p className="text-yellow-300 font-semibold">{statblock.speed}</p>
                <p className="text-xs text-gray-400">Швидкість</p>
              </div>
            </div>
            
            <Separator />
            
            {/* Характеристики */}
            <div className="grid grid-cols-6 gap-2 text-center">
              {[
                { name: 'STR', value: statblock.str },
                { name: 'DEX', value: statblock.dex },
                { name: 'CON', value: statblock.con },
                { name: 'INT', value: statblock.int },
                { name: 'WIS', value: statblock.wis },
                { name: 'CHA', value: statblock.cha }
              ].map(({ name, value }) => (
                <div key={name} className="bg-gray-800/50 p-2 rounded">
                  <p className="text-purple-200 font-semibold text-sm">{name}</p>
                  <p className="text-white font-bold">{value}</p>
                  <p className="text-gray-400 text-xs">
                    {formatMod(abilityMod(value))}
                  </p>
                </div>
              ))}
            </div>
            
            <Separator />
            
            {/* Challenge Rating */}
            <div className="text-center">
              <p className="text-yellow-300 font-semibold">
                Challenge {statblock.cr} ({getCRExperience(statblock.cr)} XP)
              </p>
              <p className="text-gray-400 text-sm">
                Proficiency Bonus {formatMod(statblock.proficiency)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}