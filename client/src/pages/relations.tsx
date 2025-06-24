import { useTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import RelationshipMap from "@/components/relationship-map";
import { TreePine, Users, MapPin, Crown, Plus } from "lucide-react";

export default function RelationsPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const worldId = 1; // TODO: get from context or props
  
  const [familyTrees, setFamilyTrees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("map");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-fantasy font-bold text-fantasy-gold-400">
          Зв'язки
        </h1>
        <p className="text-gray-400 mt-2">
          Керуйте зв'язками між персонажами та створюйте родинні дерева
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 fantasy-border">
          <TabsTrigger value="map" className="fantasy-tab">
            <MapPin className="mr-2 h-4 w-4" />
            Карта зв'язків
          </TabsTrigger>
          <TabsTrigger value="family" className="fantasy-tab">
            <TreePine className="mr-2 h-4 w-4" />
            Родинні дерева
          </TabsTrigger>
          <TabsTrigger value="network" className="fantasy-tab">
            <Users className="mr-2 h-4 w-4" />
            Соціальні мережі
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-6">
          <Card className="fantasy-border bg-black/10 backdrop-blur-sm h-[600px]">
            <RelationshipMap worldId={worldId} />
          </Card>
        </TabsContent>

        <TabsContent value="family" className="mt-6">
          <Card className="fantasy-border bg-black/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-fantasy text-fantasy-gold-300">
                Родинні дерева
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TreePine className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <p className="text-gray-400 text-lg">Функціонал родинних дерев</p>
                <p className="text-gray-500 mb-6">Скоро буде додано</p>
                <Button className="fantasy-button">
                  <Plus className="mr-2 h-4 w-4" />
                  Створити родинне дерево
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="mt-6">
          <Card className="fantasy-border bg-black/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-fantasy text-fantasy-gold-300">
                Соціальні мережі
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <p className="text-gray-400 text-lg">Функціонал соціальних мереж</p>
                <p className="text-gray-500 mb-6">Відображення груп, альянсів та організацій</p>
                <Button className="fantasy-button">
                  <Plus className="mr-2 h-4 w-4" />
                  Створити групу
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}