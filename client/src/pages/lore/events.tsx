import { useTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CreateEventModal from "@/components/modals/create-event-modal";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export default function EventsPage() {
  const t = useTranslation();
  const [events, setEvents] = useState<any[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const worldId = 1; // TODO: get from context or props

  useEffect(() => {
    fetch(`/api/worlds/${worldId}/events`)
      .then((res) => res.json())
      .then(setEvents);
  }, [worldId]);

  const handleAdd = () => {
    setEditEvent(null);
    setModalOpen(true);
  };
  const handleEdit = (event: any) => {
    setEditEvent(event);
    setModalOpen(true);
  };
  const handleDelete = (event: any) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!eventToDelete || !events) return;
    await fetch(`/api/events/${eventToDelete.id}`, { method: "DELETE" });
    setEvents(events.filter((e) => e.id !== eventToDelete.id));
    toast({
      title: t.actions.delete,
      description: `${eventToDelete.name?.uk || ""} видалено.`,
    });
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };
  const handleSubmit = async (data: any) => {
    if (editEvent) {
      // Update
      const res = await fetch(`/api/events/${editEvent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setEvents(events!.map((e) => (e.id === updated.id ? updated : e)));
      toast({
        title: t.actions.edit,
        description: `${updated.name?.uk} оновлено.`,
      });
    } else {
      // Create
      const res = await fetch(`/api/worlds/${worldId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const created = await res.json();
      setEvents([...(events || []), created]);
      toast({
        title: t.actions.add,
        description: `${created.name?.uk} створено.`,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4 flex items-center justify-between">
        {t.lore.events}
        <Button onClick={handleAdd}>{t.actions.add}</Button>
      </h1>
      <div className="fantasy-border rounded-lg p-4 text-gray-300 bg-black/30 min-h-[120px] overflow-x-auto">
        {events === null ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded" />
                <div className="h-4 w-32 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 animate-fadein">
            <img
              src="/empty-worlds.svg"
              alt="Порожньо"
              className="w-28 h-28 mb-4 opacity-70"
            />
            <div className="text-lg mb-2">У вас ще немає жодної події</div>
            <div className="mb-4 text-sm text-gray-500">
              Створіть першу подію, щоб оживити історію світу!
            </div>
            <Button onClick={handleAdd} size="lg" className="mt-2">
              Додати подію
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between bg-black/40 rounded px-3 py-2 transition-all duration-300 animate-fadein"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.name?.uk + " image"}
                      className="w-10 h-10 object-cover rounded border border-yellow-400 cursor-pointer shadow-md hover:scale-105 transition"
                      onClick={() => setImagePreview(event.image)}
                    />
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-2xl cursor-help" title={event.icon}>
                        {event.icon}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Іконка події</TooltipContent>
                  </Tooltip>
                  <span className="font-semibold text-white truncate max-w-[120px] md:max-w-xs">
                    {event.name?.uk}
                  </span>
                  {event.date && (
                    <span className="ml-2 text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-200">
                      {event.date}
                    </span>
                  )}
                  {event.description && (
                    <span className="text-gray-400 text-sm max-w-xs truncate">
                      {event.description.uk}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(event)}
                  >
                    {t.actions.edit}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(event)}
                  >
                    {t.actions.delete}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <CreateEventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editEvent}
        allEvents={events || []}
      />
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-xs bg-black/90">
          <img
            src={imagePreview || ""}
            alt="Event preview"
            className="w-full h-full object-cover rounded"
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити подію?</AlertDialogTitle>
          </AlertDialogHeader>
          <div>
            Ви впевнені, що хочете видалити <b>{eventToDelete?.name?.uk}</b>? Цю
            дію не можна скасувати.
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
