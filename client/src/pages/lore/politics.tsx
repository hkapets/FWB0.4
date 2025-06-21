import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, List, Grid, Building2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import CreatePoliticsModal from "@/components/modals/create-politics-modal";
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
import { filterData } from "@/lib/filter-utils";
import { createPoliticsBulkActions } from "@/lib/bulk-actions-utils";

// Фільтри для політики
const createPoliticsFilters = () => [
  {
    key: "type",
    label: "Тип",
    type: "select" as const,
    options: [
      { value: "government", label: "Уряд" },
      { value: "faction", label: "Фракція" },
      { value: "nobility", label: "Дворянство" },
      { value: "council", label: "Рада" },
      { value: "guild", label: "Гільдія" },
      { value: "religion", label: "Релігійна організація" },
    ],
  },
  {
    key: "influence",
    label: "Вплив",
    type: "select" as const,
    options: [
      { value: "low", label: "Низький" },
      { value: "medium", label: "Середній" },
      { value: "high", label: "Високий" },
      { value: "supreme", label: "Верховний" },
    ],
  },
];

export default function PoliticsPage({
  currentWorldId,
}: {
  currentWorldId?: number | null;
}) {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editPolitics, setEditPolitics] = useState<any | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const worldId = 1; // TODO: get from context/props

  const { data: politics = [], isLoading } = useQuery({
    queryKey: ["/api/worlds", worldId, "politics"],
    enabled: !!worldId,
  });

  // Фільтрація даних
  const filteredPolitics = useMemo(() => {
    return filterData(politics as any[], activeFilters, [
      "name",
      "description",
    ]);
  }, [politics, activeFilters]);

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(
        ids.map((id) => apiRequest("DELETE", `/api/politics/${id}`))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "politics"],
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

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: number[]; updates: any }) => {
      await Promise.all(
        ids.map((id) => apiRequest("PUT", `/api/politics/${id}`, updates))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "politics"],
      });
      setSelected([]);
      toast({
        title: "Оновлено",
        description: "Властивості політики змінено",
      });
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося оновити властивості",
        variant: "destructive",
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedPolitics: any[]) => {
      await Promise.all(
        reorderedPolitics.map((politicsItem, index) =>
          apiRequest("PUT", `/api/politics/${politicsItem.id}`, {
            ...politicsItem,
            order: index,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "politics"],
      });
      toast({
        title: "Порядок оновлено",
        description: "Список політики переупорядковано",
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

  const handleEdit = (politicsItem: any) => {
    setEditPolitics(politicsItem);
    setIsCreateOpen(true);
  };

  const handleReorder = (reorderedPolitics: any[]) => {
    reorderMutation.mutate(reorderedPolitics);
  };

  const handleFiltersChange = (filters: Record<string, any>) => {
    setActiveFilters(filters);
    setSelected([]);
  };

  const handleBulkAction = (actionKey: string, value?: string) => {
    if (actionKey === "delete") {
      setDeleteDialog(true);
    } else if (actionKey === "changeType" && value) {
      bulkUpdateMutation.mutate({
        ids: selected,
        updates: { type: value },
      });
    } else if (actionKey === "changeInfluence" && value) {
      bulkUpdateMutation.mutate({
        ids: selected,
        updates: { influence: value },
      });
    }
  };

  const handleSubmit = async (data: any) => {
    if (editPolitics) {
      await apiRequest("PUT", `/api/politics/${editPolitics.id}`, data);
      toast({ title: t.actions.edit, description: t.messages.creatureCreated });
    } else {
      await apiRequest("POST", `/api/worlds/${worldId}/politics`, data);
      toast({ title: t.actions.add, description: t.messages.creatureCreated });
    }
    queryClient.invalidateQueries({
      queryKey: ["/api/worlds", worldId, "politics"],
    });
    setIsCreateOpen(false);
    setEditPolitics(null);
  };

  const PoliticsCard = ({ item, isSelected, onSelect }: any) => (
    <div
      className={`fantasy-border p-4 cursor-pointer transition-all duration-200 ${
        isSelected ? "ring-2 ring-yellow-400" : ""
      }`}
      onClick={() => onSelect(item.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {item.type === "government" ? (
            <Building2 className="w-5 h-5 text-red-400" />
          ) : item.type === "nobility" ? (
            <Crown className="w-5 h-5 text-yellow-400" />
          ) : (
            <Building2 className="w-5 h-5 text-blue-400" />
          )}
          <h3 className="font-bold text-lg">
            {typeof item.name === "object" ? item.name.uk : item.name}
          </h3>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(item.id);
          }}
          className="w-4 h-4"
        />
      </div>

      <div className="text-sm text-gray-300 mb-2">
        {item.type === "government" && "Уряд"}
        {item.type === "faction" && "Фракція"}
        {item.type === "nobility" && "Дворянство"}
        {item.type === "council" && "Рада"}
        {item.type === "guild" && "Гільдія"}
        {item.type === "religion" && "Релігійна організація"}
      </div>

      <p className="text-sm text-gray-400 mb-3 line-clamp-3">
        {typeof item.description === "object"
          ? item.description.uk
          : item.description}
      </p>

      {item.influence && (
        <div className="text-xs text-gray-500">Вплив: {item.influence}</div>
      )}

      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(item);
          }}
        >
          Редагувати
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="text-red-400" /> Політика та Управління
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
              setEditPolitics(null);
              setIsCreateOpen(true);
            }}
            className="ml-2"
            size="lg"
          >
            <Plus className="mr-2" /> Додати політичну організацію
          </Button>
          {selected.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialog(true)}
              className="ml-2"
              size="lg"
            >
              <Trash2 className="mr-2" /> Видалити ({selected.length})
            </Button>
          )}
        </div>
      </div>

      <FilterBar
        filters={createPoliticsFilters()}
        onFiltersChange={handleFiltersChange}
        className="mb-6"
      />

      <BulkActions
        selectedCount={selected.length}
        actions={createPoliticsBulkActions()}
        onAction={handleBulkAction}
        className="mb-4"
      />

      {isLoading ? (
        <div className="text-center text-gray-400 py-16">Завантаження...</div>
      ) : (politics as any[]).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <Building2 className="w-16 h-16 text-red-400 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">
            У вас ще немає жодної політичної організації
          </h2>
          <p className="mb-6 text-gray-400">
            Створіть першу політичну структуру світу!
          </p>
          <Button
            size="lg"
            onClick={() => {
              setEditPolitics(null);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="mr-2" /> Додати політичну організацію
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPolitics.map((item) => (
            <PoliticsCard
              key={item.id}
              item={item}
              isSelected={selected.includes(item.id)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      ) : (
        <SortableList items={filteredPolitics} onReorder={handleReorder}>
          {(item: any) => (
            <PoliticsCard
              item={item}
              isSelected={selected.includes(item.id)}
              onSelect={handleSelect}
            />
          )}
        </SortableList>
      )}

      <CreatePoliticsModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditPolitics(null);
        }}
        onSubmit={handleSubmit}
        initialData={editPolitics}
        worldId={worldId}
      />

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Підтвердження видалення</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
