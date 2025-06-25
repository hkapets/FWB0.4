import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, List, Grid, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import CreateArtifactModal from "@/components/modals/create-artifact-modal";
import { CrossReferences } from "@/components/integration-helpers";
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
import { FilterBar } from "@/components/ui/filter-bar";
import { BulkActions } from "@/components/ui/bulk-actions";
import { filterData, createArtifactFilters } from "@/lib/filter-utils";
import { createArtifactBulkActions } from "@/lib/bulk-actions-utils";
import type { WorldArtifact } from "@shared/schema";

export default function ArtifactsPage() {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editArtifact, setEditArtifact] = useState<WorldArtifact | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const worldId = 1; // TODO: get from context/props

  const { data: artifacts = [], isLoading } = useQuery({
    queryKey: ["/api/worlds", worldId, "artifacts"],
    enabled: !!worldId,
  });

  // Фільтрація даних
  const filteredArtifacts = useMemo(() => {
    return filterData(artifacts as WorldArtifact[], activeFilters, ["name"]);
  }, [artifacts, activeFilters]);

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(
        ids.map((id) => apiRequest("DELETE", `/api/artifacts/${id}`))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "artifacts"],
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
    mutationFn: async (reorderedArtifacts: WorldArtifact[]) => {
      // Оновлюємо порядок у базі даних
      await Promise.all(
        reorderedArtifacts.map((artifact, index) =>
          apiRequest("PUT", `/api/artifacts/${artifact.id}`, {
            ...artifact,
            order: index,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "artifacts"],
      });
      toast({
        title: "Порядок оновлено",
        description: "Список артефактів переупорядковано",
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
        ids.map((id) => apiRequest("PUT", `/api/artifacts/${id}`, updates))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "artifacts"],
      });
      setSelected([]);
      toast({
        title: "Оновлено",
        description: "Вибрані артефакти успішно оновлено",
      });
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося оновити артефакти",
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

  const handleEdit = (artifact: WorldArtifact) => {
    setEditArtifact(artifact);
    setIsCreateOpen(true);
  };

  const handleReorder = (reorderedArtifacts: WorldArtifact[]) => {
    reorderMutation.mutate(reorderedArtifacts);
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
    } else if (actionKey === "changeRarity" && value) {
      bulkUpdateMutation.mutate({
        ids: selected,
        updates: { rarity: value },
      });
    }
  };

  const handleSubmit = async (data: any) => {
    if (editArtifact) {
      // Update
      await apiRequest("PUT", `/api/artifacts/${editArtifact.id}`, data);
      toast({ title: t.actions.edit, description: t.messages.creatureCreated });
    } else {
      // Create
      await apiRequest("POST", `/api/worlds/${worldId}/artifacts`, data);
      toast({ title: t.actions.add, description: t.messages.creatureCreated });
    }
    queryClient.invalidateQueries({
      queryKey: ["/api/worlds", worldId, "artifacts"],
    });
    setIsCreateOpen(false);
    setEditArtifact(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gem className="text-yellow-300" /> {t.lore.artifacts}
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
              setEditArtifact(null);
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

      {/* Фільтри та пошук */}
      <FilterBar
        filters={createArtifactFilters()}
        onFiltersChange={handleFiltersChange}
        className="mb-6"
      />

      {/* Масові дії */}
      <BulkActions
        selectedCount={selected.length}
        actions={createArtifactBulkActions()}
        onAction={handleBulkAction}
        className="mb-4"
      />

      {isLoading ? (
        <div className="text-center text-gray-400 py-16">
          {t.actions.loading}...
        </div>
      ) : (artifacts as WorldArtifact[]).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <Gem className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">
            {t.messages.noResultsFound}
          </h2>
          <p className="mb-6 text-gray-400">{t.messages.noResultsDesc}</p>
          <Button
            size="lg"
            onClick={() => {
              setEditArtifact(null);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="mr-2" /> {t.messages.addFirstCreature}
          </Button>
        </div>
      ) : filteredArtifacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <Gem className="w-16 h-16 text-gray-400 mb-4" />
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
            items={filteredArtifacts}
            onReorder={handleReorder}
            strategy={viewMode === "grid" ? "grid" : "vertical"}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                : "flex flex-col gap-2"
            }
          >
            {(artifact) => (
              <div key={artifact.id} className="relative group transition-all">
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selected.includes(artifact.id)}
                    onChange={() => handleSelect(artifact.id)}
                    className="accent-yellow-400 w-5 h-5 rounded shadow"
                    title="Select"
                  />
                </div>
                <div
                  className="fantasy-border fantasy-card-hover transition-all duration-300 cursor-pointer group bg-black/40 rounded-lg p-4 flex flex-col gap-2"
                  onClick={() => handleEdit(artifact)}
                >
                  <div className="flex items-center gap-2">
                    {artifact.icon && (
                      <span className="text-2xl" title={artifact.icon}>
                        {artifact.icon}
                      </span>
                    )}
                    <span className="font-semibold text-white truncate max-w-[120px] md:max-w-xs">
                      {artifact.name?.uk || artifact.name}
                    </span>
                    {artifact.type && (
                      <span className="ml-2 text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-200">
                        {artifact.type}
                      </span>
                    )}
                  </div>
                  {artifact.description && (
                    <span className="text-gray-400 text-sm max-w-xs truncate">
                      {artifact.description.uk || artifact.description}
                    </span>
                  )}
                </div>
              </div>
            )}
          </SortableList>
        </ScrollArea>
      )}

      <CreateArtifactModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditArtifact(null);
        }}
        onSubmit={handleSubmit}
        initialData={editArtifact as any}
        allArtifacts={(artifacts as WorldArtifact[]).map((a) => ({
          id: a.id,
          name: typeof a.name === "object" ? a.name : { uk: a.name },
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
              {t.actions.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
// TODO: тултіп, polish анімацій, адаптивність, масові дії (зміна типу/рідкісті)
