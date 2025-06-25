import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Grid, List, Crown, Sparkles, Shield, Sword } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import CreateMythologyModal from "@/components/modals/create-mythology-modal";

interface MythologyEntity {
  id: number;
  name: { uk: string; en: string };
  type: "pantheon" | "deity" | "spirit" | "legend" | "creation_myth" | "prophecy" | "ritual" | "sacred_place";
  description: { uk: string; en: string };
  domain?: string;
  power_level?: "minor" | "major" | "supreme";
  alignment?: "good" | "neutral" | "evil" | "chaotic" | "lawful";
  symbols: string[];
  followers?: string;
  sacred_texts: string[];
  holy_days: string[];
  temples: string[];
  image?: string;
}

export default function MythologyPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMythology, setEditingMythology] = useState<MythologyEntity | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock data for demonstration
  const mockData: MythologyEntity[] = [
    {
      id: 1,
      name: { uk: "Торн Громовержець", en: "Thorn the Thunderer" },
      type: "deity",
      description: { 
        uk: "Могутнє божество бурі та війни, покровитель воїнів та мореплавців", 
        en: "Mighty deity of storm and war, patron of warriors and sailors" 
      },
      domain: "Буря, війна, мужність",
      power_level: "major",
      alignment: "chaotic",
      symbols: ["Молот", "Блискавка", "Дуб"],
      followers: "Воїни, мореплавці, ковалі",
      sacred_texts: ["Пісні Грому", "Кодекс Воїна"],
      holy_days: ["День Грому", "Свято Бурі"],
      temples: ["Храм Громовержця", "Святилище Бурі"]
    },
    {
      id: 2,
      name: { uk: "Легенда про Срібного Дракона", en: "Legend of the Silver Dragon" },
      type: "legend",
      description: { 
        uk: "Стародавня легенда про дракона, який пожертвував собою заради миру між расами", 
        en: "Ancient legend of a dragon who sacrificed himself for peace between races" 
      },
      power_level: "supreme",
      alignment: "good",
      symbols: ["Срібна луска", "Мирний договір", "Біла троянда"],
      followers: "Миротворці, дипломати, істори",
      sacred_texts: ["Хроніки Срібного Дракона"],
      holy_days: ["День Миру"],
      temples: ["Меморіал Срібного Дракона"]
    }
  ];

  const { data: mythology = mockData, isLoading } = useQuery({
    queryKey: ['/api/worlds/1/mythology'],
    queryFn: () => Promise.resolve(mockData),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<MythologyEntity, 'id'>) => {
      return { id: Date.now(), ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds/1/mythology'] });
      toast({
        title: "Міфологію створено",
        description: "Нову міфологічну сутність успішно додано до світу",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: MythologyEntity) => {
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds/1/mythology'] });
      toast({
        title: "Міфологію оновлено",
        description: "Зміни успішно збережено",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds/1/mythology'] });
      toast({
        title: "Міфологію видалено",
        description: "Міфологічну сутність успішно вилучено зі світу",
      });
    },
  });

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleEdit = (data: any) => {
    if (editingMythology) {
      updateMutation.mutate({ ...data, id: editingMythology.id });
      setEditingMythology(null);
    }
  };

  const filteredMythology = mythology.filter((item: MythologyEntity) => {
    const matchesSearch = item.name.uk.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.name.en.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pantheon': case 'deity': return <Crown className="w-4 h-4" />;
      case 'spirit': case 'ritual': return <Sparkles className="w-4 h-4" />;
      case 'legend': case 'creation_myth': return <Sword className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'pantheon': 'Пантеон',
      'deity': 'Божество',
      'spirit': 'Дух',
      'legend': 'Легенда',
      'creation_myth': 'Міф створення',
      'prophecy': 'Пророцтво',
      'ritual': 'Ритуал',
      'sacred_place': 'Священне місце'
    };
    return labels[type] || type;
  };

  const getPowerLevelColor = (level?: string) => {
    const colors: { [key: string]: string } = {
      'minor': 'text-gray-400',
      'major': 'text-yellow-400',
      'supreme': 'text-purple-400'
    };
    return colors[level || ''] || 'text-gray-400';
  };

  const getPowerLevelLabel = (level?: string) => {
    const labels: { [key: string]: string } = {
      'minor': 'Малий',
      'major': 'Великий',
      'supreme': 'Верховний'
    };
    return labels[level || ''] || '';
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Завантаження...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-100">Міфологія</h1>
          <p className="text-purple-300 mt-2">
            Керуйте божествами, легендами, ритуалами та священними місцями вашого світу
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="fantasy-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Створити міфологію
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Пошук міфології..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Фільтр за типом" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі типи</SelectItem>
            <SelectItem value="pantheon">Пантеон</SelectItem>
            <SelectItem value="deity">Божество</SelectItem>
            <SelectItem value="spirit">Дух</SelectItem>
            <SelectItem value="legend">Легенда</SelectItem>
            <SelectItem value="creation_myth">Міф створення</SelectItem>
            <SelectItem value="prophecy">Пророцтво</SelectItem>
            <SelectItem value="ritual">Ритуал</SelectItem>
            <SelectItem value="sacred_place">Священне місце</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {filteredMythology.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-400 mb-4">
              <Crown className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Міфологія відсутня</h3>
              <p>Створіть першу mythологічну сутність для вашого світу</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="fantasy-button">
              <Plus className="w-4 h-4 mr-2" />
              Створити міфологію
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredMythology.map((item: MythologyEntity) => (
            <Card key={item.id} className="fantasy-card hover-glow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-purple-100 flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      {item.name.uk}
                    </CardTitle>
                    <p className="text-sm text-purple-300">{item.name.en}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary">
                      {getTypeLabel(item.type)}
                    </Badge>
                    {item.power_level && (
                      <Badge 
                        variant="outline" 
                        className={getPowerLevelColor(item.power_level)}
                      >
                        {getPowerLevelLabel(item.power_level)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 mb-4">{item.description.uk}</p>
                
                {item.domain && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-purple-200">Сфера:</span>
                    <p className="text-sm text-gray-300">{item.domain}</p>
                  </div>
                )}

                {item.followers && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-purple-200">Послідовники:</span>
                    <p className="text-sm text-gray-300">{item.followers}</p>
                  </div>
                )}

                {item.symbols.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-purple-200">Символи:</span>
                    <p className="text-sm text-gray-300">{item.symbols.slice(0, 3).join(', ')}{item.symbols.length > 3 && '...'}</p>
                  </div>
                )}

                {item.sacred_texts.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-purple-200">Священні тексти:</span>
                    <p className="text-sm text-gray-300">{item.sacred_texts.slice(0, 2).join(', ')}{item.sacred_texts.length > 2 && '...'}</p>
                  </div>
                )}

                {item.holy_days.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-purple-200">Священні дні:</span>
                    <p className="text-sm text-gray-300">{item.holy_days.slice(0, 2).join(', ')}{item.holy_days.length > 2 && '...'}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingMythology(item);
                      setIsCreateModalOpen(true);
                    }}
                  >
                    Редагувати
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(item.id)}
                  >
                    Видалити
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateMythologyModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingMythology(null);
        }}
        onSubmit={editingMythology ? handleEdit : handleCreate}
        initialData={editingMythology || undefined}
        worldId={1}
      />
    </div>
  );
}