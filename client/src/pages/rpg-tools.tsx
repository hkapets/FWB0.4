import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sword, Dice6, Swords, Calculator } from 'lucide-react';
import StatblockGenerator from '@/components/rpg/statblock-generator';
import EncounterBuilder from '@/components/rpg/encounter-builder';
import DiceRoller from '@/components/rpg/dice-roller';

export default function RPGTools() {
  const [activeTab, setActiveTab] = useState('statblocks');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Sword className="w-8 h-8 text-fantasy-gold-300" />
          <h1 className="text-3xl font-fantasy text-fantasy-gold-300">
            RPG Інструменти
          </h1>
        </div>
        <p className="text-gray-400">
          Професійні інструменти для майстрів гри: статблоки D&D 5e, конструктор зустрічей, dice roller
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="statblocks" className="text-gray-300 gap-2">
            <Sword className="w-4 h-4" />
            Статблоки
          </TabsTrigger>
          <TabsTrigger value="encounters" className="text-gray-300 gap-2">
            <Swords className="w-4 h-4" />
            Зустрічі
          </TabsTrigger>
          <TabsTrigger value="dice" className="text-gray-300 gap-2">
            <Dice6 className="w-4 h-4" />
            Кубики
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="text-gray-300 gap-2">
            <Calculator className="w-4 h-4" />
            Кампанії
          </TabsTrigger>
        </TabsList>

        <TabsContent value="statblocks" className="space-y-6">
          <StatblockGenerator />
        </TabsContent>

        <TabsContent value="encounters" className="space-y-6">
          <EncounterBuilder />
        </TabsContent>

        <TabsContent value="dice" className="space-y-6">
          <DiceRoller />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card className="fantasy-border bg-black/20">
            <CardHeader>
              <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Управління кампаніями
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-400 py-8">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Інструменти управління кампаніями будуть додані в наступних оновленнях</p>
                <p className="text-sm mt-2">
                  Планується: Session Tracker, Quest Log, XP Calculator, Player Handouts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}