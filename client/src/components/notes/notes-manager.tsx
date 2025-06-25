import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StickyNote, Plus, Edit, Trash, Lightbulb, CheckSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: number;
  title: string;
  content: string;
  type: 'general' | 'idea' | 'todo';
  entityType?: string;
  entityId?: number;
  createdAt: string;
  updatedAt: string;
}

interface NotesManagerProps {
  worldId: number;
  entityType?: string;
  entityId?: number;
}

export default function NotesManager({ worldId, entityType, entityId }: NotesManagerProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [filter, setFilter] = useState<'all' | 'general' | 'idea' | 'todo'>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general' as const,
  });

  useEffect(() => {
    loadNotes();
  }, [worldId, entityType, entityId]);

  const loadNotes = async () => {
    try {
      let url = `/api/notes?worldId=${worldId}`;
      if (entityType && entityId) {
        url += `&entityType=${entityType}&entityId=${entityId}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleSave = async () => {
    try {
      const noteData = {
        ...formData,
        worldId,
        entityType,
        entityId,
      };

      let response;
      if (editingNote) {
        response = await fetch(`/api/notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData),
        });
      } else {
        response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData),
        });
      }

      if (response.ok) {
        toast({
          title: editingNote ? 'Нотатку оновлено' : 'Нотатку створено',
          description: 'Зміни збережено успішно',
        });
        handleCloseModal();
        loadNotes();
      }
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося зберегти нотатку',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (noteId: number) => {
    if (!confirm('Видалити цю нотатку?')) return;
    
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Нотатку видалено',
          description: 'Нотатка була успішно видалена',
        });
        loadNotes();
      }
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити нотатку',
        variant: 'destructive',
      });
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingNote(null);
    setFormData({ title: '', content: '', type: 'general' });
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      type: note.type,
    });
    setIsCreateModalOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'idea': return Lightbulb;
      case 'todo': return CheckSquare;
      default: return StickyNote;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'idea': return 'bg-yellow-900/20 text-yellow-200 border-yellow-600/30';
      case 'todo': return 'bg-blue-900/20 text-blue-200 border-blue-600/30';
      default: return 'bg-purple-900/20 text-purple-200 border-purple-600/30';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'idea': return 'Ідея';
      case 'todo': return 'Завдання';
      default: return 'Загальна';
    }
  };

  const filteredNotes = filter === 'all' 
    ? notes 
    : notes.filter(note => note.type === filter);

  return (
    <div className="space-y-4">
      <Card className="fantasy-border bg-black/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
              <StickyNote className="w-5 h-5" />
              Нотатки та ідеї
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі</SelectItem>
                  <SelectItem value="general">Загальні</SelectItem>
                  <SelectItem value="idea">Ідеї</SelectItem>
                  <SelectItem value="todo">Завдання</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                className="fantasy-button gap-2" 
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Додати
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotes.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <StickyNote className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Немає нотаток для відображення</p>
              <p className="text-sm">Створіть першу нотатку, щоб зберігати ідеї та завдання</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => {
                const TypeIcon = getTypeIcon(note.type);
                return (
                  <Card key={note.id} className="fantasy-border bg-gray-800/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="w-4 h-4 text-purple-300" />
                          <Badge 
                            variant="outline" 
                            className={getTypeColor(note.type)}
                          >
                            {getTypeLabel(note.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(note)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(note.id)}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          >
                            <Trash className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="text-purple-200 font-medium line-clamp-2">
                        {note.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-300 text-sm line-clamp-3 mb-2">
                        {note.content}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(note.createdAt).toLocaleDateString('uk-UA')}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модаль створення/редагування */}
      <Dialog open={isCreateModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="fantasy-dialog">
          <DialogHeader>
            <DialogTitle className="text-fantasy-gold-300">
              {editingNote ? 'Редагувати нотатку' : 'Створити нотатку'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Тип
              </label>
              <Select 
                value={formData.type} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="fantasy-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Загальна нотатка</SelectItem>
                  <SelectItem value="idea">Ідея</SelectItem>
                  <SelectItem value="todo">Завдання</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Заголовок
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Введіть заголовок нотатки"
                className="fantasy-input"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Зміст
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Опишіть вашу ідею або завдання"
                className="fantasy-input min-h-24"
                rows={6}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCloseModal}>
                Скасувати
              </Button>
              <Button 
                className="fantasy-button" 
                onClick={handleSave}
                disabled={!formData.title.trim() || !formData.content.trim()}
              >
                {editingNote ? 'Оновити' : 'Створити'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}