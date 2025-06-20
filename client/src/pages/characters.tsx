import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import CreateEditRaceModal from "@/components/modals/create-race-modal";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateEditClassModal from "@/components/modals/create-class-modal";
import CreateEditMagicModal from "@/components/modals/create-magic-modal";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ReactMarkdown from "react-markdown";
import LoreTree from "@/components/lore-tree";
import CreateEditLoreModal from "@/components/modals/create-lore-modal";
import { LoreItem } from "@/components/lore-tree";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useMemo } from "react";

type LoreLinkRendererProps = {
  children: React.ReactNode[];
  lore: any[];
  setLorePreview: (item: any) => void;
  lang: string;
};
function LoreLinkRenderer({
  children,
  lore,
  setLorePreview,
  lang,
}: LoreLinkRendererProps) {
  const text = children[0];
  // Пошук лору за назвою (обидві мови)
  const loreItem = lore?.find((l: any) =>
    typeof l.name === "object"
      ? l.name.uk === text || l.name.en === text
      : l.name === text
  );
  if (!loreItem) return <span className="text-yellow-400">[[{text}]]</span>;
  return (
    <a
      href="#"
      className="text-blue-400 underline hover:text-blue-200"
      onClick={(e) => {
        e.preventDefault();
        setLorePreview(loreItem);
      }}
    >
      {text}
    </a>
  );
}

