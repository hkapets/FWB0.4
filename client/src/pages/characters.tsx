import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation, useI18n } from "@/lib/i18n";
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
import { Character } from "@shared/schema";
import CharacterCard from "@/components/cards/character-card";
import CreateCharacterModal from "@/components/modals/create-character-modal";
import { getMultilingualValue } from "@/lib/utils";

export default function CharactersPage() {
  const t = useTranslation();
  const [tab, setTab] = useState("characters");
  const { toast } = useToast();
  const { language: lang } = useI18n();
  const worldId = 1; // TODO: get from context

  const [characters, setCharacters] = useState<Character[] | null>(null);
  const [characterModalOpen, setCharacterModalOpen] = useState(false);
  const [editCharacter, setEditCharacter] = useState<Character | null>(null);
  const [deleteCharacterDialogOpen, setDeleteCharacterDialogOpen] =
    useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(
    null
  );

  const fetchCharacters = () => {
    setCharacters(null);
    fetch(`/api/worlds/${worldId}/characters`)
      .then((res) => res.json())
      .then(setCharacters)
      .catch(() => setCharacters([]));
  };

  useEffect(() => {
    if (tab === "characters") {
      fetchCharacters();
    }
    // Implement fetching for other tabs as needed
  }, [tab, worldId]);

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

  const tabNames: Record<string, string> = {
    characters: t.navigation.characters,
    races: t.lore.races,
    classes: t.lore.classes,
    magic: t.lore.magic,
    lore: t.navigation.lore,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 border-b border-purple-800">
          {Object.keys(tabNames).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                tab === tabKey
                  ? "border-b-2 border-yellow-400 text-yellow-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tabNames[tabKey]}
            </button>
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

      {tab !== "characters" && (
        <div className="text-center py-16 text-gray-400">
          Content for {tabNames[tab]} coming soon.
        </div>
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
            {characterToDelete && (
              <span className="font-bold text-yellow-300">
                {getMultilingualValue(characterToDelete.name, lang)}
              </span>
            )}
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
