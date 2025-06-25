import { useTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  BookOpen, 
  Wand2, 
  FileText,
  Eye,
  Save
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Scenario {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  worldId: number;
  createdAt: string;
  updatedAt: string;
}

export default function ScenariosPage() {
  const t = useTranslation();
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
  });

  const worldId = 1; // TODO: отримати з контексту

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const response = await fetch(`/api/worlds/${worldId}/writing`);
      const data = await response.json();
      setScenarios(data.filter((item: any) => item.category === 'scenario'));
    } catch (error) {
      console.error('Error loading scenarios:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingScenario 
        ? `/api/worlds/${worldId}/writing/${editingScenario.id}`
        : `/api/worlds/${worldId}/writing`;
      
      const method = editingScenario ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category: 'scenario',
          tags: formData.tags.split(',').map(tag => tag.trim()),
          worldId,
        }),
      });

      if (response.ok) {
        await loadScenarios();
        setIsCreateModalOpen(false);
        setEditingScenario(null);
        setFormData({ title: "", content: "", category: "", tags: "" });
        toast({
          title: editingScenario ? "Сценарій оновлено" : "Сценарій створено",
          description: "Зміни збережено успішно",
        });
      }
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося зберегти сценарій",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedScenario) return;
    
    try {
      const response = await fetch(`/api/worlds/${worldId}/writing/${selectedScenario.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadScenarios();
        setIsDeleteDialogOpen(false);
        setSelectedScenario(null);
        toast({
          title: "Сценарій видалено",
          description: "Сценарій успішно видалено",
        });
      }
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося видалити сценарій",
        variant: "destructive",
      });
    }
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      // Імітація генерації ШІ (тут буде реальний API для ШІ)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedContent = `Сценарій: ${formData.title || "Нова пригода"}

Передумови:
- Герої опиняються в таємничому лісі
- Місцеві жителі розповідають про зникнення людей
- Слідки ведуть до покинутого храму

Розвиток подій:
1. Зустріч з НПС - старий мудрець розповідає легенду
2. Дослідження храму - виявлення пасток та загадок  
3. Зустріч з антагоністом - темний культист
4. Фінальна битва та розвя'язка

Можливі варіанти:
- Мирне вирішення через переговори
- Бойове зіткнення з культистами
- Магічне рішення через старовинний ритуал

Нагороди:
- Досвід: 500 очок
- Артефакт: Амулет захисту
- Золото: 200 монет`;

      setFormData(prev => ({
        ...prev,
        content: generatedContent
      }));

      toast({
        title: "Сценарій згенеровано",
        description: "ШІ створила базовий сценарій для вас",
      });
    } catch (error) {
      toast({
        title: "Помилка генерації",
        description: "Не вдалося згенерувати сценарій",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const openCreateModal = () => {
    setEditingScenario(null);
    setFormData({ title: "", content: "", category: "", tags: "" });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setFormData({
      title: scenario.title,
      content: scenario.content,
      category: scenario.category,
      tags: scenario.tags.join(', '),
    });
    setIsCreateModalOpen(true);
  };

  const filteredScenarios = scenarios.filter(scenario =>
    scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scenario.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scenario.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-fantasy font-bold text-fantasy-gold-400">
            Сценарії
          </h1>
          <p className="text-gray-400 mt-2">
            Створюйте та управляйте сценаріями для вашого світу
          </p>
        </div>
        <Button onClick={openCreateModal} className="fantasy-button">
          <Plus className="mr-2 h-4 w-4" />
          Створити сценарій
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Пошук сценаріїв..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 fantasy-input"
        />
      </div>

      {/* Scenarios Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredScenarios.map((scenario) => (
          <Card key={scenario.id} className="fantasy-border bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-fantasy text-fantasy-gold-300 line-clamp-2">
                  {scenario.title}
                </CardTitle>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedScenario(scenario);
                      setIsViewModalOpen(true);
                    }}
                    className="h-8 w-8 p-0 hover:bg-purple-700/20"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(scenario)}
                    className="h-8 w-8 p-0 hover:bg-purple-700/20"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedScenario(scenario);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="h-8 w-8 p-0 hover:bg-red-700/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-300 text-sm line-clamp-3 mb-3">
                {scenario.content}
              </p>
              <div className="flex flex-wrap gap-1">
                {scenario.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredScenarios.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <p className="text-gray-400 text-lg">Сценаріїв не знайдено</p>
          <p className="text-gray-500 mb-6">Створіть свій перший сценарій</p>
          <Button onClick={openCreateModal} className="fantasy-button">
            <Plus className="mr-2 h-4 w-4" />
            Створити сценарій
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="fantasy-modal max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-fantasy-gold-300 font-fantasy">
              {editingScenario ? "Редагувати сценарій" : "Створити сценарій"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Назва сценарію
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Введіть назву сценарію..."
                className="fantasy-input"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Категорія
              </label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Пригода, Бойовик, Розслідування..."
                className="fantasy-input"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Теги (через кому)
              </label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="пригода, магія, дракони..."
                className="fantasy-input"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Зміст сценарію
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="fantasy-button-outline"
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  {isGenerating ? "Генерація..." : "Згенерувати ШІ"}
                </Button>
              </div>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Опишіть сценарій, персонажів, події..."
                className="fantasy-input min-h-[300px] resize-y"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="fantasy-button-outline"
            >
              Скасувати
            </Button>
            <Button onClick={handleSubmit} className="fantasy-button">
              <Save className="mr-2 h-4 w-4" />
              {editingScenario ? "Оновити" : "Створити"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="fantasy-modal max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-fantasy-gold-300 font-fantasy">
              {selectedScenario?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedScenario && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedScenario.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-gray-300 font-sans text-sm leading-relaxed">
                  {selectedScenario.content}
                </pre>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewModalOpen(false)}
              className="fantasy-button-outline"
            >
              Закрити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="fantasy-modal">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-fantasy-gold-300">
              Видалити сценарій?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Ця дія незворотна. Сценарій "{selectedScenario?.title}" буде видалено назавжди.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="fantasy-button-outline">
              Скасувати
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="fantasy-button bg-red-600 hover:bg-red-700">
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}