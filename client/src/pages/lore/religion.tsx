import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Grid, List, Church, Users, Heart, Shield } from "lucide-react";
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
import CreateReligionModal from "@/components/modals/create-religion-modal";

interface ReligionEntity {
  id: number;
  name: { uk: string; en: string };
  type: "monotheistic" | "polytheistic" | "pantheistic" | "animistic" | "ancestor_worship" | "nature_worship" | "mystery_cult" | "philosophical";
  description: { uk: string; en: string };
  core_beliefs: { uk: string; en: string };
  moral_code?: { uk: string; en: string };
  clergy_structure?: "hierarchical" | "decentralized" | "none" | "tribal" | "monastic";
  worship_practices: string[];
  sacred_texts: string[];
  holy_symbols: string[];
  religious_holidays: string[];
  influence_level?: "local" | "regional" | "national" | "continental";
  followers_count?: string;
  image?: string;
}

export default function ReligionPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReligion, setEditingReligion] = useState<ReligionEntity | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock data for demonstration
  const mockData: ReligionEntity[] = [
    {
      id: 1,
      name: { uk: "Церква Світла", en: "Church of Light" },
      type: "monotheistic",
      description: { 
        uk: "Домінуюча релігія королівства, що проповідує віру в єдине божество світла і справедливості", 
        en: "Dominant religion of the kingdom preaching faith in a single deity of light and justice" 
      },
      core_beliefs: { 
        uk: "Віра в Єдине Світло, що освітлює шлях праведності. Всі люди рівні перед Світлом.", 
        en: "Faith in the Single Light that illuminates the path of righteousness. All people are equal before the Light." 
      },
      moral_code: { 
        uk: "Не вбий, не кради, допомагай нужденним, захищай слабких", 
        en: "Do not kill, do not steal, help the needy, protect the weak" 
      },
      clergy_structure: "hierarchical",
      worship_practices: ["Щоденні молитви", "Недільні служби", "Благодійність", "Паломництво"],
      sacred_texts: ["Книга Світла", "Псалми Справедливості"],
      holy_symbols: ["Сонце", "Біла троянда", "Золотий хрест"],
      religious_holidays: ["День Світла", "Свято Милосердя", "Великий піст"],
      influence_level: "national",
      followers_count: "2 мільйони вірних"
    },
    {
      id: 2,
      name: { uk: "Культ Лісових Духів", en: "Cult of Forest Spirits" },
      type: "animistic",
      description: { 
        uk: "Стародавня релігія ельфів, що шанує духів природи та лісових істот", 
        en: "Ancient elven religion that venerates nature spirits and forest beings" 
      },
      core_beliefs: { 
        uk: "Кожне дерево, струмок і каміння має свого духа. Природа священна і потребує захисту.", 
        en: "Every tree, stream and stone has its spirit. Nature is sacred and needs protection." 
      },
      moral_code: { 
        uk: "Живи в гармонії з природою, не руйнуй без потреби, поважай всі форми життя", 
        en: "Live in harmony with nature, do not destroy unnecessarily, respect all forms of life" 
      },
      clergy_structure: "tribal",
      worship_practices: ["Ритуали під повним місяцем", "Танці духів", "Жертвоприношення плодів", "Медитація в лісі"],
      sacred_texts: ["Пісні Дерев", "Легенди Духів"],
      holy_symbols: ["Лист дуба", "Місяць", "Спіраль життя"],
      religious_holidays: ["Свято Весняного пробудження", "Ніч духів", "День великого дерева"],
      influence_level: "regional",
      followers_count: "500,000 ельфів та лісових народів"
    }
  ];

  const { data: religions = mockData, isLoading } = useQuery({
    queryKey: ['/api/worlds/1/religions'],
    queryFn: () => Promise.resolve(mockData),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<ReligionEntity, 'id'>) => {
      return { id: Date.now(), ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds/1/religions'] });
      toast({
        title: "Релігію створено",
        description: "Нову релігію успішно додано до світу",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: ReligionEntity) => {
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds/1/religions'] });
      toast({
        title: "Релігію оновлено",
        description: "Зміни успішно збережено",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/worlds/1/religions'] });
      toast({
        title: "Релігію видалено",
        description: "Релігію успішно вилучено зі світу",
      });
    },
  });

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleEdit = (data: any) => {
    if (editingReligion) {
      updateMutation.mutate({ ...data, id: editingReligion.id });
      setEditingReligion(null);
    }
  };

  const filteredReligions = religions.filter((item: ReligionEntity) => {
    const matchesSearch = item.name.uk.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.name.en.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'monotheistic': case 'philosophical': return <Church className="w-4 h-4" />;
      case 'polytheistic': return <Users className="w-4 h-4" />;
      case 'nature_worship': case 'animistic': return <Heart className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'monotheistic': 'Монотеїстична',
      'polytheistic': 'Політеїстична',
      'pantheistic': 'Пантеїстична',
      'animistic': 'Анімістична',
      'ancestor_worship': 'Культ предків',
      'nature_worship': 'Культ природи',
      'mystery_cult': 'Містичний культ',
      'philosophical': 'Філософська'
    };
    return labels[type] || type;
  };

  const getInfluenceColor = (level?: string) => {
    const colors: { [key: string]: string } = {
      'local': 'text-gray-400',
      'regional': 'text-blue-400',
      'national': 'text-yellow-400',
      'continental': 'text-purple-400'
    };
    return colors[level || ''] || 'text-gray-400';
  };

  const getInfluenceLabel = (level?: string) => {
    const labels: { [key: string]: string } = {
      'local': 'Місцева',
      'regional': 'Регіональна',
      'national': 'Національна',
      'continental': 'Континентальна'
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
          <h1 className="text-3xl font-bold text-purple-100">Релігія</h1>
          <p className="text-purple-300 mt-2">
            Керуйте релігійними системами, віруваннями та практиками вашого світу
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="fantasy-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Створити релігію
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Пошук релігій..."
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
            <SelectItem value="monotheistic">Монотеїстична</SelectItem>
            <SelectItem value="polytheistic">Політеїстична</SelectItem>
            <SelectItem value="pantheistic">Пантеїстична</SelectItem>
            <SelectItem value="animistic">Анімістична</SelectItem>
            <SelectItem value="ancestor_worship">Культ предків</SelectItem>
            <SelectItem value="nature_worship">Культ природи</SelectItem>
            <SelectItem value="mystery_cult">Містичний культ</SelectItem>
            <SelectItem value="philosophical">Філософська</SelectItem>
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

      {filteredReligions.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-400 mb-4">
              <Church className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Релігії відсутні</h3>
              <p>Створіть першу релігію для вашого світу</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="fantasy-button">
              <Plus className="w-4 h-4 mr-2" />
              Створити релігію
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredReligions.map((item: ReligionEntity) => (
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
                    {item.influence_level && (
                      <Badge 
                        variant="outline" 
                        className={getInfluenceColor(item.influence_level)}
                      >
                        {getInfluenceLabel(item.influence_level)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 mb-4">{item.description.uk}</p>
                
                <div className="mb-3">
                  <span className="text-xs font-semibold text-purple-200">Основні вірування:</span>
                  <p className="text-sm text-gray-300 line-clamp-2">{item.core_beliefs.uk}</p>
                </div>

                {item.followers_count && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-purple-200">Послідовники:</span>
                    <p className="text-sm text-gray-300">{item.followers_count}</p>
                  </div>
                )}

                {item.clergy_structure && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-purple-200">Духовенство:</span>
                    <p className="text-sm text-gray-300">
                      {item.clergy_structure === 'hierarchical' && 'Ієрархічне'}
                      {item.clergy_structure === 'decentralized' && 'Децентралізоване'}
                      {item.clergy_structure === 'none' && 'Відсутнє'}
                      {item.clergy_structure === 'tribal' && 'Племінне'}
                      {item.clergy_structure === 'monastic' && 'Монастирське'}
                    </p>
                  </div>
                )}

                {item.worship_practices.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-purple-200">Практики:</span>
                    <p className="text-sm text-gray-300">{item.worship_practices.slice(0, 2).join(', ')}{item.worship_practices.length > 2 && '...'}</p>
                  </div>
                )}

                {item.holy_symbols.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-purple-200">Символи:</span>
                    <p className="text-sm text-gray-300">{item.holy_symbols.slice(0, 3).join(', ')}{item.holy_symbols.length > 3 && '...'}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingReligion(item);
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

      <CreateReligionModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingReligion(null);
        }}
        onSubmit={editingReligion ? handleEdit : handleCreate}
        initialData={editingReligion || undefined}
        worldId={1}
      />
    </div>
  );
}