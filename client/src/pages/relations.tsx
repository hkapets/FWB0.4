import { useTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CreateRelationModal from "@/components/modals/create-relation-modal";
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

export default function RelationsPage() {
  const t = useTranslation();
  const [relations, setRelations] = useState<any[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRelation, setEditRelation] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [relationToDelete, setRelationToDelete] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const worldId = 1; // TODO: get from context or props

  useEffect(() => {
    fetch(`/api/worlds/${worldId}/lore`)
      .then((res) => res.json())
      .then((data) =>
        setRelations(data.filter((l: any) => l.type === "relation"))
      );
  }, [worldId]);

  const handleAdd = () => {
    setEditRelation(null);
    setModalOpen(true);
  };
  const handleEdit = (relation: any) => {
    setEditRelation(relation);
    setModalOpen(true);
  };
  const handleDelete = (relation: any) => {
    setRelationToDelete(relation);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!relationToDelete || !relations) return;
    await fetch(`/api/lore/${relationToDelete.id}`, { method: "DELETE" });
    setRelations(relations.filter((r) => r.id !== relationToDelete.id));
    toast({
      title: t.actions.delete,
      description: `${relationToDelete.name?.uk || ""} видалено.`,
    });
    setDeleteDialogOpen(false);
    setRelationToDelete(null);
  };
  const handleSubmit = async (data: any) => {
    if (editRelation) {
      // Update
      const res = await fetch(`/api/lore/${editRelation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "relation" }),
      });
      const updated = await res.json();
      setRelations(relations!.map((r) => (r.id === updated.id ? updated : r)));
      toast({
        title: t.actions.edit,
        description: `${updated.name?.uk} оновлено.`,
      });
    } else {
      // Create
      const res = await fetch(`/api/worlds/${worldId}/lore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "relation" }),
      });
      const created = await res.json();
      setRelations([...(relations || []), created]);
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
        {t.navigation.relations}
        <Button onClick={handleAdd}>{t.actions.add}</Button>
      </h1>
      <div className="fantasy-border rounded-lg p-4 text-gray-300 bg-black/30 min-h-[120px] overflow-x-auto">
        {relations === null ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded" />
                <div className="h-4 w-32 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : relations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 animate-fadein">
            <img
              src="/empty-worlds.svg"
              alt="Порожньо"
              className="w-28 h-28 mb-4 opacity-70"
            />
            <div className="text-lg mb-2">У вас ще немає жодного зв'язку</div>
            <div className="mb-4 text-sm text-gray-500">
              Додайте перший зв'язок, щоб описати стосунки між сутностями!
            </div>
            <Button onClick={handleAdd} size="lg" className="mt-2">
              Додати зв'язок
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {relations.map((relation) => (
              <li
                key={relation.id}
                className="flex items-center justify-between bg-black/40 rounded px-3 py-2 transition-all duration-300 animate-fadein"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {relation.imageUrl && (
                    <img
                      src={relation.imageUrl}
                      alt={relation.name?.uk + " image"}
                      className="w-10 h-10 object-cover rounded border border-yellow-400 cursor-pointer shadow-md hover:scale-105 transition"
                      onClick={() => setImagePreview(relation.imageUrl)}
                    />
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="text-2xl cursor-help"
                        title={relation.icon}
                      >
                        {relation.icon}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Іконка зв'язку</TooltipContent>
                  </Tooltip>
                  <span className="font-semibold text-white truncate max-w-[120px] md:max-w-xs">
                    {relation.name?.uk}
                  </span>
                  {relation.status && (
                    <span className="ml-2 text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-200">
                      {relation.status}
                    </span>
                  )}
                  {relation.description && (
                    <span className="text-gray-400 text-sm max-w-xs truncate">
                      {relation.description.uk}
                    </span>
                  )}
                  {relation.participants && (
                    <span className="ml-2 text-xs px-2 py-1 rounded bg-blue-900 text-blue-200">
                      {relation.participants}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(relation)}
                  >
                    {t.actions.edit}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(relation)}
                  >
                    {t.actions.delete}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <CreateRelationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editRelation}
        allRelations={relations || []}
      />
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-xs bg-black/90">
          <img
            src={imagePreview || ""}
            alt="Relation preview"
            className="w-full h-full object-cover rounded"
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити зв'язок?</AlertDialogTitle>
          </AlertDialogHeader>
          <div>
            Ви впевнені, що хочете видалити <b>{relationToDelete?.name?.uk}</b>?
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
