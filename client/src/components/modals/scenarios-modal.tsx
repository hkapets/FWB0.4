import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Wand2, Save } from 'lucide-react';

interface ScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingData?: any;
  isGenerating?: boolean;
  onGenerateAI?: () => void;
}

export default function ScenariosModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingData,
  isGenerating = false,
  onGenerateAI
}: ScenariosModalProps) {
  const [formData, setFormData] = useState({
    title: editingData?.title || "",
    content: editingData?.content || "",
    category: editingData?.category || "",
    tags: editingData?.tags?.join(', ') || "",
  });

  React.useEffect(() => {
    if (editingData) {
      setFormData({
        title: editingData.title || "",
        content: editingData.content || "",
        category: editingData.category || "",
        tags: editingData.tags?.join(', ') || "",
      });
    } else {
      setFormData({
        title: "",
        content: "",
        category: "",
        tags: "",
      });
    }
  }, [editingData, isOpen]);

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fantasy-modal max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-fantasy-gold-300 font-fantasy">
            {editingData ? "Редагувати сценарій" : "Створити сценарій"}
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
              {onGenerateAI && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onGenerateAI();
                    // Симуляція генерації
                    setTimeout(() => {
                      const generatedContent = `
Сценарій: ${formData.title || "Нова пригода"}

Передумови:
- Герої опиняються в таємничому лісі
- Місцеві жителі розповідають про зникнення людей
- Слідки ведуть до покинутого храму

Розвиток подій:
1. Зустріч з НПС - старий мудрець розповідає легенду
2. Дослідження храму - виявлення пасток та загадок  
3. Зустріч з антагоністом - темний культист
4. Фінальна битва та розв'язка

Можливі варіанти:
- Мирне вирішення через переговори
- Бойове зіткнення з культистами
- Магічне рішення через старовинний ритуал

Нагороди:
- Досвід: 500 очок
- Артефакт: Амулет захисту
- Золото: 200 монет
                      `;
                      setFormData(prev => ({ ...prev, content: generatedContent }));
                    }, 2000);
                  }}
                  disabled={isGenerating}
                  className="fantasy-button-outline"
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  {isGenerating ? "Генерація..." : "Згенерувати ШІ"}
                </Button>
              )}
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
            onClick={onClose}
            className="fantasy-button-outline"
          >
            Скасувати
          </Button>
          <Button onClick={handleSubmit} className="fantasy-button">
            <Save className="mr-2 h-4 w-4" />
            {editingData ? "Оновити" : "Створити"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}