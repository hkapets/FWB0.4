import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, List, Grid, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import CreateGeographyModal from "@/components/modals/create-geography-modal";
import LocationCard from "@/components/cards/location-card";
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
import { filterData, createLocationFilters } from "@/lib/filter-utils";
import type { Location } from "@shared/schema";

export default function GeographyPage() {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const worldId = 1; // TODO: get from context/props

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["/api/worlds", worldId, "locations"],
    enabled: !!worldId,
  });

  // Фільтрація даних
  const filteredLocations = useMemo(() => {
    return filterData(locations as Location[], activeFilters, [
      "name",
      "description",
    ]);
  }, [locations, activeFilters]);

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(
        ids.map((id) => apiRequest("DELETE", `/api/locations/${id}`))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "locations"],
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
    mutationFn: async (reorderedLocations: Location[]) => {
      // Оновлюємо порядок у базі даних
      await Promise.all(
        reorderedLocations.map((location, index) =>
          apiRequest("PUT", `/api/locations/${location.id}`, {
            ...location,
            order: index,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "locations"],
      });
      toast({
        title: "Порядок оновлено",
        description: "Список локацій переупорядковано",
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

  const handleEdit = (location: Location) => {
    setEditLocation(location);
    setIsCreateOpen(true);
  };

  const handleReorder = (reorderedLocations: Location[]) => {
    reorderMutation.mutate(reorderedLocations);
  };

  const handleFiltersChange = (filters: Record<string, any>) => {
    setActiveFilters(filters);
    setSelected([]); // Скидаємо вибір при зміні фільтрів
  };

  const handleSubmit = async (data: any) => {
    if (editLocation) {
      // Update
      await apiRequest("PUT", `/api/locations/${editLocation.id}`, data);
      toast({ title: t.actions.edit, description: t.messages.creatureCreated });
    } else {
      // Create
      await apiRequest("POST", `/api/worlds/${worldId}/locations`, data);
      toast({ title: t.actions.add, description: t.messages.creatureCreated });
    }
    queryClient.invalidateQueries({
      queryKey: ["/api/worlds", worldId, "locations"],
    });
    setIsCreateOpen(false);
    setEditLocation(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MapPin className="text-yellow-300" /> {t.lore.geography}
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
              setEditLocation(null);
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
        filters={createLocationFilters()}
        onFiltersChange={handleFiltersChange}
        className="mb-6"
      />

      {isLoading ? (
        <div className="text-center text-gray-400 py-16">
          {t.actions.loading}...
        </div>
      ) : (locations as Location[]).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <MapPin className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">
            У вас ще немає жодної локації
          </h2>
          <p className="mb-6 text-gray-400">
            Створіть першу локацію, щоб збагатити світ!
          </p>
          <Button
            size="lg"
            onClick={() => {
              setEditLocation(null);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="mr-2" /> {t.messages.addFirstCreature}
          </Button>
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <MapPin className="w-16 h-16 text-gray-400 mb-4" />
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
            items={filteredLocations}
            onReorder={handleReorder}
            strategy={viewMode === "grid" ? "grid" : "vertical"}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                : "flex flex-col gap-2"
            }
          >
            {(location) => (
              <div key={location.id} className="relative group transition-all">
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selected.includes(location.id)}
                    onChange={() => handleSelect(location.id)}
                    className="accent-yellow-400 w-5 h-5 rounded shadow"
                    title="Select"
                  />
                </div>
                <div onClick={() => handleEdit(location)}>
                  <LocationCard
                    location={location}
                    viewMode={viewMode}
                    onEdit={handleEdit}
                    onDelete={() => {
                      setSelected([location.id]);
                      setDeleteDialog(true);
                    }}
                    onView={() => {}}
                  />
                </div>
              </div>
            )}
          </SortableList>
        </ScrollArea>
      )}

      <CreateGeographyModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditLocation(null);
        }}
        onSubmit={handleSubmit}
        initialData={editLocation as any}
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
// TODO: тултіп, polish анімацій, адаптивність, масові дії (зміна типу/координат)