export default function CharactersPage() {
  const t = useTranslation() as any;
  const [tab, setTab] = useState<
    "characters" | "races" | "classes" | "magic" | "lore"
  >("characters");
  const { toast } = useToast();
  const [lang, setLang] = useState<"uk" | "en">("uk");

  // CRUD state for races
  const [races, setRaces] = useState<any[] | null>(null);
  const [raceModalOpen, setRaceModalOpen] = useState(false);
  const [editRace, setEditRace] = useState<any | null>(null);
  const worldId = 1; // TODO: get from context or props
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [raceToDelete, setRaceToDelete] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // CRUD state for classes
  const [classes, setClasses] = useState<any[] | null>(null);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editClass, setEditClass] = useState<any | null>(null);
  const [deleteClassDialogOpen, setDeleteClassDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any | null>(null);
  const [classImagePreview, setClassImagePreview] = useState<string | null>(
    null
  );

  // CRUD state for magic types
  const [magic, setMagic] = useState<any[] | null>(null);
  const [magicModalOpen, setMagicModalOpen] = useState(false);
  const [editMagic, setEditMagic] = useState<any | null>(null);
  const [deleteMagicDialogOpen, setDeleteMagicDialogOpen] = useState(false);
  const [magicToDelete, setMagicToDelete] = useState<any | null>(null);
  const [magicImagePreview, setMagicImagePreview] = useState<string | null>(
    null
  );

  // CRUD state for lore
  const [lore, setLore] = useState<LoreItem[] | null>(null);
  const [loreModalOpen, setLoreModalOpen] = useState(false);
  const [editLore, setEditLore] = useState<LoreItem | null>(null);
  const [deleteLoreDialogOpen, setDeleteLoreDialogOpen] = useState(false);
  const [loreToDelete, setLoreToDelete] = useState<LoreItem | null>(null);
  const [loreImagePreview, setLoreImagePreview] = useState<string | null>(null);
  const [loreTypeFilter, setLoreTypeFilter] = useState<string>("all");
  const [lorePreview, setLorePreview] = useState<LoreItem | null>(null);
  const [loreSearch, setLoreSearch] = useState("");
  const [selectedLoreIds, setSelectedLoreIds] = useState<string[]>([]);
  const [massDeleteDialogOpen, setMassDeleteDialogOpen] = useState(false);
  const [massMoveParentId, setMassMoveParentId] = useState<string | null>(null);
  const [loreUndoStack, setLoreUndoStack] = useState<LoreItem[][]>([]);
  const [loreRedoStack, setLoreRedoStack] = useState<LoreItem[][]>([]);
  const [loreFilterImage, setLoreFilterImage] = useState<
    "all" | "with" | "without"
  >("all");
  const [loreFilterParent, setLoreFilterParent] = useState<"all" | "root">(
    "all"
  );
  const [loreSort, setLoreSort] = useState<"order" | "alpha" | "date">("order");

  // Fetch races
  useEffect(() => {
    if (tab === "races") {
      setRaces(null);
      fetch(`/api/worlds/${worldId}/races`)
        .then((res) => res.json())
        .then(setRaces);
    }
  }, [tab, worldId]);

  // Fetch classes
  useEffect(() => {
    if (tab === "classes") {
      setClasses(null);
      fetch(`/api/worlds/${worldId}/classes`)
        .then((res) => res.json())
        .then(setClasses);
    }
  }, [tab, worldId]);

  // Fetch magic types
  useEffect(() => {
    if (tab === "magic") {
      setMagic(null);
      fetch(`/api/worlds/${worldId}/magic`)
        .then((res) => res.json())
        .then(setMagic);
    }
  }, [tab, worldId]);

  // Fetch lore
  useEffect(() => {
    if (tab === "lore") {
      setLore(null);
      fetch(`/api/worlds/${worldId}/lore`)
        .then((res) => res.json())
        .then(setLore);
    }
  }, [tab, worldId]);

  const handleAddRace = () => {
    setEditRace(null);
    setRaceModalOpen(true);
  };
  const handleEditRace = (race: any) => {
    setEditRace(race);
    setRaceModalOpen(true);
  };
  const handleDeleteRace = (race: any) => {
    setRaceToDelete(race);
    setDeleteDialogOpen(true);
  };
  const confirmDeleteRace = async () => {
    if (!raceToDelete || !races) return;
    await fetch(`/api/races/${raceToDelete.id}`, { method: "DELETE" });
    setRaces(races.filter((r) => r.id !== raceToDelete.id));
    toast({
      title: "Race deleted",
      description: `${raceToDelete.name} was deleted.`,
    });
    if (!raceToDelete) return;
    await fetch(`/api/races/${raceToDelete.id}`, { method: "DELETE" });
    setRaces(races!.filter((r) => r.id !== raceToDelete.id));
    toast({
      title: "Race deleted",
      description: `${raceToDelete.name} was deleted.`,
    });
    setDeleteDialogOpen(false);
    setRaceToDelete(null);
  };
  const handleRaceSubmit = async (data: any) => {
    if (editRace) {
      // Update
      const res = await fetch(`/api/races/${editRace.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setRaces(races!.map((r) => (r.id === updated.id ? updated : r)));
      toast({ title: "Race updated", description: `${updated.name} updated.` });
    } else {
      // Create
      const res = await fetch(`/api/worlds/${worldId}/races`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const created = await res.json();
      setRaces([...(races || []), created]);
      toast({ title: "Race created", description: `${created.name} created.` });
    }
    setRaceModalOpen(false);
  };

  const handleAddClass = () => {
    setEditClass(null);
    setClassModalOpen(true);
  };
  const handleEditClass = (classItem: any) => {
    setEditClass(classItem);
    setClassModalOpen(true);
  };
  const handleDeleteClass = (classItem: any) => {
    setClassToDelete(classItem);
    setDeleteClassDialogOpen(true);
  };
  const confirmDeleteClass = async () => {
    if (!classToDelete || !classes) return;
    await fetch(`/api/classes/${classToDelete.id}`, { method: "DELETE" });
    setClasses(classes.filter((c) => c.id !== classToDelete.id));
    toast({
      title: "Class deleted",
      description: `${classToDelete.name} was deleted.`,
    });
    setDeleteClassDialogOpen(false);
    setClassToDelete(null);
  };
  const handleClassSubmit = async (data: any) => {
    if (editClass && classes) {
      // Update
      const res = await fetch(`/api/classes/${editClass.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setClasses(classes.map((c) => (c.id === updated.id ? updated : c)));
      toast({
        title: "Class updated",
        description: `${updated.name} updated.`,
      });
    } else {
      // Create
      const res = await fetch(`/api/worlds/${worldId}/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const created = await res.json();
      setClasses([...(classes || []), created]);
      toast({
        title: "Class created",
        description: `${created.name} created.`,
      });
    }
    setClassModalOpen(false);
  };

  const handleAddMagic = () => {
    setEditMagic(null);
    setMagicModalOpen(true);
  };
  const handleEditMagic = (magicItem: any) => {
    setEditMagic(magicItem);
    setMagicModalOpen(true);
  };
  const handleDeleteMagic = (magicItem: any) => {
    setMagicToDelete(magicItem);
    setDeleteMagicDialogOpen(true);
  };
  const confirmDeleteMagic = async () => {
    if (!magicToDelete || !magic) return;
    await fetch(`/api/magic/${magicToDelete.id}`, { method: "DELETE" });
    setMagic(magic.filter((m) => m.id !== magicToDelete.id));
    toast({
      title: "Magic type deleted",
      description: `${magicToDelete.name} was deleted.`,
    });
    setDeleteMagicDialogOpen(false);
    setMagicToDelete(null);
  };
  const handleMagicSubmit = async (data: any) => {
    if (editMagic && magic) {
      // Update
      const res = await fetch(`/api/magic/${editMagic.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setMagic(magic.map((m) => (m.id === updated.id ? updated : m)));
      toast({
        title: "Magic type updated",
        description: `${updated.name} updated.`,
      });
    } else {
      // Create
      const res = await fetch(`/api/worlds/${worldId}/magic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const created = await res.json();
      setMagic([...(magic || []), created]);
      toast({
        title: "Magic type created",
        description: `${created.name} created.`,
      });
    }
    setMagicModalOpen(false);
  };

  const handleAddLore = () => {
    setEditLore(null);
    setLoreModalOpen(true);
  };
  const handleEditLore = (loreItem: LoreItem) => {
    setEditLore(loreItem);
    setLoreModalOpen(true);
  };
  const handleDeleteLore = (loreItem: LoreItem) => {
    setLoreToDelete(loreItem);
    setDeleteLoreDialogOpen(true);
  };
  const confirmDeleteLore = async () => {
    if (!loreToDelete || !lore) return;
    await fetch(`/api/lore/${loreToDelete.id}`, { method: "DELETE" });
    setLoreWithUndo(lore.filter((l) => l.id !== loreToDelete.id));
    toast({
      title: "Lore deleted",
      description: `${loreToDelete.name} was deleted.`,
    });
    setDeleteLoreDialogOpen(false);
    setLoreToDelete(null);
  };
  const handleLoreSubmit = async (data: any) => {
    if (editLore && lore) {
      const res = await fetch(`/api/lore/${editLore.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      setLoreWithUndo(lore.map((l) => (l.id === updated.id ? updated : l)));
      toast({ title: "Lore updated", description: `${updated.name} updated.` });
    } else {
      const res = await fetch(`/api/worlds/${worldId}/lore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const created = await res.json();
      setLoreWithUndo([...(lore || []), created]);
      toast({ title: "Lore created", description: `${created.name} created.` });
    }
    setLoreModalOpen(false);
  };

  const handleLoreReorder = (reorderedLore: LoreItem[]) => {
    setLoreWithUndo(reorderedLore);
  };

  // Масове виділення
  const handleSelectLore = (id: string, checked: boolean) => {
    setSelectedLoreIds((ids) =>
      checked ? [...ids, id] : ids.filter((i) => i !== id)
    );
  };
  const handleSelectAllLore = (checked: boolean, visibleLore: LoreItem[]) => {
    if (checked)
      setSelectedLoreIds(
        Array.from(
          new Set([...selectedLoreIds, ...visibleLore.map((l) => l.id)])
        )
      );
    else
      setSelectedLoreIds(
        selectedLoreIds.filter((id) => !visibleLore.some((l) => l.id === id))
      );
  };
  const handleMassDelete = () => setMassDeleteDialogOpen(true);
  const confirmMassDelete = async () => {
    for (const id of selectedLoreIds) {
      await fetch(`/api/lore/${id}`, { method: "DELETE" });
    }
    setLoreWithUndo(lore!.filter((l) => !selectedLoreIds.includes(l.id)));
    setSelectedLoreIds([]);
    setMassDeleteDialogOpen(false);
    toast({ title: "Deleted", description: "Selected lore deleted." });
  };
  const handleMassMove = async (parentId: string | null) => {
    const updated = lore!.map((l) =>
      selectedLoreIds.includes(l.id) ? { ...l, parentId } : l
    );
    setLoreWithUndo(updated);
    setSelectedLoreIds([]);
    setMassMoveParentId(null);
    toast({ title: "Moved", description: "Selected lore moved." });
  };

  // Undo/Redo
  const handleUndoLore = () => {
    if (loreUndoStack.length === 0) return;
    setLoreRedoStack((stack) => [[...(lore || [])], ...stack]);
    setLore(loreUndoStack[loreUndoStack.length - 1]);
    setLoreUndoStack((stack) => stack.slice(0, -1));
    toast({ title: "Undo", description: "Останню дію скасовано." });
  };
  const handleRedoLore = () => {
    if (loreRedoStack.length === 0) return;
    setLoreUndoStack((stack) => [...stack, lore ? [...lore] : []]);
    setLore(loreRedoStack[0]);
    setLoreRedoStack((stack) => stack.slice(1));
    toast({ title: "Redo", description: "Дію повернуто." });
  };

  // Обгортка для змін лору з undo
  const setLoreWithUndo = (newLore: LoreItem[]) => {
    setLoreUndoStack((stack) => [...stack, lore ? [...lore] : []]);
    setLore(newLore);
    setLoreRedoStack([]);
  };

  return (
    <div className="p-6">
      <div className="flex space-x-4 mb-6">
        <Button
          variant={tab === "characters" ? "default" : "outline"}
          onClick={() => setTab("characters")}
        >
          {t.navigation.characters}
        </Button>
        <Button
          variant={tab === "races" ? "default" : "outline"}
          onClick={() => setTab("races")}
        >
          {t.forms.race + "s"}
        </Button>
        <Button
          variant={tab === "classes" ? "default" : "outline"}
          onClick={() => setTab("classes")}
        >
          {t.forms.class + "es"}
        </Button>
        <Button
          variant={tab === "magic" ? "default" : "outline"}
          onClick={() => setTab("magic")}
        >
          {"magic" in t.forms ? t.forms.magic : "Magic"}
        </Button>
        <Button
          variant={tab === "lore" ? "default" : "outline"}
          onClick={() => setTab("lore")}
        >
          {t.forms.lore}
        </Button>
      </div>
      {tab === "characters" && <div>/* Characters CRUD here */</div>}
      {tab === "races" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t.forms.race + "s"}</h2>
            <Button onClick={handleAddRace}>{t.actions.add}</Button>
          </div>
          <div className="fantasy-border rounded-lg p-4 text-gray-300 bg-black/30 min-h-[120px] overflow-x-auto">
            {races === null ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 animate-pulse"
                  >
                    <div className="w-8 h-8 bg-gray-700 rounded" />
                    <div className="h-4 w-32 bg-gray-700 rounded" />
                  </div>
                ))}
              </div>
            ) : races.length === 0 ? (
              <p>No races yet.</p>
            ) : (
              <ul className="space-y-2">
                {races.map((race) => (
                  <li
                    key={race.id}
                    className="flex items-center justify-between bg-black/40 rounded px-3 py-2 transition-all duration-300 animate-fadein"
                  >
                    <div className="flex items-center gap-2">
                      {race.image && (
                        <img
                          src={race.image}
                          alt={race.name + " image"}
                          className="w-8 h-8 object-cover rounded border border-yellow-400 cursor-pointer"
                          onClick={() => setImagePreview(race.image)}
                        />
                      )}
                      <span className="text-2xl" title={race.icon}>
                        {race.icon}
                      </span>
                      <span className="font-semibold text-white">
                        {race.name}
                      </span>
                      {race.description && (
                        <span className="text-gray-400 text-sm">
                          {race.description}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditRace(race)}
                              aria-label="Edit race"
                            >
                              <span className="sr-only">Edit</span>
                              {t.actions.edit}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteRace(race)}
                              aria-label="Delete race"
                            >
                              <span className="sr-only">Delete</span>
                              {t.actions.delete}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <CreateEditRaceModal
            isOpen={raceModalOpen}
            onClose={() => setRaceModalOpen(false)}
            onSubmit={handleRaceSubmit}
            initialData={editRace}
            worldId={worldId}
          />
          {/* Modal preview for image */}
          {imagePreview && (
            <Dialog
              open={!!imagePreview}
              onOpenChange={() => setImagePreview(null)}
            >
              <DialogContent className="max-w-xs bg-black/90">
                <img
                  src={imagePreview}
                  alt="Race preview"
                  className="w-full h-full object-cover rounded"
                />
              </DialogContent>
            </Dialog>
          )}
          {/* Custom delete dialog */}
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete race?</AlertDialogTitle>
              </AlertDialogHeader>
              <div>
                Are you sure you want to delete <b>{raceToDelete?.name}</b>?
                This action cannot be undone.
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteRace}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      {tab === "classes" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t.forms.class + "es"}</h2>
            <Button onClick={handleAddClass}>{t.actions.add}</Button>
          </div>
          <div className="fantasy-border rounded-lg p-4 text-gray-300 bg-black/30 min-h-[120px] overflow-x-auto">
            {classes === null ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 animate-pulse"
                  >
                    <div className="w-8 h-8 bg-gray-700 rounded" />
                    <div className="h-4 w-32 bg-gray-700 rounded" />
                  </div>
                ))}
              </div>
            ) : classes.length === 0 ? (
              <p>No classes yet.</p>
            ) : (
              <ul className="space-y-2">
                {classes.map((classItem) => (
                  <li
                    key={classItem.id}
                    className="flex items-center justify-between bg-black/40 rounded px-3 py-2 transition-all duration-300 animate-fadein"
                  >
                    <div className="flex items-center gap-2">
                      {classItem.image && (
                        <img
                          src={classItem.image}
                          alt={classItem.name + " image"}
                          className="w-8 h-8 object-cover rounded border border-yellow-400 cursor-pointer"
                          onClick={() => setClassImagePreview(classItem.image)}
                        />
                      )}
                      <span className="text-2xl" title={classItem.icon}>
                        {classItem.icon}
                      </span>
                      <span className="font-semibold text-white">
                        {classItem.name}
                      </span>
                      {classItem.description && (
                        <span className="text-gray-400 text-sm">
                          {classItem.description}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClass(classItem)}
                              aria-label="Edit class"
                            >
                              <span className="sr-only">Edit</span>
                              {t.actions.edit}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteClass(classItem)}
                              aria-label="Delete class"
                            >
                              <span className="sr-only">Delete</span>
                              {t.actions.delete}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <CreateEditClassModal
            isOpen={classModalOpen}
            onClose={() => setClassModalOpen(false)}
            onSubmit={handleClassSubmit}
            initialData={editClass}
            worldId={worldId}
          />
          {/* Modal preview for image */}
          {classImagePreview && (
            <Dialog
              open={!!classImagePreview}
              onOpenChange={() => setClassImagePreview(null)}
            >
              <DialogContent className="max-w-xs bg-black/90">
                <img
                  src={classImagePreview}
                  alt="Class preview"
                  className="w-full h-full object-cover rounded"
                />
              </DialogContent>
            </Dialog>
          )}
          {/* Custom delete dialog */}
          <AlertDialog
            open={deleteClassDialogOpen}
            onOpenChange={setDeleteClassDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete class?</AlertDialogTitle>
              </AlertDialogHeader>
              <div>
                Are you sure you want to delete <b>{classToDelete?.name}</b>?
                This action cannot be undone.
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteClass}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      {tab === "magic" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {"magic" in t.forms ? t.forms.magic : "Magic"}
            </h2>
            <Button onClick={handleAddMagic}>{t.actions.add}</Button>
          </div>
          <div className="fantasy-border rounded-lg p-4 text-gray-300 bg-black/30 min-h-[120px] overflow-x-auto">
            {magic === null ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 animate-pulse"
                  >
                    <div className="w-8 h-8 bg-gray-700 rounded" />
                    <div className="h-4 w-32 bg-gray-700 rounded" />
                  </div>
                ))}
              </div>
            ) : magic.length === 0 ? (
              <p>No magic types yet.</p>
            ) : (
              <ul className="space-y-2">
                {magic.map((magicItem) => (
                  <li
                    key={magicItem.id}
                    className="flex items-center justify-between bg-black/40 rounded px-3 py-2 transition-all duration-300 animate-fadein"
                  >
                    <div className="flex items-center gap-2">
                      {magicItem.image && (
                        <img
                          src={magicItem.image}
                          alt={magicItem.name + " image"}
                          className="w-8 h-8 object-cover rounded border border-yellow-400 cursor-pointer"
                          onClick={() => setMagicImagePreview(magicItem.image)}
                        />
                      )}
                      <span className="text-2xl" title={magicItem.icon}>
                        {magicItem.icon}
                      </span>
                      <span className="font-semibold text-white">
                        {magicItem.name}
                      </span>
                      {magicItem.description && (
                        <span className="text-gray-400 text-sm">
                          {magicItem.description}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditMagic(magicItem)}
                              aria-label="Edit magic"
                            >
                              <span className="sr-only">Edit</span>
                              {t.actions.edit}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteMagic(magicItem)}
                              aria-label="Delete magic"
                            >
                              <span className="sr-only">Delete</span>
                              {t.actions.delete}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <CreateEditMagicModal
            isOpen={magicModalOpen}
            onClose={() => setMagicModalOpen(false)}
            onSubmit={handleMagicSubmit}
            initialData={editMagic}
            worldId={worldId}
          />
          {/* Modal preview for image */}
          {magicImagePreview && (
            <Dialog
              open={!!magicImagePreview}
              onOpenChange={() => setMagicImagePreview(null)}
            >
              <DialogContent className="max-w-xs bg-black/90">
                <img
                  src={magicImagePreview}
                  alt="Magic preview"
                  className="w-full h-full object-cover rounded"
                />
              </DialogContent>
            </Dialog>
          )}
          {/* Custom delete dialog */}
          <AlertDialog
            open={deleteMagicDialogOpen}
            onOpenChange={setDeleteMagicDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete magic type?</AlertDialogTitle>
              </AlertDialogHeader>
              <div>
                Are you sure you want to delete <b>{magicToDelete?.name}</b>?
                This action cannot be undone.
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteMagic}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      {tab === "lore" && lore && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Lore</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleUndoLore}
                disabled={loreUndoStack.length === 0}
              >
                Undo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRedoLore}
                disabled={loreRedoStack.length === 0}
              >
                Redo
              </Button>
              <Button onClick={handleAddLore}>{t.actions?.add || "Add"}</Button>
            </div>
          </div>
          {/* Розширені фільтри та сортування */}
          <div className="mb-4 flex gap-2 flex-wrap items-center">
            <input
              type="text"
              className="px-2 py-1 rounded border bg-black/40 text-white placeholder:text-gray-400"
              placeholder="Пошук по назві або типу..."
              value={loreSearch}
              onChange={(e) => setLoreSearch(e.target.value)}
              style={{ minWidth: 200 }}
            />
            <select
              value={loreFilterImage}
              onChange={(e) => setLoreFilterImage(e.target.value as any)}
              className="px-2 py-1 rounded border bg-black/40 text-white"
            >
              <option value="all">Всі</option>
              <option value="with">Зі зображенням</option>
              <option value="without">Без зображення</option>
            </select>
            <select
              value={loreFilterParent}
              onChange={(e) => setLoreFilterParent(e.target.value as any)}
              className="px-2 py-1 rounded border bg-black/40 text-white"
            >
              <option value="all">Всі</option>
              <option value="root">Тільки корінь</option>
            </select>
            <select
              value={loreSort}
              onChange={(e) => setLoreSort(e.target.value as any)}
              className="px-2 py-1 rounded border bg-black/40 text-white"
            >
              <option value="order">Порядок</option>
              <option value="alpha">А-Я</option>
              <option value="date">Дата</option>
            </select>
            {[
              "all",
              "artifact",
              "event",
              "geography",
              "magic",
              "mythology",
              "religion",
              "custom",
            ].map((type) => (
              <Button
                key={type}
                size="sm"
                variant={type === loreTypeFilter ? "default" : "outline"}
                onClick={() => setLoreTypeFilter(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
          {/* Масова панель дій */}
          {selectedLoreIds.length > 0 && (
            <div className="mb-2 flex gap-2 items-center bg-yellow-900/30 p-2 rounded">
              <span className="text-yellow-200">
                Виділено: {selectedLoreIds.length}
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleMassDelete}
              >
                Видалити
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMassMoveParentId("")}
              >
                Перемістити
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedLoreIds([])}
              >
                Зняти виділення
              </Button>
            </div>
          )}
          <DndProvider backend={HTML5Backend}>
            <LoreTree
              lore={lore
                .filter(
                  (l: any) =>
                    (!loreSearch ||
                      (typeof l.name === "object" && l.name !== null
                        ? ((l.name.uk || "") + (l.name.en || ""))
                            .toLowerCase()
                            .includes(loreSearch.toLowerCase())
                        : (l.name || "")
                            .toLowerCase()
                            .includes(loreSearch.toLowerCase())) ||
                      l.type
                        .toLowerCase()
                        .includes(loreSearch.toLowerCase())) &&
                    (loreFilterImage === "all" ||
                      (loreFilterImage === "with" ? !!l.image : !l.image)) &&
                    (loreFilterParent === "all" ||
                      (loreFilterParent === "root" ? !l.parentId : true)) &&
                    (loreTypeFilter === "all" || l.type === loreTypeFilter)
                )
                .sort((a: any, b: any) => {
                  if (loreSort === "order")
                    return (a.order ?? 0) - (b.order ?? 0);
                  if (loreSort === "alpha") {
                    const aName =
                      typeof a.name === "object" && a.name !== null
                        ? a.name.uk || a.name.en
                        : a.name || "";
                    const bName =
                      typeof b.name === "object" && b.name !== null
                        ? b.name.uk || b.name.en
                        : b.name || "";
                    return aName.localeCompare(bName);
                  }
                  if (loreSort === "date") {
                    const aDate =
                      typeof a.date === "string"
                        ? new Date(a.date).getTime()
                        : undefined;
                    const bDate =
                      typeof b.date === "string"
                        ? new Date(b.date).getTime()
                        : undefined;
                    if (aDate !== undefined && bDate !== undefined)
                      return aDate - bDate;
                    if (aDate !== undefined) return -1;
                    if (bDate !== undefined) return 1;
                    return (a.order ?? 0) - (b.order ?? 0);
                  }
                  return 0;
                })}
              filterType={loreTypeFilter}
              onEdit={handleEditLore}
              onDelete={handleDeleteLore}
              onPreview={setLorePreview}
              onReorder={handleLoreReorder}
              search={loreSearch}
              selectedLoreIds={selectedLoreIds}
              onSelectLore={handleSelectLore}
              onSelectAll={handleSelectAllLore}
            />
          </DndProvider>
          <CreateEditLoreModal
            isOpen={loreModalOpen}
            onClose={() => setLoreModalOpen(false)}
            onSubmit={handleLoreSubmit}
            initialData={
              editLore
                ? {
                    ...editLore,
                    name:
                      typeof editLore.name === "object"
                        ? editLore.name
                        : { uk: editLore.name, en: editLore.name },
                    description:
                      typeof editLore.description === "object"
                        ? editLore.description
                        : {
                            uk: editLore.description || "",
                            en: editLore.description || "",
                          },
                    parentId: editLore.parentId
                      ? Number(editLore.parentId) || undefined
                      : undefined,
                  }
                : undefined
            }
            worldId={worldId}
            allLore={lore?.map((l) => ({
              ...l,
              name: typeof l.name === "object" ? l.name : { uk: l.name },
            }))}
          />
          {/* Modal preview for image */}
          {loreImagePreview && (
            <Dialog
              open={!!loreImagePreview}
              onOpenChange={() => setLoreImagePreview(null)}
            >
              <DialogContent className="max-w-xs bg-black/90">
                <img
                  src={loreImagePreview}
                  alt="Lore preview"
                  className="w-full h-full object-cover rounded"
                />
              </DialogContent>
            </Dialog>
          )}
          {/* Markdown preview & розширений перегляд */}
          {lorePreview && (
            <Dialog
              open={!!lorePreview}
              onOpenChange={() => setLorePreview(null)}
            >
              <DialogContent className="max-w-2xl bg-black/90">
                <div className="flex items-center gap-2 mb-2">
                  {lorePreview.icon && (
                    <span className="text-2xl">{lorePreview.icon}</span>
                  )}
                  <span className="font-bold text-lg text-yellow-200">
                    {typeof lorePreview.name === "object"
                      ? lorePreview.name?.[lang]
                      : lorePreview.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {lorePreview.type}
                  </span>
                </div>
                {lorePreview.image && (
                  <img
                    src={lorePreview.image}
                    alt="Lore"
                    className="w-32 h-32 object-cover rounded border border-yellow-400 mb-2"
                  />
                )}
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      text({ children }) {
                        // Заміна [[назва]] на посилання
                        const parts =
                          String(children).split(/(\[\[[^\]]+\]\])/g);
                        return (
                          <>
                            {parts.map((part, i) => {
                              const match = part.match(/^\[\[([^\]]+)\]\]$/);
                              if (match)
                                return (
                                  <LoreLinkRenderer
                                    key={i}
                                    lore={lore}
                                    setLorePreview={setLorePreview}
                                    lang={lang}
                                  >
                                    {[match[1]]}
                                  </LoreLinkRenderer>
                                );
                              return part;
                            })}
                          </>
                        );
                      },
                    }}
                  >
                    {typeof lorePreview.description === "object"
                      ? lorePreview.description?.[lang]
                      : lorePreview.description}
                  </ReactMarkdown>
                </div>
                {lorePreview.parentId && (
                  <div className="mt-2 text-xs text-gray-400">
                    Parent:{" "}
                    {(() => {
                      const p = lore?.find(
                        (l) => l.id === lorePreview.parentId
                      );
                      return p
                        ? typeof p.name === "object"
                          ? p.name?.[lang]
                          : p.name
                        : "";
                    })()}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          )}
          {/* AlertDialog для масового видалення */}
          <AlertDialog
            open={massDeleteDialogOpen}
            onOpenChange={setMassDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Видалити {selectedLoreIds.length} елементів лору?
                </AlertDialogTitle>
              </AlertDialogHeader>
              <div>Цю дію не можна скасувати.</div>
              <AlertDialogFooter>
                <AlertDialogCancel>Скасувати</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmMassDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Видалити
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {/* Масове переміщення */}
          {massMoveParentId !== null && (
            <Dialog open={true} onOpenChange={() => setMassMoveParentId(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Виберіть новий parent для {selectedLoreIds.length} елементів
                  </DialogTitle>
                </DialogHeader>
                <select
                  className="w-full p-2 border rounded"
                  value={massMoveParentId}
                  onChange={(e) => setMassMoveParentId(e.target.value)}
                >
                  <option value="">Корінь</option>
                  {lore
                    .filter((l) => !selectedLoreIds.includes(l.id))
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                </select>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleMassMove(massMoveParentId || null)}
                  >
                    Перемістити
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setMassMoveParentId(null)}
                  >
                    Скасувати
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {/* Custom delete dialog */}
          <AlertDialog
            open={deleteLoreDialogOpen}
            onOpenChange={setDeleteLoreDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete lore?</AlertDialogTitle>
              </AlertDialogHeader>
              <div>
                Are you sure you want to delete <b>{loreToDelete?.name}</b>?
                This action cannot be undone.
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteLore}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
