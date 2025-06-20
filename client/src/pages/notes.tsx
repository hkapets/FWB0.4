import { useTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CreateNoteModal from "@/components/modals/create-note-modal";
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

export default function NotesPage() {
  const t = useTranslation();
  const [notes, setNotes] = useState<any[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editNote, setEditNote] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const worldId = 1; // TODO: get from context or props

  useEffect(() => {
    fetch(`/api/worlds/${worldId}/lore`)
      .then((res) => res.json())
      .then((data) => setNotes(data.filter((l: any) => l.type === "note")));
  }, [worldId]);

  const handleAdd = () => {
    setEditNote(null);
    setModalOpen(true);
  };
  const handleEdit = (note: any) => {
    setEditNote(note);
    setModalOpen(true);
  };
  const handleDelete = (note: any) => {
    setNoteToDelete(note);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!noteToDelete || !notes) return;
    await fetch(`/api/lore/${noteToDelete.id}`, { method: "DELETE" });
    setNotes(notes.filter((n) => n.id !== noteToDelete.id));
    toast({
      title: t.actions.delete,
      description: `${noteToDelete.name?.uk || ""} видалено.`,
    });
    setDeleteDialogOpen(false);
    setNoteToDelete(null);
  };
  const handleSubmit = async (data: any) => {
    if (editNote) {
      // Update
      const res = await fetch(`/api/lore/${editNote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "note" }),
      });
      const updated = await res.json();
      setNotes(notes!.map((n) => (n.id === updated.id ? updated : n)));
      toast({
        title: t.actions.edit,
        description: `${updated.name?.uk} оновлено.`,
      });
    } else {
      // Create
      const res = await fetch(`/api/worlds/${worldId}/lore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "note" }),
      });
      const created = await res.json();
      setNotes([...(notes || []), created]);
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
        {t.navigation.notes}
        <Button onClick={handleAdd}>{t.actions.add}</Button>
      </h1>
      <div className="fantasy-border rounded-lg p-4 text-gray-300 bg-black/30 min-h-[120px] overflow-x-auto">
        {notes === null ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded" />
                <div className="h-4 w-32 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 animate-fadein">
            <img
              src="/empty-worlds.svg"
              alt="Порожньо"
              className="w-28 h-28 mb-4 opacity-70"
            />
            <div className="text-lg mb-2">У вас ще немає жодної нотатки</div>
            <div className="mb-4 text-sm text-gray-500">
              Додайте першу нотатку, щоб зберігати ідеї та деталі світу!
            </div>
            <Button onClick={handleAdd} size="lg" className="mt-2">
              Додати нотатку
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li
                key={note.id}
                className="flex items-center justify-between bg-black/40 rounded px-3 py-2 transition-all duration-300 animate-fadein"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {note.imageUrl && (
                    <img
                      src={note.imageUrl}
                      alt={note.name?.uk + " image"}
                      className="w-10 h-10 object-cover rounded border border-yellow-400 cursor-pointer shadow-md hover:scale-105 transition"
                      onClick={() => setImagePreview(note.imageUrl)}
                    />
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-2xl cursor-help" title={note.icon}>
                        {note.icon}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Іконка нотатки</TooltipContent>
                  </Tooltip>
                  <span className="font-semibold text-white truncate max-w-[120px] md:max-w-xs">
                    {note.name?.uk}
                  </span>
                  {note.tags && (
                    <span className="ml-2 text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-200">
                      {note.tags}
                    </span>
                  )}
                  {note.description && (
                    <span className="text-gray-400 text-sm max-w-xs truncate">
                      {note.description.uk}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(note)}
                  >
                    {t.actions.edit}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(note)}
                  >
                    {t.actions.delete}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <CreateNoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editNote}
        allNotes={notes || []}
      />
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-xs bg-black/90">
          <img
            src={imagePreview || ""}
            alt="Note preview"
            className="w-full h-full object-cover rounded"
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити нотатку?</AlertDialogTitle>
          </AlertDialogHeader>
          <div>
            Ви впевнені, що хочете видалити <b>{noteToDelete?.name?.uk}</b>? Цю
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
