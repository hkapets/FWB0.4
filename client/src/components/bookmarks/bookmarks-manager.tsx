import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bookmark, Plus, Trash, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookmarkItem {
  id: number;
  name: string;
  entityType: string;
  entityId: number;
  createdAt: string;
}

interface BookmarksManagerProps {
  worldId: number;
}

export default function BookmarksManager({ worldId }: BookmarksManagerProps) {
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBookmarkName, setNewBookmarkName] = useState('');

  // Для прикладу - зберігаємо поточну сторінку для швидкого додавання
  const [currentPage, setCurrentPage] = useState<{
    entityType: string;
    entityId: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    loadBookmarks();
  }, [worldId]);

  const loadBookmarks = async () => {
    try {
      const response = await fetch(`/api/bookmarks?worldId=${worldId}`);
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const handleCreateBookmark = async () => {
    if (!currentPage || !newBookmarkName.trim()) return;

    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBookmarkName,
          entityType: currentPage.entityType,
          entityId: currentPage.entityId,
          worldId,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Закладку створено',
          description: `Додано закладку "${newBookmarkName}"`,
        });
        setIsCreateModalOpen(false);
        setNewBookmarkName('');
        loadBookmarks();
      }
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося створити закладку',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBookmark = async (bookmarkId: number) => {
    if (!confirm('Видалити цю закладку?')) return;

    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Закладку видалено',
          description: 'Закладка була успішно видалена',
        });
        loadBookmarks();
      }
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося видалити закладку',
        variant: 'destructive',
      });
    }
  };

  const getEntityTypeLabel = (entityType: string) => {
    const labels: Record<string, string> = {
      character: 'Персонаж',
      location: 'Локація',
      creature: 'Створіння',
      artifact: 'Артефакт',
      event: 'Подія',
      race: 'Раса',
      magicSystem: 'Система магії',
    };
    return labels[entityType] || entityType;
  };

  // Функція для встановлення поточної сторінки (викликається з інших компонентів)
  const setCurrentPageForBookmark = (entityType: string, entityId: number, name: string) => {
    setCurrentPage({ entityType, entityId, name });
  };

  return (
    <div className="space-y-4">
      <Card className="fantasy-border bg-black/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-fantasy-gold-300 flex items-center gap-2">
              <Bookmark className="w-5 h-5" />
              Швидкий доступ
            </CardTitle>
            <Button 
              className="fantasy-button gap-2" 
              onClick={() => setIsCreateModalOpen(true)}
              disabled={!currentPage}
            >
              <Plus className="w-4 h-4" />
              Додати закладку
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {bookmarks.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Немає збережених закладок</p>
              <p className="text-sm">Відвідайте сторінку персонажа або локації і додайте закладку</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-600/30 rounded hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className="w-4 h-4 text-purple-300" />
                    <div>
                      <p className="text-purple-200 font-medium">{bookmark.name}</p>
                      <p className="text-gray-400 text-sm">
                        {getEntityTypeLabel(bookmark.entityType)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-purple-300 hover:text-purple-200"
                      onClick={() => {
                        // Тут буде навігація до закладки
                        // window.location.href = `/${bookmark.entityType}s/${bookmark.entityId}`;
                        toast({
                          title: 'Навігація',
                          description: `Переход до ${bookmark.name}`,
                        });
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Перейти
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBookmark(bookmark.id)}
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

      {/* Модаль створення закладки */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="fantasy-dialog">
          <DialogHeader>
            <DialogTitle className="text-fantasy-gold-300">
              Створити закладку
            </DialogTitle>
          </DialogHeader>
          
          {currentPage && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-900/20 border border-purple-600/30 rounded">
                <p className="text-purple-200 font-medium">{currentPage.name}</p>
                <p className="text-gray-400 text-sm">
                  {getEntityTypeLabel(currentPage.entityType)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Назва закладки
                </label>
                <Input
                  value={newBookmarkName}
                  onChange={(e) => setNewBookmarkName(e.target.value)}
                  placeholder="Введіть назву для закладки"
                  className="fantasy-input"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Скасувати
                </Button>
                <Button 
                  className="fantasy-button" 
                  onClick={handleCreateBookmark}
                  disabled={!newBookmarkName.trim()}
                >
                  Створити
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}