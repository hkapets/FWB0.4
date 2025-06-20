import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, List, Grid, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import CreatureCard from "@/components/cards/creature-card";
import CreateCreatureModal from "@/components/modals/create-creature-modal";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SortableList } from "@/components/ui/sortable-list";
import { FilterBar } from "@/components/ui/filter-bar";
import { BulkActions } from "@/components/ui/bulk-actions";
import { CardSkeleton, ListItemSkeleton } from "@/components/ui/skeleton";
import { filterData, createCreatureFilters } from "@/lib/filter-utils";
import { createBestiaryBulkActions } from "@/lib/bulk-actions-utils";
import type { Creature } from "@shared/schema";

export default function BestiaryPage() {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // TODO: отримати worldId з контексту/props/роуту
  const worldId = 1;

  const { data: creatures = [], isLoading } = useQuery({
    queryKey: ["/api/worlds", worldId, "creatures"],
    enabled: !!worldId,
  });

  // Фільтрація даних
  const filteredCreatures = useMemo(() => {
    return filterData(creatures as Creature[], activeFilters, [
      "name",
      "description",
    ]);
  }, [creatures, activeFilters]);

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(
        ids.map((id) => apiRequest("DELETE", `/api/creatures/${id}`))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "creatures"],
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
    mutationFn: async (reorderedCreatures: Creature[]) => {
      // Оновлюємо порядок у базі даних
      await Promise.all(
        reorderedCreatures.map((creature, index) =>
          apiRequest("PUT", `/api/creatures/${creature.id}`, {
            ...creature,
            order: index,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "creatures"],
      });
      toast({
        title: "Порядок оновлено",
        description: "Список істот переупорядковано",
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

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: number[]; updates: any }) => {
      await Promise.all(
        ids.map((id) => apiRequest("PUT", `/api/creatures/${id}`, updates))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "creatures"],
      });
      setSelected([]);
      toast({
        title: "Оновлено",
        description: "Вибрані істоти успішно оновлено",
      });
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося оновити істоти",
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

  const handleReorder = (reorderedCreatures: Creature[]) => {
    reorderMutation.mutate(reorderedCreatures);
  };

  const handleFiltersChange = (filters: Record<string, any>) => {
    setActiveFilters(filters);
    setSelected([]); // Скидаємо вибір при зміні фільтрів
  };

  const handleBulkAction = (actionKey: string, value?: string) => {
    if (actionKey === "delete") {
      setDeleteDialog(true);
    } else if (actionKey === "changeType" && value) {
      bulkUpdateMutation.mutate({
        ids: selected,
        updates: { type: value },
      });
    } else if (actionKey === "changeDangerLevel" && value) {
      bulkUpdateMutation.mutate({
        ids: selected,
        updates: { dangerLevel: value },
      });
    }
  };

  // Loading skeleton
  const LoadingSkeleton = () => {
    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <ListItemSkeleton key={index} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Crown className="text-yellow-300" /> {t.lore.bestiary}
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
            onClick={() => setIsCreateOpen(true)}
            className="ml-2"
            size="lg"
          >
            <Plus className="mr-2" /> {t.messages.addFirstCreature}
          </Button>
        </div>
      </div>

      {/* Фільтри та пошук */}
      <FilterBar
        filters={createCreatureFilters()}
        onFiltersChange={handleFiltersChange}
        className="mb-6"
      />

      {/* Масові дії */}
      <BulkActions
        selectedCount={selected.length}
        actions={createBestiaryBulkActions()}
        onAction={handleBulkAction}
        className="mb-4"
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="text-center text-gray-400 py-4">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
              <span>{t.actions.loading} істоти...</span>
            </div>
          </div>
          <LoadingSkeleton />
        </div>
      ) : (creatures as Creature[]).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <Crown className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">
            {t.messages.noCreaturesYet}
          </h2>
          <p className="mb-6 text-gray-400">{t.messages.noCreaturesDesc}</p>
          <Button size="lg" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2" /> {t.messages.addFirstCreature}
          </Button>
        </div>
      ) : filteredCreatures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <Crown className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Немає результатів</h2>
          <p className="mb-6 text-gray-400">
            Спробуйте змінити фільтри або пошуковий запит
          </p>
          <Button variant="outline" onClick={() => handleFiltersChange({})}>
            Очистити фільтри
          </Button>
        </div>
      ) : (
        <ScrollArea className="max-h-[70vh]">
          <SortableList
            items={filteredCreatures}
            onReorder={handleReorder}
            strategy={viewMode === "grid" ? "grid" : "vertical"}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                : "flex flex-col gap-2"
            }
          >
            {(creature) => (
              <div key={creature.id} className="relative group transition-all">
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selected.includes(creature.id)}
                    onChange={() => handleSelect(creature.id)}
                    className="accent-yellow-400 w-5 h-5 rounded shadow"
                    title="Select"
                  />
                </div>
                <CreatureCard
                  creature={creature}
                  viewMode={viewMode}
                  onEdit={() => setIsCreateOpen(true)}
                  onDelete={() => {
                    setSelected([creature.id]);
                    setDeleteDialog(true);
                  }}
                  onView={() => {}}
                />
              </div>
            )}
          </SortableList>
        </ScrollArea>
      )}

      <CreateCreatureModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        worldId={worldId}
        allCreatures={(creatures as Creature[]).map((c) => ({
          id: c.id,
          name: typeof c.name === "object" ? c.name : { uk: c.name },
        }))}
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
              {deleteMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Видалення...</span>
                </div>
              ) : (
                t.actions.delete
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
// TODO: тултіп, polish анімацій, адаптивність
