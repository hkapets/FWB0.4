import { Button } from "@/components/ui/button";
import { Save, Download, Crown, Volume2, VolumeX } from "lucide-react";
import LanguageSelector from "@/components/ui/language-selector";
import { useTranslation } from "@/lib/i18n";
import { useAudioContext } from "@/components/audio-provider";
import GlobalSearch from "@/components/global-search";

interface HeaderProps {
  currentWorldId: number | null;
}

export default function Header({ currentWorldId }: HeaderProps) {
  const t = useTranslation();
  const { muted, setMuted, volume, setVolume } = useAudioContext();

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving project...");
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting project...");
  };

  return (
    <header className="fixed top-0 left-0 w-full h-16 flex items-center justify-between px-6 bg-gradient-to-r from-purple-900 via-gray-900 to-purple-800 shadow-lg z-50 fantasy-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="text-purple-900 text-xl" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-fantasy font-bold text-yellow-200">
              {t.header.title}
            </h1>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <GlobalSearch />
            <Button
              className="fantasy-button px-4 py-2 text-white font-medium"
              onClick={handleSave}
              disabled={!currentWorldId}
            >
              <Save className="mr-2 h-4 w-4" />
              {t.header.saveProject}
            </Button>
            <Button
              className="fantasy-button px-4 py-2 text-white font-medium"
              onClick={handleExport}
              disabled={!currentWorldId}
            >
              <Download className="mr-2 h-4 w-4" />
              {t.header.export}
            </Button>
            <LanguageSelector />
            <div className="relative flex items-center">
              <button
                className="p-2 rounded-full bg-purple-700 hover:bg-yellow-400/20 border-2 border-yellow-400 transition-colors duration-200 shadow-md"
                aria-label={muted ? "Увімкнути звук" : "Вимкнути звук"}
                onClick={() => setMuted(!muted)}
              >
                {muted ? (
                  <VolumeX className="h-6 w-6 text-yellow-300" />
                ) : (
                  <Volume2 className="h-6 w-6 text-yellow-300" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="ml-2 w-24 accent-yellow-400 bg-purple-900 rounded-lg h-2 cursor-pointer"
                style={{ accentColor: "#facc15" }}
                aria-label="Гучність"
                disabled={muted}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
