import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, List, Grid, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import CreateHistoryModal from "@/components/modals/create-history-modal";
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
import { createHistoryBulkActions } from "@/lib/bulk-actions-utils";

// Фільтри для історії
const createHistoryFilters = () => [
  {
    key: "type",
    label: "Тип",
    type: "select" as const,
    options: [
      { value: "era", label: "Епоха" },
      { value: "period", label: "Період" },
      { value: "event", label: "Подія" },
      { value: "war", label: "Війна" },
      { value: "dynasty", label: "Династія" },
      { value: "civilization", label: "Цивілізація" },
    ],
  },
  {
    key: "importance",
    label: "Важливість",
    type: "select" as const,
    options: [
      { value: "minor", label: "Незначна" },
      { value: "moderate", label: "Помірна" },
      { value: "major", label: "Велика" },
      { value: "critical", label: "Критична" },
    ],
  },
];

export default function HistoryPage({
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
  const [editHistory, setEditHistory] = useState<any | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const worldId = currentWorldId || 1; // Use currentWorldId if available, fallback to 1

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["/api/worlds", worldId, "history"],
    enabled: !!worldId,
  });

  // Фільтрація даних
  const filteredHistory = useMemo(() => {
    return filterData(history as any[], activeFilters, ["name", "description"]);
  }, [history, activeFilters]);

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(
        ids.map((id) => apiRequest("DELETE", `/api/history/${id}`))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "history"],
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
        ids.map((id) => apiRequest("PUT", `/api/history/${id}`, updates))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "history"],
      });
      setSelected([]);
      toast({
        title: "Оновлено",
        description: "Властивості історії змінено",
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
    mutationFn: async (reorderedHistory: any[]) => {
      await Promise.all(
        reorderedHistory.map((historyItem, index) =>
          apiRequest("PUT", `/api/history/${historyItem.id}`, {
            ...historyItem,
            order: index,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "history"],
      });
      toast({
        title: "Порядок оновлено",
        description: "Список історії переупорядковано",
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

  const handleEdit = (historyItem: any) => {
    setEditHistory(historyItem);
    setIsCreateOpen(true);
  };

  const handleReorder = (reorderedHistory: any[]) => {
    reorderMutation.mutate(reorderedHistory);
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
    } else if (actionKey === "changeImportance" && value) {
      bulkUpdateMutation.mutate({
        ids: selected,
        updates: { importance: value },
      });
    }
  };

  const handleSubmit = async (data: any) => {
    if (editHistory) {
      await apiRequest("PUT", `/api/history/${editHistory.id}`, data);
      toast({ title: t.actions.edit, description: t.messages.creatureCreated });
    } else {
      await apiRequest("POST", `/api/worlds/${worldId}/history`, data);
      toast({ title: t.actions.add, description: t.messages.creatureCreated });
    }
    queryClient.invalidateQueries({
      queryKey: ["/api/worlds", worldId, "history"],
    });
    setIsCreateOpen(false);
    setEditHistory(null);
  };

  const HistoryCard = ({ item, isSelected, onSelect }: any) => (
    <div
      className={`fantasy-border p-4 cursor-pointer transition-all duration-200 ${
        isSelected ? "ring-2 ring-yellow-400" : ""
      }`}
      onClick={() => onSelect(item.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {item.type === "era" ? (
            <Clock className="w-5 h-5 text-purple-400" />
          ) : item.type === "war" ? (
            <BookOpen className="w-5 h-5 text-red-400" />
          ) : (
            <BookOpen className="w-5 h-5 text-blue-400" />
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
        {item.type === "era" && "Епоха"}
        {item.type === "period" && "Період"}
        {item.type === "event" && "Подія"}
        {item.type === "war" && "Війна"}
        {item.type === "dynasty" && "Династія"}
        {item.type === "civilization" && "Цивілізація"}
      </div>

      <p className="text-sm text-gray-400 mb-3 line-clamp-3">
        {typeof item.description === "object"
          ? item.description.uk
          : item.description}
      </p>

      {item.importance && (
        <div className="text-xs text-gray-500">
          Важливість: {item.importance}
        </div>
      )}

      {item.date && (
        <div className="text-xs text-gray-500">Дата: {item.date}</div>
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
          <BookOpen className="text-purple-400" /> Історія та Хронологія
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
              setEditHistory(null);
              setIsCreateOpen(true);
            }}
            className="ml-2"
            size="lg"
          >
            <Plus className="mr-2" /> Додати історичну подію
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
        filters={createHistoryFilters()}
        onFiltersChange={handleFiltersChange}
        className="mb-6"
      />

      <BulkActions
        selectedCount={selected.length}
        actions={createHistoryBulkActions()}
        onAction={handleBulkAction}
        className="mb-4"
      />

      {isLoading ? (
        <div className="text-center text-gray-400 py-16">Завантаження...</div>
      ) : (history as any[]).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <BookOpen className="w-16 h-16 text-purple-400 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">
            У вас ще немає жодної історичної події
          </h2>
          <p className="mb-6 text-gray-400">
            Створіть першу історичну подію світу!
          </p>
          <Button
            size="lg"
            onClick={() => {
              setEditHistory(null);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="mr-2" /> Додати історичну подію
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHistory.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              isSelected={selected.includes(item.id)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      ) : (
        <SortableList items={filteredHistory} onReorder={handleReorder}>
          {(item: any) => (
            <HistoryCard
              item={item}
              isSelected={selected.includes(item.id)}
              onSelect={handleSelect}
            />
          )}
        </SortableList>
      )}

      <CreateHistoryModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditHistory(null);
        }}
        onSubmit={handleSubmit}
        initialData={editHistory}
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
