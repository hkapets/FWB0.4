import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation, useI18n } from "@/lib/i18n";
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
import { Character, WorldLore as LoreItemType } from "@shared/schema";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import CharacterCard from "@/components/cards/character-card";
import CreateCharacterModal from "@/components/modals/create-character-modal";
import { getMultilingualValue } from "@/lib/utils";

type LoreLinkRendererProps = {
  children: React.ReactNode[];
  lore: LoreItemType[];
  setLorePreview: (item: any) => void;
  lang: string;
};

function LoreLinkRenderer({
  children,
  lore,
  setLorePreview,
  lang,
}: LoreLinkRendererProps) {
  const text = (children as any)[0];
  const loreItem = lore?.find(
    (l) => getMultilingualValue(l.name, lang) === text
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
  const t = useTranslation();
  const [tab, setTab] = useState<
    "characters" | "races" | "classes" | "magic" | "lore"
  >("characters");
  const { toast } = useToast();
  const { language: lang } = useI18n();

  const worldId = 1; // TODO: get from context or props

  // CRUD state for characters
  const [characters, setCharacters] = useState<Character[] | null>(null);
  const [characterModalOpen, setCharacterModalOpen] = useState(false);
  const [editCharacter, setEditCharacter] = useState<Character | null>(null);
  const [deleteCharacterDialogOpen, setDeleteCharacterDialogOpen] =
    useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(
    null
  );

  // CRUD state for races
  const [races, setRaces] = useState<any[] | null>(null);
  const [raceModalOpen, setRaceModalOpen] = useState(false);
  const [editRace, setEditRace] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [raceToDelete, setRaceToDelete] = useState<any | null>(null);

  // CRUD state for classes
  const [classes, setClasses] = useState<any[] | null>(null);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editClass, setEditClass] = useState<any | null>(null);
  const [deleteClassDialogOpen, setDeleteClassDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any | null>(null);

  // CRUD state for magic types
  const [magic, setMagic] = useState<any[] | null>(null);
  const [magicModalOpen, setMagicModalOpen] = useState(false);
  const [editMagic, setEditMagic] = useState<any | null>(null);
  const [deleteMagicDialogOpen, setDeleteMagicDialogOpen] = useState(false);
  const [magicToDelete, setMagicToDelete] = useState<any | null>(null);

  // CRUD state for lore
  const [lore, setLore] = useState<LoreItemType[] | null>(null);
  const [loreModalOpen, setLoreModalOpen] = useState(false);
  const [editLore, setEditLore] = useState<LoreItemType | null>(null);
  const [deleteLoreDialogOpen, setDeleteLoreDialogOpen] = useState(false);
  const [loreToDelete, setLoreToDelete] = useState<LoreItemType | null>(null);
  const [lorePreview, setLorePreview] = useState<LoreItemType | null>(null);
  const [loreSearch, setLoreSearch] = useState("");
  const [selectedLoreIds, setSelectedLoreIds] = useState<number[]>([]);
  const [massDeleteDialogOpen, setMassDeleteDialogOpen] = useState(false);
  const [massMoveParentId, setMassMoveParentId] = useState<number | null>(null);
  const [loreUndoStack, setLoreUndoStack] = useState<LoreItemType[][]>([]);
  const [loreRedoStack, setLoreRedoStack] = useState<LoreItemType[][]>([]);
  const [loreFilterImage, setLoreFilterImage] = useState<
    "all" | "with" | "without"
  >("all");
  const [loreFilterParent, setLoreFilterParent] = useState<"all" | "root">(
    "all"
  );
  const [loreSort, setLoreSort] = useState<"order" | "alpha" | "date">("order");
  const [loreTypeFilter, setLoreTypeFilter] = useState<string>("all");

  const fetchCharacters = () => {
    setCharacters(null); // Show loading state
    fetch(`/api/worlds/${worldId}/characters`)
      .then((res) => res.json())
      .then(setCharacters)
      .catch(() => setCharacters([])); // On error, show empty state
  };

  useEffect(() => {
    if (tab === "characters") {
      fetchCharacters();
    }
    if (tab === "races")
      fetch(`/api/worlds/${worldId}/races`)
        .then((res) => res.json())
        .then(setRaces);
    if (tab === "classes")
      fetch(`/api/worlds/${worldId}/classes`)
        .then((res) => res.json())
        .then(setClasses);
    if (tab === "magic")
      fetch(`/api/worlds/${worldId}/magic`)
        .then((res) => res.json())
        .then(setMagic);
    if (tab === "lore")
      fetch(`/api/worlds/${worldId}/lore`)
        .then((res) => res.json())
        .then(setLore);
  }, [tab, worldId]);

  // Character handlers
  const handleAddCharacter = () => {
    setEditCharacter(null);
    setCharacterModalOpen(true);
  };
  const handleEditCharacter = (character: Character) => {
    setEditCharacter(character);
    setCharacterModalOpen(true);
  };
  const handleDeleteCharacter = (character: Character) => {
    setCharacterToDelete(character);
    setDeleteCharacterDialogOpen(true);
  };
  const confirmDeleteCharacter = async () => {
    if (!characterToDelete) return;
    try {
      await fetch(`/api/characters/${characterToDelete.id}`, {
        method: "DELETE",
      });
      toast({
        title: t.character.deleted,
        description: `${getMultilingualValue(
          characterToDelete.name,
          lang
        )} was deleted.`,
      });
      fetchCharacters();
    } catch (error) {
      toast({
        title: t.messages.error,
        description: t.character.deleteError,
        variant: "destructive",
      });
    } finally {
      setDeleteCharacterDialogOpen(false);
      setCharacterToDelete(null);
    }
  };

  // Generic Handlers
  const handleAddItem = (type: "races" | "classes" | "magic" | "lore") => {
    if (type === "races") {
      setEditRace(null);
      setRaceModalOpen(true);
    }
    if (type === "classes") {
      setEditClass(null);
      setClassModalOpen(true);
    }
    if (type === "magic") {
      setEditMagic(null);
      setMagicModalOpen(true);
    }
    if (type === "lore") {
      setEditLore(null);
      setLoreModalOpen(true);
    }
  };

  const handleEditItem = (
    item: any,
    type: "races" | "classes" | "magic" | "lore"
  ) => {
    if (type === "races") {
      setEditRace(item);
      setRaceModalOpen(true);
    }
    if (type === "classes") {
      setEditClass(item);
      setClassModalOpen(true);
    }
    if (type === "magic") {
      setEditMagic(item);
      setMagicModalOpen(true);
    }
    if (type === "lore") {
      setEditLore(item);
      setLoreModalOpen(true);
    }
  };

  const handleDeleteItem = (
    item: any,
    type: "races" | "classes" | "magic" | "lore"
  ) => {
    if (type === "races") {
      setRaceToDelete(item);
      setDeleteDialogOpen(true);
    }
    if (type === "classes") {
      setClassToDelete(item);
      setDeleteClassDialogOpen(true);
    }
    if (type === "magic") {
      setMagicToDelete(item);
      setDeleteMagicDialogOpen(true);
    }
    if (type === "lore") {
      setLoreToDelete(item);
      setDeleteLoreDialogOpen(true);
    }
  };

  const confirmDeleteItem = async (
    type: "races" | "classes" | "magic" | "lore"
  ) => {
    let itemToDelete, endpoint;
    if (type === "races") {
      itemToDelete = raceToDelete;
      endpoint = `/api/races/${itemToDelete.id}`;
    }
    if (type === "classes") {
      itemToDelete = classToDelete;
      endpoint = `/api/classes/${itemToDelete.id}`;
    }
    if (type === "magic") {
      itemToDelete = magicToDelete;
      endpoint = `/api/magic/${itemToDelete.id}`;
    }
    if (type === "lore") {
      itemToDelete = loreToDelete;
      endpoint = `/api/lore/${itemToDelete.id}`;
    }
    if (!itemToDelete) return;
    await fetch(endpoint!, { method: "DELETE" });
    toast({
      title: "Видалено",
      description: `${(itemToDelete.name as any)[lang]} видалено.`,
    });
    // refetch
    // ...
    setDeleteDialogOpen(false);
    setDeleteClassDialogOpen(false);
    setDeleteMagicDialogOpen(false);
    setDeleteLoreDialogOpen(false);
  };

  // Lore specific handlers
  const onLoreReorder = (items: LoreItemType[]) => setLore(items);
  const onLoreItemSelect = (ids: number[]) => setSelectedLoreIds(ids);

  const filteredLore = useMemo(() => {
    if (!lore) return [];
    return lore
      .filter((item) => {
        const name = (item.name as string)?.toLowerCase() || "";
        const desc = (item.description as string)?.toLowerCase() || "";
        return (
          name.includes(loreSearch.toLowerCase()) ||
          desc.includes(loreSearch.toLowerCase())
        );
      })
      .filter((item) => {
        if (loreFilterImage === "all") return true;
        return loreFilterImage === "with" ? !!item.imageUrl : !item.imageUrl;
      })
      .filter((item) => {
        if (loreFilterParent === "all") return true;
        return item.parentId === null;
      })
      .filter((item) => {
        if (loreTypeFilter === "all") return true;
        return item.type === loreTypeFilter;
      });
  }, [lore, loreSearch, loreFilterImage, loreFilterParent, loreTypeFilter]);

  const tabNames: Record<typeof tab, string> = {
    characters: t.navigation.characters,
    races: t.lore.races,
    classes: t.lore.classes,
    magic: t.lore.magic,
    lore: t.navigation.lore,
  };

  if (!t.character) {
    return <div>Loading translations...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          {Object.keys(tabNames).map((tabKey) => (
            <Button
              key={tabKey}
              variant={tab === tabKey ? "default" : "outline"}
              onClick={() => setTab(tabKey as any)}
              className="capitalize"
            >
              {tabNames[tabKey as keyof typeof tabNames]}
            </Button>
          ))}
        </div>
        {tab === "characters" && (
          <Button onClick={handleAddCharacter} className="fantasy-button">
            {t.character.add}
          </Button>
        )}
      </div>

      {tab === "characters" && (
        <div className="animate-fadein">
          {characters === null ? (
            <div className="text-center py-16 text-gray-400">
              Loading characters...
            </div>
          ) : characters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {characters.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  onEdit={() => handleEditCharacter(char)}
                  onDelete={() => handleDeleteCharacter(char)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 flex flex-col items-center">
              <h3 className="text-2xl font-fantasy text-yellow-300">
                {t.character.noCharacters}
              </h3>
              <p className="text-gray-400 mt-2 mb-6 max-w-md">
                {t.character.noCharactersDesc}
              </p>
              <Button onClick={handleAddCharacter} size="lg">
                {t.character.addFirst}
              </Button>
            </div>
          )}
        </div>
      )}

      {tab === "races" && (
        <div>
          <pre>{JSON.stringify(races, null, 2)}</pre>
        </div>
      )}
      {tab === "classes" && (
        <div>
          <pre>{JSON.stringify(classes, null, 2)}</pre>
        </div>
      )}
      {tab === "magic" && (
        <div>
          <pre>{JSON.stringify(magic, null, 2)}</pre>
        </div>
      )}
      {tab === "lore" && (
        <DndProvider backend={HTML5Backend}>
          <LoreTree
            items={filteredLore}
            onReorder={onLoreReorder}
            onItemSelect={onLoreItemSelect}
            selectedIds={selectedLoreIds}
            onEdit={(item) => handleEditItem(item, "lore")}
            onDelete={(item) => handleDeleteItem(item, "lore")}
          />
        </DndProvider>
      )}

      <CreateCharacterModal
        isOpen={characterModalOpen}
        onClose={() => setCharacterModalOpen(false)}
        character={editCharacter}
        worldId={worldId}
        onSuccess={() => {
          setCharacterModalOpen(false);
          fetchCharacters();
        }}
      />
      <AlertDialog
        open={deleteCharacterDialogOpen}
        onOpenChange={setDeleteCharacterDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="text-gray-300">
            This action cannot be undone. This will permanently delete the
            character{" "}
            <span className="font-bold text-yellow-300">
              {characterToDelete &&
                getMultilingualValue(characterToDelete.name, lang)}
            </span>
            .
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCharacter}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
