import { Button } from "@/components/ui/button";
import { Save, Download, Crown } from "lucide-react";
import LanguageSelector from "@/components/ui/language-selector";
import { useTranslation } from "@/lib/i18n";

interface HeaderProps {
  currentWorldId: number | null;
}

export default function Header({ currentWorldId }: HeaderProps) {
  const t = useTranslation();
  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving project...");
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting project...");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 fantasy-border bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 shadow-lg border-b border-yellow-500/30">
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
          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </div>
    </header>
  );
}
