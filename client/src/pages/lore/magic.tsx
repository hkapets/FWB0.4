import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, List, Grid, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import CreateMagicModal from "@/components/modals/create-magic-modal";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SortableList } from "@/components/ui/sortable-list";

export default function MagicPage() {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editMagic, setEditMagic] = useState<any | null>(null);
  const worldId = 1; // TODO: get from context/props

  const { data: magic = [], isLoading } = useQuery({
    queryKey: ["/api/worlds", worldId, "magic"],
    enabled: !!worldId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(
        ids.map((id) => apiRequest("DELETE", `/api/magic/${id}`))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "magic"],
      });
      setSelected([]);
      toast({
        title: t.actions.delete,
        description: t.messages.creatureCreated,
      });
    },
    onError: () => {
      toast({
        title: t.actions.delete,
        description: t.messages.errorDesc,
        variant: "destructive",
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedMagic: any[]) => {
      // Оновлюємо порядок у базі даних
      await Promise.all(
        reorderedMagic.map((magicItem, index) =>
          apiRequest("PUT", `/api/magic/${magicItem.id}`, {
            ...magicItem,
            order: index,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "magic"],
      });
      toast({
        title: "Порядок оновлено",
        description: "Список магії переупорядковано",
      });
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося оновити порядок",
        variant: "destructive",
      });
    },
  });

  const handleSelect = (id: number) => {
    setSelected((sel) =>
      sel.includes(id) ? sel.filter((i) => i !== id) : [...sel, id]
    );
  };

  const handleDelete = () => {
    setDeleteDialog(false);
    if (selected.length) deleteMutation.mutate(selected);
  };

  const handleEdit = (magic: any) => {
    setEditMagic(magic);
    setIsCreateOpen(true);
  };

  const handleReorder = (reorderedMagic: any[]) => {
    reorderMutation.mutate(reorderedMagic);
  };

  const handleSubmit = async (data: any) => {
    if (editMagic) {
      // Update
      await apiRequest("PUT", `/api/magic/${editMagic.id}`, data);
      toast({ title: t.actions.edit, description: t.messages.creatureCreated });
    } else {
      // Create
      await apiRequest("POST", `/api/worlds/${worldId}/magic`, data);
      toast({ title: t.actions.add, description: t.messages.creatureCreated });
    }
    queryClient.invalidateQueries({
      queryKey: ["/api/worlds", worldId, "magic"],
    });
    setIsCreateOpen(false);
    setEditMagic(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="text-yellow-300" /> {t.lore.magic}
        </h1>
        <div className="flex gap-2 items-center">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List />
          </Button>
          <Button
            onClick={() => {
              setEditMagic(null);
              setIsCreateOpen(true);
            }}
            className="ml-2"
            size="lg"
          >
            <Plus className="mr-2" /> {t.messages.addFirstCreature}
          </Button>
          {selected.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialog(true)}
              className="ml-2"
              size="lg"
            >
              <Trash2 className="mr-2" /> {t.actions.delete} ({selected.length})
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-16">
          {t.actions.loading}...
        </div>
      ) : (magic as any[]).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <Sparkles className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">
            У вас ще немає жодної магії
          </h2>
          <p className="mb-6 text-gray-400">
            Створіть першу магію, щоб оживити світ!
          </p>
          <Button
            size="lg"
            onClick={() => {
              setEditMagic(null);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="mr-2" /> {t.messages.addFirstCreature}
          </Button>
        </div>
      ) : (
        <ScrollArea className="max-h-[70vh]">
          <SortableList
            items={magic as any[]}
            onReorder={handleReorder}
            strategy={viewMode === "grid" ? "grid" : "vertical"}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                : "flex flex-col gap-2"
            }
          >
            {(magicItem) => (
              <div key={magicItem.id} className="relative group transition-all">
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selected.includes(magicItem.id)}
                    onChange={() => handleSelect(magicItem.id)}
                    className="accent-yellow-400 w-5 h-5 rounded shadow"
                    title="Select"
                  />
                </div>
                <div
                  className="fantasy-border fantasy-card-hover transition-all duration-300 cursor-pointer group bg-black/40 rounded-lg p-4 flex flex-col gap-2"
                  onClick={() => handleEdit(magicItem)}
                >
                  <div className="flex items-center gap-2">
                    {magicItem.icon && (
                      <span className="text-2xl" title={magicItem.icon}>
                        {magicItem.icon}
                      </span>
                    )}
                    <span className="font-semibold text-white truncate max-w-[120px] md:max-w-xs">
                      {magicItem.name}
                    </span>
                    {magicItem.type && (
                      <span className="ml-2 text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-200">
                        {magicItem.type}
                      </span>
                    )}
                  </div>
                  {magicItem.description && (
                    <span className="text-gray-400 text-sm max-w-xs truncate">
                      {magicItem.description}
                    </span>
                  )}
                </div>
              </div>
            )}
          </SortableList>
        </ScrollArea>
      )}

      <CreateMagicModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditMagic(null);
        }}
        onSubmit={handleSubmit}
        worldId={worldId}
      />

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.actions.delete}</AlertDialogTitle>
          </AlertDialogHeader>
          <p>{t.messages.errorDesc}</p>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.forms.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {t.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
// TODO: фільтри, тултіп, polish анімацій, адаптивність, масові дії (зміна типу/школи)
