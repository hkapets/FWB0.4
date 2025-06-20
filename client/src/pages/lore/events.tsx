import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, List, Grid, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import CreateEventModal from "@/components/modals/create-event-modal";
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
import { filterData, createEventFilters } from "@/lib/filter-utils";
import type { Event } from "@shared/schema";

export default function EventsPage() {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const worldId = 1; // TODO: get from context/props

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/worlds", worldId, "events"],
    enabled: !!worldId,
  });

  // Фільтрація даних
  const filteredEvents = useMemo(() => {
    return filterData(events as Event[], activeFilters, [
      "name",
      "description",
    ]);
  }, [events, activeFilters]);

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(
        ids.map((id) => apiRequest("DELETE", `/api/events/${id}`))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "events"],
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
    mutationFn: async (reorderedEvents: Event[]) => {
      // Оновлюємо порядок у базі даних
      await Promise.all(
        reorderedEvents.map((event, index) =>
          apiRequest("PUT", `/api/events/${event.id}`, {
            ...event,
            order: index,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "events"],
      });
      toast({
        title: "Порядок оновлено",
        description: "Список подій переупорядковано",
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

  const handleEdit = (event: Event) => {
    setEditEvent(event);
    setIsCreateOpen(true);
  };

  const handleReorder = (reorderedEvents: Event[]) => {
    reorderMutation.mutate(reorderedEvents);
  };

  const handleFiltersChange = (filters: Record<string, any>) => {
    setActiveFilters(filters);
    setSelected([]); // Скидаємо вибір при зміні фільтрів
  };

  const handleSubmit = async (data: any) => {
    if (editEvent) {
      // Update
      await apiRequest("PUT", `/api/events/${editEvent.id}`, data);
      toast({ title: t.actions.edit, description: t.messages.creatureCreated });
    } else {
      // Create
      await apiRequest("POST", `/api/worlds/${worldId}/events`, data);
      toast({ title: t.actions.add, description: t.messages.creatureCreated });
    }
    queryClient.invalidateQueries({
      queryKey: ["/api/worlds", worldId, "events"],
    });
    setIsCreateOpen(false);
    setEditEvent(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="text-yellow-300" /> {t.lore.events}
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
              setEditEvent(null);
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
        filters={createEventFilters()}
        onFiltersChange={handleFiltersChange}
        className="mb-6"
      />

      {isLoading ? (
        <div className="text-center text-gray-400 py-16">
          {t.actions.loading}...
        </div>
      ) : (events as Event[]).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <Calendar className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2">
            У вас ще немає жодної події
          </h2>
          <p className="mb-6 text-gray-400">
            Створіть першу подію, щоб оживити історію світу!
          </p>
          <Button
            size="lg"
            onClick={() => {
              setEditEvent(null);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="mr-2" /> {t.messages.addFirstCreature}
          </Button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <Calendar className="w-16 h-16 text-gray-400 mb-4" />
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
            items={filteredEvents}
            onReorder={handleReorder}
            strategy={viewMode === "grid" ? "grid" : "vertical"}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                : "flex flex-col gap-2"
            }
          >
            {(event) => (
              <div key={event.id} className="relative group transition-all">
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selected.includes(event.id)}
                    onChange={() => handleSelect(event.id)}
                    className="accent-yellow-400 w-5 h-5 rounded shadow"
                    title="Select"
                  />
                </div>
                <div
                  className="fantasy-border fantasy-card-hover transition-all duration-300 cursor-pointer group bg-black/40 rounded-lg p-4 flex flex-col gap-2"
                  onClick={() => handleEdit(event)}
                >
                  <div className="flex items-center gap-2">
                    {event.icon && (
                      <span className="text-2xl" title={event.icon}>
                        {event.icon}
                      </span>
                    )}
                    <span className="font-semibold text-white truncate max-w-[120px] md:max-w-xs">
                      {event.name}
                    </span>
                    {event.date && (
                      <span className="ml-2 text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-200">
                        {event.date}
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <span className="text-gray-400 text-sm max-w-xs truncate">
                      {event.description}
                    </span>
                  )}
                </div>
              </div>
            )}
          </SortableList>
        </ScrollArea>
      )}

      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditEvent(null);
        }}
        onSubmit={handleSubmit}
        initialData={editEvent as any}
        allEvents={(events as Event[]).map((e) => ({
          id: e.id,
          name: typeof e.name === "object" ? e.name : { uk: e.name },
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
// TODO: тултіп, polish анімацій, адаптивність, масові дії (зміна типу/дати)
