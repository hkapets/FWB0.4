import { useTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CreateGeographyModal from "@/components/modals/create-geography-modal";
import { useToast } from "@/hooks/use-toast";
import LocationCard from "@/components/cards/location-card";
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

export default function GeographyPage() {
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [locations, setLocations] = useState<any[] | null>(null);
  const [editLocation, setEditLocation] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const worldId = 1; // TODO: get from context or props

  useEffect(() => {
    fetch(`/api/worlds/${worldId}/locations`)
      .then((res) => res.json())
      .then(setLocations);
  }, [worldId]);

  const handleAdd = () => {
    setEditLocation(null);
    setIsOpen(true);
  };
  const handleEdit = (location: any) => {
    setEditLocation(location);
    setIsOpen(true);
  };
  const handleDelete = (location: any) => {
    setLocationToDelete(location);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!locationToDelete || !locations) return;
    await fetch(`/api/locations/${locationToDelete.id}`, { method: "DELETE" });
    setLocations(locations.filter((l) => l.id !== locationToDelete.id));
    toast({
      title: t.actions.delete,
      description: `${locationToDelete.name} видалено.`,
    });
    setDeleteDialogOpen(false);
    setLocationToDelete(null);
  };
  const handleSubmit = async (data: any) => {
    if (editLocation) {
      // Update
      const res = await fetch(`/api/locations/${editLocation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setLocations(locations!.map((l) => (l.id === updated.id ? updated : l)));
      toast({
        title: t.actions.edit,
        description: `${updated.name} оновлено.`,
      });
    } else {
      // Create
      const res = await fetch(`/api/worlds/${worldId}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const created = await res.json();
      setLocations([...(locations || []), created]);
      toast({ title: t.actions.add, description: `${created.name} створено.` });
    }
    setIsOpen(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4 flex items-center justify-between">
        {t.lore.geography}
        <Button onClick={handleAdd}>{t.actions.add}</Button>
      </h1>
      <div className="fantasy-border rounded-lg p-4 text-gray-300 bg-black/30 min-h-[120px] overflow-x-auto">
        {locations === null ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 animate-pulse">
                <div className="w-8 h-8 bg-gray-700 rounded" />
                <div className="h-4 w-32 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 animate-fadein">
            <img
              src="/empty-worlds.svg"
              alt="Порожньо"
              className="w-28 h-28 mb-4 opacity-70"
            />
            <div className="text-lg mb-2">No locations yet</div>
            <div className="mb-4 text-sm text-gray-500">
              Create your first location to enrich your world!
            </div>
            <Button onClick={handleAdd} size="lg" className="mt-2">
              Add location
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {locations.map((location) => (
              <li key={location.id} className="animate-fadein">
                <LocationCard
                  location={location}
                  viewMode="list"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={() => setImagePreview(location.imageUrl)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      <CreateGeographyModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        initialData={editLocation}
      />
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-xs bg-black/90">
          <img
            src={imagePreview || ""}
            alt="Location preview"
            className="w-full h-full object-cover rounded"
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити локацію?</AlertDialogTitle>
          </AlertDialogHeader>
          <div>
            Ви впевнені, що хочете видалити <b>{locationToDelete?.name}</b>? Цю
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
