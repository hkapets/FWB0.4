import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation, i18n } from "@/lib/i18n";
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
import { Character, LoreItem as LoreItemType } from "@shared/schema";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import CharacterCard from "@/components/cards/character-card";
import CreateCharacterModal from "@/components/modals/create-character-modal";

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
    (l) => (l.name as any)[lang] === text || (l.name as any).en === text
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
  const { t } = useTranslation();
  const [tab, setTab] = useState<
    "characters" | "races" | "classes" | "magic" | "lore"
  >("characters");
  const { toast } = useToast();
  const lang = i18n.language as "uk" | "en";

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
    fetch(`/api/worlds/${worldId}/characters`)
      .then((res) => res.json())
      .then(setCharacters);
  };

  useEffect(() => {
    if (tab === "characters") fetchCharacters();
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
    await fetch(`/api/characters/${characterToDelete.id}`, {
      method: "DELETE",
    });
    fetchCharacters();
    toast({
      title: t("character.deleted"),
      description: `${(characterToDelete.name as any)[lang]} was deleted.`,
    });
    setDeleteCharacterDialogOpen(false);
    setCharacterToDelete(null);
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

  const tabNames: Record<typeof tab, string> = {
    characters: t("navigation.characters"),
    races: t("lore.races"),
    classes: t("lore.classes"),
    magic: t("lore.magic"),
    lore: t("navigation.lore"),
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-fantasy text-yellow-300">
            {t("navigation.characters")}
          </h1>
          <Button
            onClick={() => {
              if (tab === "characters") handleAddCharacter();
              else handleAddItem(tab);
            }}
            className="fantasy-button"
          >
            {t("common.add")} {tabNames[tab]}
          </Button>
        </div>

        <div className="flex border-b border-purple-800 mb-6">
          {(Object.keys(tabNames) as (keyof typeof tabNames)[]).map((tKey) => (
            <button
              key={tKey}
              onClick={() => setTab(tKey)}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                tab === tKey
                  ? "border-b-2 border-yellow-400 text-yellow-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tabNames[tKey]}
            </button>
          ))}
        </div>

        {tab === "characters" && (
          <div>
            {characters === null ? (
              <div className="text-center py-20">{t("common.loading")}</div>
            ) : characters.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {t("character.noCharacters")}
                </h2>
                <p className="text-gray-400 mb-6">
                  {t("character.noCharactersDesc")}
                </p>
                <Button onClick={handleAddCharacter} className="fantasy-button">
                  {t("character.add")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {characters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onEdit={() => handleEditCharacter(character)}
                    onDelete={() => handleDeleteCharacter(character)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other tabs can be implemented here... */}
      </div>

      {characterModalOpen && (
        <CreateCharacterModal
          isOpen={characterModalOpen}
          onClose={() => {
            setCharacterModalOpen(false);
            setEditCharacter(null);
          }}
          worldId={worldId}
          character={editCharacter}
          onSuccess={fetchCharacters}
        />
      )}

      <AlertDialog
        open={deleteCharacterDialogOpen}
        onOpenChange={setDeleteCharacterDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
          </AlertDialogHeader>
          <div>
            {t("common.confirmDeleteMessage", {
              item: (characterToDelete?.name as any)?.[lang],
            })}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCharacter}>
              {t("common.continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndProvider>
  );
}
