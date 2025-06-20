import { useTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CreateArtifactModal from "@/components/modals/create-artifact-modal";
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
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

export default function ArtifactsPage() {
  const t = useTranslation();
  const [artifacts, setArtifacts] = useState<any[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editArtifact, setEditArtifact] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [artifactToDelete, setArtifactToDelete] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const worldId = 1; // TODO: get from context or props
  const { data: events = [] } = useQuery<any[]>({ queryKey: ["/api/events"] });

  useEffect(() => {
    fetch(`/api/worlds/${worldId}/artifacts`)
      .then((res) => res.json())
      .then(setArtifacts);
  }, [worldId]);

  const handleAdd = () => {
    setEditArtifact(null);
    setModalOpen(true);
  };
  const handleEdit = (artifact: any) => {
    setEditArtifact(artifact);
    setModalOpen(true);
  };
  const handleDelete = (artifact: any) => {
    setArtifactToDelete(artifact);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!artifactToDelete || !artifacts) return;
    await fetch(`/api/artifacts/${artifactToDelete.id}`, { method: "DELETE" });
    setArtifacts(artifacts.filter((a) => a.id !== artifactToDelete.id));
    toast({
      title: t.actions.delete,
      description: `${artifactToDelete.name?.uk || ""} видалено.`,
    });
    setDeleteDialogOpen(false);
    setArtifactToDelete(null);
  };
  const handleSubmit = async (data: any) => {
    if (editArtifact) {
      // Update
      const res = await fetch(`/api/artifacts/${editArtifact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setArtifacts(artifacts!.map((a) => (a.id === updated.id ? updated : a)));
      toast({
        title: t.actions.edit,
        description: `${updated.name?.uk} оновлено.`,
      });
    } else {
      // Create
      const res = await fetch(`/api/worlds/${worldId}/artifacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const created = await res.json();
      setArtifacts([...(artifacts || []), created]);
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
        {t.lore.artifacts}
        <Button onClick={handleAdd}>{t.actions.add}</Button>
      </h1>
      <div className="fantasy-border rounded-lg p-4 text-gray-300 bg-black/30 min-h-[120px] overflow-x-auto">
        {artifacts === null ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded" />
                <div className="h-4 w-32 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : artifacts.length === 0 ? (
          <p>Немає артефактів.</p>
        ) : (
          <ul className="space-y-2">
            {artifacts.map((artifact) => {
              const relatedEvents = events.filter(
                (e) => e.artifactId === artifact.id
              );
              return (
                <li
                  key={artifact.id}
                  className="flex flex-col bg-black/40 rounded px-3 py-2 transition-all duration-300 animate-fadein"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {artifact.image && (
                        <img
                          src={artifact.image}
                          alt={artifact.name?.uk + " image"}
                          className="w-8 h-8 object-cover rounded border border-yellow-400 cursor-pointer"
                          onClick={() => setImagePreview(artifact.image)}
                        />
                      )}
                      <span className="text-2xl" title={artifact.icon}>
                        {artifact.icon}
                      </span>
                      <span className="font-semibold text-white">
                        {artifact.name?.uk}
                      </span>
                      {artifact.rarity && (
                        <span className="ml-2 text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-200">
                          {artifact.rarity}
                        </span>
                      )}
                      {artifact.description && (
                        <span className="text-gray-400 text-sm max-w-xs truncate">
                          {artifact.description.uk}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(artifact)}
                      >
                        {t.actions.edit}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(artifact)}
                      >
                        {t.actions.delete}
                      </Button>
                    </div>
                  </div>
                  {relatedEvents.length > 0 && (
                    <div className="mt-2 ml-10">
                      <div className="text-xs text-gray-400 mb-1 font-semibold">
                        Події, пов'язані з артефактом:
                      </div>
                      <ul className="space-y-1">
                        {relatedEvents.map((event) => (
                          <li key={event.id}>
                            <Link
                              href={`/timeline?event=${event.id}`}
                              className="underline text-yellow-300 hover:text-yellow-200 cursor-pointer"
                            >
                              {event.name}{" "}
                              <span className="text-gray-400">
                                ({event.date})
                              </span>{" "}
                              <span className="ml-1 text-xs bg-yellow-900/40 rounded px-1">
                                {event.type}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <CreateArtifactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editArtifact}
        allArtifacts={artifacts || []}
      />
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-xs bg-black/90">
          <img
            src={imagePreview || ""}
            alt="Artifact preview"
            className="w-full h-full object-cover rounded"
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити артефакт?</AlertDialogTitle>
          </AlertDialogHeader>
          <div>
            Ви впевнені, що хочете видалити <b>{artifactToDelete?.name?.uk}</b>?
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
