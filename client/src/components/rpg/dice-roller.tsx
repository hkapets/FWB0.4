import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dice1, Dice6, Save, Trash, History, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiceResult {
  result: number;
  total: number;
  rolls: number[];
  formula: string;
  context?: string;
  timestamp: string;
}

interface DiceMacro {
  id: string;
  name: string;
  formula: string;
  description: string;
}

export default function DiceRoller() {
  const { toast } = useToast();
  const [formula, setFormula] = useState('1d20');
  const [context, setContext] = useState('');
  const [results, setResults] = useState<DiceResult[]>([]);
  const [macros, setMacros] = useState<DiceMacro[]>([]);
  const [showMacroForm, setShowMacroForm] = useState(false);
  const [newMacro, setNewMacro] = useState({ name: '', formula: '', description: '' });

  // Завантажити збережені макроси
  useEffect(() => {
    loadMacros();
    loadHistory();
  }, []);

  const loadMacros = async () => {
    try {
      const response = await fetch('/api/rpg/dice-macros');
      if (response.ok) {
        const data = await response.json();
        setMacros(data);
      }
    } catch (error) {
      console.error('Error loading macros:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/rpg/roll-history?limit=10');
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  // Кидок кубиків
  const rollDice = async (diceFormula?: string, rollContext?: string) => {
    const actualFormula = diceFormula || formula;
    const actualContext = rollContext || context;

    try {
      const response = await fetch('/api/rpg/roll-dice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formula: actualFormula,
          context: actualContext
        })
      });

      if (response.ok) {
        const result = await response.json();
        const diceResult: DiceResult = {
          ...result,
          timestamp: new Date().toISOString()
        };
        
        setResults(prev => [diceResult, ...prev.slice(0, 9)]);
        
        toast({
          title: `🎲 Результат: ${result.result}`,
          description: `${actualFormula}${actualContext ? ` (${actualContext})` : ''}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Помилка кидка',
        description: 'Перевірте формулу кубиків',
        variant: 'destructive',
      });
    }
  };

  // Збереження макроса
  const saveMacro = async () => {
    if (!newMacro.name || !newMacro.formula) return;

    try {
      const response = await fetch('/api/rpg/dice-macros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMacro)
      });

      if (response.ok) {
        toast({
          title: 'Макрос збережено',
          description: `Макрос "${newMacro.name}" додано`,
        });
        
        setNewMacro({ name: '', formula: '', description: '' });
        setShowMacroForm(false);
        loadMacros();
      }
    } catch (error) {
      toast({
        title: 'Помилка збереження',
        description: 'Не вдалося зберегти макрос',
        variant: 'destructive',
      });
    }
  };

  // Швидкі кнопки кубиків
  const quickRolls = [
    { label: 'd4', formula: '1d4' },
    { label: 'd6', formula: '1d6' },
    { label: 'd8', formula: '1d8' },
    { label: 'd10', formula: '1d10' },
    { label: 'd12', formula: '1d12' },
    { label: 'd20', formula: '1d20' },
    { label: 'd100', formula: '1d100' },
    { label: 'Атака', formula: '1d20+5' },
    { label: 'Урон', formula: '1d8+3' },
    { label: 'Ініціатива', formula: '1d20+2' }
  ];

  // Форматування часу
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Отримання кольору за результатом
  const getResultColor = (result: number, max: number) => {
    const percentage = result / max;
    if (percentage >= 0.9) return 'text-green-300';
    if (percentage >= 0.7) return 'text-yellow-300';
    if (percentage >= 0.3) return 'text-orange-300';
    return 'text-red-300';
  };

  return (
    <div className="space-y-6">
      {/* Основний роллер */}
      <Card className="fantasy-border bg-black/20">
        <CardHeader>
          <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
            <Dice6 className="w-5 h-5" />
            Універсальний роллер кубиків
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Формула (напр. 1d20+5)"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              className="fantasy-input"
              onKeyPress={(e) => e.key === 'Enter' && rollDice()}
            />
            
            <Input
              placeholder="Контекст (напр. атака)"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="fantasy-input"
            />
            
            <Button onClick={() => rollDice()} className="fantasy-button gap-2">
              <Dice1 className="w-4 h-4" />
              Кинути
            </Button>
          </div>

          {/* Швидкі кнопки */}
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {quickRolls.map((roll) => (
              <Button
                key={roll.label}
                variant="outline"
                size="sm"
                onClick={() => rollDice(roll.formula, roll.label)}
                className="text-xs"
              >
                {roll.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Макроси */}
      <Card className="fantasy-border bg-black/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-fantasy-gold-300">Збережені макроси</CardTitle>
            <Button 
              onClick={() => setShowMacroForm(!showMacroForm)} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Новий макрос
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Форма нового макроса */}
          {showMacroForm && (
            <div className="p-4 bg-gray-800/30 border border-gray-600/30 rounded space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Назва макроса"
                  value={newMacro.name}
                  onChange={(e) => setNewMacro(prev => ({ ...prev, name: e.target.value }))}
                  className="fantasy-input"
                />
                <Input
                  placeholder="Формула (1d20+5)"
                  value={newMacro.formula}
                  onChange={(e) => setNewMacro(prev => ({ ...prev, formula: e.target.value }))}
                  className="fantasy-input"
                />
              </div>
              <Input
                placeholder="Опис макроса (опціонально)"
                value={newMacro.description}
                onChange={(e) => setNewMacro(prev => ({ ...prev, description: e.target.value }))}
                className="fantasy-input"
              />
              <div className="flex gap-2">
                <Button onClick={saveMacro} className="fantasy-button gap-2">
                  <Save className="w-4 h-4" />
                  Зберегти
                </Button>
                <Button variant="outline" onClick={() => setShowMacroForm(false)}>
                  Скасувати
                </Button>
              </div>
            </div>
          )}

          {/* Список макросів */}
          {macros.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {macros.map((macro) => (
                <div key={macro.id} className="p-3 bg-gray-800/30 border border-gray-600/30 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-200 font-medium">{macro.name}</span>
                    <Badge variant="outline">{macro.formula}</Badge>
                  </div>
                  {macro.description && (
                    <p className="text-gray-400 text-sm mb-2">{macro.description}</p>
                  )}
                  <Button 
                    size="sm" 
                    onClick={() => rollDice(macro.formula, macro.name)}
                    className="fantasy-button"
                  >
                    Кинути
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Історія кидків */}
      <Card className="fantasy-border bg-black/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
              <History className="w-5 h-5" />
              Історія кидків
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setResults([])}
              className="gap-2"
            >
              <Trash className="w-4 h-4" />
              Очистити
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Dice6 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Немає кидків для відображення</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={`${result.timestamp}-${index}`} className="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-600/30 rounded">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl font-bold ${getResultColor(result.result, 20)}`}>
                      {result.result}
                    </span>
                    <div>
                      <p className="text-purple-200 font-medium">{result.formula}</p>
                      {result.context && (
                        <p className="text-gray-400 text-sm">{result.context}</p>
                      )}
                      {result.rolls.length > 1 && (
                        <p className="text-gray-500 text-xs">
                          Кубики: [{result.rolls.join(', ')}]
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {formatTime(result.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}