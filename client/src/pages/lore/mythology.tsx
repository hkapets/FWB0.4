import { useTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CreateMythologyModal from "@/components/modals/create-mythology-modal";
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

export default function MythologyPage() {
  const t = useTranslation();
  const [mythologies, setMythologies] = useState<any[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMythology, setEditMythology] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mythologyToDelete, setMythologyToDelete] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const worldId = 1; // TODO: get from context or props

  useEffect(() => {
    fetch(`/api/worlds/${worldId}/lore`)
      .then((res) => res.json())
      .then((data) =>
        setMythologies(data.filter((l: any) => l.type === "mythology"))
      );
  }, [worldId]);

  const handleAdd = () => {
    setEditMythology(null);
    setModalOpen(true);
  };
  const handleEdit = (mythology: any) => {
    setEditMythology(mythology);
    setModalOpen(true);
  };
  const handleDelete = (mythology: any) => {
    setMythologyToDelete(mythology);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!mythologyToDelete || !mythologies) return;
    await fetch(`/api/lore/${mythologyToDelete.id}`, { method: "DELETE" });
    setMythologies(mythologies.filter((r) => r.id !== mythologyToDelete.id));
    toast({
      title: t.actions.delete,
      description: `${mythologyToDelete.name?.uk || ""} видалено.`,
    });
    setDeleteDialogOpen(false);
    setMythologyToDelete(null);
  };
  const handleSubmit = async (data: any) => {
    if (editMythology) {
      // Update
      const res = await fetch(`/api/lore/${editMythology.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "mythology" }),
      });
      const updated = await res.json();
      setMythologies(
        mythologies!.map((r) => (r.id === updated.id ? updated : r))
      );
      toast({
        title: t.actions.edit,
        description: `${updated.name?.uk} оновлено.`,
      });
    } else {
      // Create
      const res = await fetch(`/api/worlds/${worldId}/lore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "mythology" }),
      });
      const created = await res.json();
      setMythologies([...(mythologies || []), created]);
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
        Міфологія
        <Button onClick={handleAdd}>{t.actions.add}</Button>
      </h1>
      <div className="fantasy-border rounded-lg p-4 text-gray-300 bg-black/30 min-h-[120px] overflow-x-auto">
        {mythologies === null ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded" />
                <div className="h-4 w-32 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : mythologies.length === 0 ? (
          <p>Немає міфологій.</p>
        ) : (
          <ul className="space-y-2">
            {mythologies.map((mythology) => (
              <li
                key={mythology.id}
                className="flex items-center justify-between bg-black/40 rounded px-3 py-2 transition-all duration-300 animate-fadein"
              >
                <div className="flex items-center gap-2">
                  {mythology.image && (
                    <img
                      src={mythology.image}
                      alt={mythology.name?.uk + " image"}
                      className="w-8 h-8 object-cover rounded border border-yellow-400 cursor-pointer"
                      onClick={() => setImagePreview(mythology.image)}
                    />
                  )}
                  <span className="text-2xl" title={mythology.icon}>
                    {mythology.icon}
                  </span>
                  <span className="font-semibold text-white">
                    {mythology.name?.uk}
                  </span>
                  {mythology.pantheon && (
                    <span className="ml-2 text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-200">
                      {mythology.pantheon}
                    </span>
                  )}
                  {mythology.description && (
                    <span className="text-gray-400 text-sm max-w-xs truncate">
                      {mythology.description.uk}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(mythology)}
                  >
                    {t.actions.edit}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(mythology)}
                  >
                    {t.actions.delete}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <CreateMythologyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editMythology}
        allMythologies={mythologies || []}
      />
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-xs bg-black/90">
          <img
            src={imagePreview || ""}
            alt="Mythology preview"
            className="w-full h-full object-cover rounded"
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити міфологію?</AlertDialogTitle>
          </AlertDialogHeader>
          <div>
            Ви впевнені, що хочете видалити <b>{mythologyToDelete?.name?.uk}</b>
            ? Цю дію не можна скасувати.
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
