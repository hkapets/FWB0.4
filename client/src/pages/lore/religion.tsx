import { useTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CreateReligionModal from "@/components/modals/create-religion-modal";
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

export default function ReligionPage() {
  const t = useTranslation();
  const [religions, setReligions] = useState<any[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editReligion, setEditReligion] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [religionToDelete, setReligionToDelete] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const worldId = 1; // TODO: get from context or props

  useEffect(() => {
    fetch(`/api/worlds/${worldId}/lore`)
      .then((res) => res.json())
      .then((data) =>
        setReligions(data.filter((l: any) => l.type === "religion"))
      );
  }, [worldId]);

  const handleAdd = () => {
    setEditReligion(null);
    setModalOpen(true);
  };
  const handleEdit = (religion: any) => {
    setEditReligion(religion);
    setModalOpen(true);
  };
  const handleDelete = (religion: any) => {
    setReligionToDelete(religion);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!religionToDelete || !religions) return;
    await fetch(`/api/lore/${religionToDelete.id}`, { method: "DELETE" });
    setReligions(religions.filter((r) => r.id !== religionToDelete.id));
    toast({
      title: t.actions.delete,
      description: `${religionToDelete.name?.uk || ""} видалено.`,
    });
    setDeleteDialogOpen(false);
    setReligionToDelete(null);
  };
  const handleSubmit = async (data: any) => {
    if (editReligion) {
      // Update
      const res = await fetch(`/api/lore/${editReligion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "religion" }),
      });
      const updated = await res.json();
      setReligions(religions!.map((r) => (r.id === updated.id ? updated : r)));
      toast({
        title: t.actions.edit,
        description: `${updated.name?.uk} оновлено.`,
      });
    } else {
      // Create
      const res = await fetch(`/api/worlds/${worldId}/lore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "religion" }),
      });
      const created = await res.json();
      setReligions([...(religions || []), created]);
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
        Релігії
        <Button onClick={handleAdd}>{t.actions.add}</Button>
      </h1>
      <div className="fantasy-border rounded-lg p-4 text-gray-300 bg-black/30 min-h-[120px] overflow-x-auto">
        {religions === null ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded" />
                <div className="h-4 w-32 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : religions.length === 0 ? (
          <p>Немає релігій.</p>
        ) : (
          <ul className="space-y-2">
            {religions.map((religion) => (
              <li
                key={religion.id}
                className="flex items-center justify-between bg-black/40 rounded px-3 py-2 transition-all duration-300 animate-fadein"
              >
                <div className="flex items-center gap-2">
                  {religion.image && (
                    <img
                      src={religion.image}
                      alt={religion.name?.uk + " image"}
                      className="w-8 h-8 object-cover rounded border border-yellow-400 cursor-pointer"
                      onClick={() => setImagePreview(religion.image)}
                    />
                  )}
                  <span className="text-2xl" title={religion.icon}>
                    {religion.icon}
                  </span>
                  <span className="font-semibold text-white">
                    {religion.name?.uk}
                  </span>
                  {religion.pantheon && (
                    <span className="ml-2 text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-200">
                      {religion.pantheon}
                    </span>
                  )}
                  {religion.description && (
                    <span className="text-gray-400 text-sm max-w-xs truncate">
                      {religion.description.uk}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(religion)}
                  >
                    {t.actions.edit}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(religion)}
                  >
                    {t.actions.delete}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <CreateReligionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editReligion}
        allReligions={religions || []}
      />
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-xs bg-black/90">
          <img
            src={imagePreview || ""}
            alt="Religion preview"
            className="w-full h-full object-cover rounded"
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити релігію?</AlertDialogTitle>
          </AlertDialogHeader>
          <div>
            Ви впевнені, що хочете видалити <b>{religionToDelete?.name?.uk}</b>?
            Цю дію не можна скасувати.
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
