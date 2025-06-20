import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, List, Grid, Cross } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import CreateReligionModal from "@/components/modals/create-religion-modal";
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
import { filterData } from "@/lib/filter-utils";
import type { WorldLore } from "@shared/schema";

// Фільтри для релігії
const createReligionFilters = () => [
  {
    key: "type",
    label: "Тип",
    type: "select" as const,
    options: [
      { value: "monotheistic", label: "Монотеїстична" },
      { value: "polytheistic", label: "Політеїстична" },
      { value: "pantheistic", label: "Пантеїстична" },
      { value: "animistic", label: "Анімістична" },
      { value: "shamanistic", label: "Шаманська" },
    ],
  },
  {
    key: "alignment",
    label: "Напрямок",
    type: "select" as const,
    options: [
      { value: "good", label: "Добрий" },
      { value: "neutral", label: "Нейтральний" },
      { value: "evil", label: "Злий" },
      { value: "chaotic", label: "Хаотичний" },
      { value: "lawful", label: "Законний" },
    ],
  },
];

export default function ReligionPage() {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editReligion, setEditReligion] = useState<WorldLore | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const worldId = 1; // TODO: get from context/props

  const { data: allLore = [], isLoading } = useQuery({
    queryKey: ["/api/worlds", worldId, "lore"],
    enabled: !!worldId,
  });

  // Фільтруємо тільки релігії
  const religions = (allLore as WorldLore[]).filter(
    (lore) => lore.type === "religion"
  );

  // Фільтрація даних
  const filteredReligions = useMemo(() => {
    return filterData(religions as WorldLore[], activeFilters, [
      "name",
      "description",
    ]);
  }, [religions, activeFilters]);

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(
        ids.map((id) => apiRequest("DELETE", `/api/lore/${id}`))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "lore"],
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
    mutationFn: async (reorderedReligions: WorldLore[]) => {
      // Оновлюємо порядок у базі даних
      await Promise.all(
        reorderedReligions.map((religion, index) =>
          apiRequest("PUT", `/api/lore/${religion.id}`, {
            ...religion,
            order: index,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "lore"],
      });
      toast({
        title: "Порядок оновлено",
        description: "Список релігій переупорядковано",
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

  const handleEdit = (religion: WorldLore) => {
    setEditReligion(religion);
    setIsCreateOpen(true);
  };

  const handleReorder = (reorderedReligions: WorldLore[]) => {
    reorderMutation.mutate(reorderedReligions);
  };

  const handleFiltersChange = (filters: Record<string, any>) => {
    setActiveFilters(filters);
    setSelected([]); // Скидаємо вибір при зміні фільтрів
  };

  const handleSubmit = async (data: any) => {
    if (editReligion) {
      // Update
      await apiRequest("PUT", `/api/lore/${editReligion.id}`, {
        ...data,
        type: "religion",
      });
      toast({ title: t.actions.edit, description: t.messages.creatureCreated });
    } else {
      // Create
      await apiRequest("POST", `/api/worlds/${worldId}/lore`, {
        ...data,
        type: "religion",
      });
      toast({ title: t.actions.add, description: t.messages.creatureCreated });
    }
    queryClient.invalidateQueries({
      queryKey: ["/api/worlds", worldId, "lore"],
    });
    setIsCreateOpen(false);
    setEditReligion(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Cross className="text-yellow-300" /> Релігії
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
              setEditReligion(null);
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
        filters={createReligionFilters()}
        onFiltersChange={handleFiltersChange}
        className="mb-6"
      />

      {isLoading ? (
        <div className="text-center text-gray-400 py-16">
          {t.actions.loading}...
        </div>
      ) : (religions as WorldLore[]).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <Cross className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">
            У вас ще немає жодної релігії
          </h2>
          <p className="mb-6 text-gray-400">
            Створіть першу релігію, щоб збагатити світ!
          </p>
          <Button
            size="lg"
            onClick={() => {
              setEditReligion(null);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="mr-2" /> {t.messages.addFirstCreature}
          </Button>
        </div>
      ) : filteredReligions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <Cross className="w-16 h-16 text-gray-400 mb-4" />
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
            items={filteredReligions}
            onReorder={handleReorder}
            strategy={viewMode === "grid" ? "grid" : "vertical"}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                : "flex flex-col gap-2"
            }
          >
            {(religion) => (
              <div key={religion.id} className="relative group transition-all">
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selected.includes(religion.id)}
                    onChange={() => handleSelect(religion.id)}
                    className="accent-yellow-400 w-5 h-5 rounded shadow"
                    title="Select"
                  />
                </div>
                <div
                  className="fantasy-border fantasy-card-hover transition-all duration-300 cursor-pointer group bg-black/40 rounded-lg p-4 flex flex-col gap-2"
                  onClick={() => handleEdit(religion)}
                >
                  <div className="flex items-center gap-2">
                    {religion.icon && (
                      <span className="text-2xl" title={religion.icon}>
                        {religion.icon}
                      </span>
                    )}
                    <span className="font-semibold text-white truncate max-w-[120px] md:max-w-xs">
                      {religion.name}
                    </span>
                    {religion.type && (
                      <span className="ml-2 text-xs px-2 py-1 rounded bg-blue-900 text-blue-200">
                        {religion.type}
                      </span>
                    )}
                  </div>
                  {religion.description && (
                    <span className="text-gray-400 text-sm max-w-xs truncate">
                      {religion.description}
                    </span>
                  )}
                  {religion.alignment && (
                    <span className="text-gray-500 text-xs">
                      Напрямок: {religion.alignment}
                    </span>
                  )}
                </div>
              </div>
            )}
          </SortableList>
        </ScrollArea>
      )}

      <CreateReligionModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditReligion(null);
        }}
        onSubmit={handleSubmit}
        initialData={editReligion as any}
        allReligions={religions.map((r) => ({
          id: r.id,
          name: typeof r.name === "object" ? r.name : { uk: r.name },
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
// TODO: тултіп, polish анімацій, адаптивність, масові дії (зміна типу/напрямку)
