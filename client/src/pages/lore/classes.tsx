import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, List, Grid, Sword, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import CreateClassModal from "@/components/modals/create-class-modal";
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
import { createClassBulkActions } from "@/lib/bulk-actions-utils";

// Фільтри для класів
const createClassFilters = () => [
  {
    key: "type",
    label: "Тип",
    type: "select" as const,
    options: [
      { value: "warrior", label: "Воїн" },
      { value: "mage", label: "Маг" },
      { value: "rogue", label: "Розбійник" },
      { value: "priest", label: "Жрець" },
      { value: "ranger", label: "Рейнджер" },
      { value: "paladin", label: "Паладін" },
    ],
  },
  {
    key: "difficulty",
    label: "Складність",
    type: "select" as const,
    options: [
      { value: "easy", label: "Легка" },
      { value: "medium", label: "Середня" },
      { value: "hard", label: "Важка" },
      { value: "expert", label: "Експертна" },
    ],
  },
];

export default function ClassesPage() {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editClass, setEditClass] = useState<any | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const worldId = 1; // TODO: get from context/props

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["/api/worlds", worldId, "classes"],
    enabled: !!worldId,
  });

  // Фільтрація даних
  const filteredClasses = useMemo(() => {
    return filterData(classes as any[], activeFilters, ["name", "description"]);
  }, [classes, activeFilters]);

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(
        ids.map((id) => apiRequest("DELETE", `/api/classes/${id}`))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "classes"],
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
        ids.map((id) => apiRequest("PUT", `/api/classes/${id}`, updates))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "classes"],
      });
      setSelected([]);
      toast({
        title: "Оновлено",
        description: "Властивості класів змінено",
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
    mutationFn: async (reorderedClasses: any[]) => {
      await Promise.all(
        reorderedClasses.map((classItem, index) =>
          apiRequest("PUT", `/api/classes/${classItem.id}`, {
            ...classItem,
            order: index,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "classes"],
      });
      toast({
        title: "Порядок оновлено",
        description: "Список класів переупорядковано",
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

  const handleEdit = (classItem: any) => {
    setEditClass(classItem);
    setIsCreateOpen(true);
  };

  const handleReorder = (reorderedClasses: any[]) => {
    reorderMutation.mutate(reorderedClasses);
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
    } else if (actionKey === "changeDifficulty" && value) {
      bulkUpdateMutation.mutate({
        ids: selected,
        updates: { difficulty: value },
      });
    }
  };

  const handleSubmit = async (data: any) => {
    if (editClass) {
      await apiRequest("PUT", `/api/classes/${editClass.id}`, data);
      toast({ title: t.actions.edit, description: t.messages.creatureCreated });
    } else {
      await apiRequest("POST", `/api/worlds/${worldId}/classes`, data);
      toast({ title: t.actions.add, description: t.messages.creatureCreated });
    }
    queryClient.invalidateQueries({
      queryKey: ["/api/worlds", worldId, "classes"],
    });
    setIsCreateOpen(false);
    setEditClass(null);
  };

  const ClassCard = ({ item, isSelected, onSelect }: any) => (
    <div
      className={`fantasy-border p-4 cursor-pointer transition-all duration-200 ${
        isSelected ? "ring-2 ring-yellow-400" : ""
      }`}
      onClick={() => onSelect(item.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {item.type === "warrior" ? (
            <Sword className="w-5 h-5 text-red-400" />
          ) : item.type === "mage" ? (
            <Shield className="w-5 h-5 text-blue-400" />
          ) : (
            <Sword className="w-5 h-5 text-green-400" />
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
        {item.type === "warrior" && "Воїн"}
        {item.type === "mage" && "Маг"}
        {item.type === "rogue" && "Розбійник"}
        {item.type === "priest" && "Жрець"}
        {item.type === "ranger" && "Рейнджер"}
        {item.type === "paladin" && "Паладін"}
      </div>

      <p className="text-sm text-gray-400 mb-3 line-clamp-3">
        {typeof item.description === "object"
          ? item.description.uk
          : item.description}
      </p>

      {item.difficulty && (
        <div className="text-xs text-gray-500 mb-1">
          Складність: {item.difficulty}
        </div>
      )}

      {item.abilities && (
        <div className="text-xs text-gray-500">Здібності: {item.abilities}</div>
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
          <Sword className="text-red-400" /> Класи та Професії
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
              setEditClass(null);
              setIsCreateOpen(true);
            }}
            className="ml-2"
            size="lg"
          >
            <Plus className="mr-2" /> Додати клас
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
        filters={createClassFilters()}
        onFiltersChange={handleFiltersChange}
        className="mb-6"
      />

      <BulkActions
        selectedCount={selected.length}
        actions={createClassBulkActions()}
        onAction={handleBulkAction}
        className="mb-4"
      />

      {isLoading ? (
        <div className="text-center text-gray-400 py-16">Завантаження...</div>
      ) : (classes as any[]).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <Sword className="w-16 h-16 text-red-400 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">
            У вас ще немає жодного класу
          </h2>
          <p className="mb-6 text-gray-400">Створіть перший клас світу!</p>
          <Button
            size="lg"
            onClick={() => {
              setEditClass(null);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="mr-2" /> Додати клас
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClasses.map((item) => (
            <ClassCard
              key={item.id}
              item={item}
              isSelected={selected.includes(item.id)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      ) : (
        <SortableList items={filteredClasses} onReorder={handleReorder}>
          {(item: any) => (
            <ClassCard
              item={item}
              isSelected={selected.includes(item.id)}
              onSelect={handleSelect}
            />
          )}
        </SortableList>
      )}

      <CreateClassModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditClass(null);
        }}
        onSubmit={handleSubmit}
        initialData={editClass}
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
