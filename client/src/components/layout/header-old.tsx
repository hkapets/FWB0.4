import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Save,
  Download,
  Crown,
  Volume2,
  VolumeX,
  SkipForward,
  Play,
  Pause,
  SkipBack,
  Music,
  Home,
  User,
  Search,
  Settings,
  Menu,
  X,
  Wand2,
  TrendingUp,
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { useAudioContext } from "@/components/audio-provider";
import { AudioControls } from "./audio-controls";
import { LanguageSwitcher } from "./language-switcher";
import AIAssistantModal from "@/components/ai/ai-assistant-modal";
import WorldAnalyticsModal from "@/components/analytics/world-analytics-modal";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeaderProps {
  currentWorldId: number | null;
}

export default function Header({ currentWorldId }: HeaderProps) {
  const [location] = useLocation();
  const t = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
  const worldId = currentWorldId || 1;

  const {
    muted,
    setMuted,
    volume,
    setVolume,
    isPlaying,
    togglePlay,
    nextTrack,
    previousTrack,
    currentTrack,
    availableTracks,
    setCurrentTrack,
  } = useAudioContext();

  const [isAudioOpen, setIsAudioOpen] = useState(false);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving project...");
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting project...");
  };

  const getCurrentTrackName = () => {
    const trackPath = currentTrack;
    const fileName = trackPath.split("/").pop() || "";
    return fileName.replace(".mp3", "");
  };

  return (
    <header className="fixed top-0 left-0 w-full h-18 flex items-center px-6 bg-gradient-to-r from-purple-900/95 via-gray-900/95 to-purple-800/95 backdrop-blur-md shadow-2xl z-50 fantasy-border border-b border-yellow-400/30">
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center w-full py-3">
          <Link href="/" className="flex items-center space-x-4 group">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center ring-2 ring-yellow-400/30 shadow-lg group-hover:ring-yellow-300/50 transition-all duration-300">
              <Crown className="text-purple-900 text-2xl" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-fantasy font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
              Fantasy World Builder
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <GlobalSearch worldId={1} />
            <div className="hidden md:flex items-center gap-3">
              <Button
                className="fantasy-button px-4 py-2 text-sm font-medium"
                onClick={handleSave}
                disabled={!currentWorldId}
              >
                <Save className="w-4 h-4 mr-2" />
                Зберегти
              </Button>
              <Button
                className="fantasy-button px-4 py-2 text-sm font-medium"
                onClick={handleExport}
                disabled={!currentWorldId}
              >
                <Download className="w-4 h-4 mr-2" />
                Експорт
              </Button>
            </div>
            <LanguageSelector />
            <div className="relative flex items-center gap-2">
              <Popover open={isAudioOpen} onOpenChange={setIsAudioOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="fantasy-button text-white hover:text-yellow-300 relative"
                  >
                    <Music className="h-5 w-5" />
                    {isPlaying && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 fantasy-border bg-gradient-to-br from-purple-900/95 to-purple-800/95 backdrop-blur-xl border-yellow-400/30 p-6 shadow-2xl">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-fantasy text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                        Аудіо система
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMuted(!muted)}
                        className="text-white hover:text-yellow-300 p-2"
                      >
                        {muted ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </Button>
                    </div>

                    <div className="text-center bg-gradient-to-r from-purple-800/30 to-purple-700/30 rounded-lg p-4 border border-purple-600/20">
                      <p className="text-sm text-purple-200 mb-2">
                        Поточний трек:
                      </p>
                      <p className="text-yellow-100 font-medium truncate text-lg">
                        {getCurrentTrackName()}
                      </p>
                      <div className="flex items-center justify-center mt-2">
                        <div className={`w-2 h-2 rounded-full mr-2 ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                        <span className="text-xs text-purple-300">
                          {isPlaying ? 'Відтворення' : 'Пауза'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-gray-300">
                        Виберіть трек:
                      </label>
                      <Select
                        value={currentTrack}
                        onValueChange={setCurrentTrack}
                      >
                        <SelectTrigger className="fantasy-input">
                          <SelectValue placeholder="Виберіть трек" />
                        </SelectTrigger>
                        <SelectContent className="fantasy-border bg-purple-900/95 border-purple-600/50">
                          {availableTracks.map((track) => {
                            const trackName =
                              track.split("/").pop()?.replace(".mp3", "") || "";
                            return (
                              <SelectItem
                                key={track}
                                value={track}
                                className="text-white hover:bg-purple-700/50 focus:bg-purple-700/50"
                              >
                                {trackName}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-center space-x-4 bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-lg p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={previousTrack}
                        className="text-white hover:text-yellow-300 hover:bg-yellow-400/10 rounded-full p-2"
                      >
                        <SkipBack className="h-5 w-5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={togglePlay}
                        className="text-white hover:text-yellow-300 hover:bg-yellow-400/20 rounded-full p-3 ring-2 ring-yellow-400/30 hover:ring-yellow-300/50 transition-all"
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6" />
                        ) : (
                          <Play className="h-6 w-6 ml-1" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextTrack}
                        className="text-white hover:text-yellow-300 hover:bg-yellow-400/10 rounded-full p-2"
                      >
                        <SkipForward className="h-5 w-5" />
                      </Button>
                    </div>

                    {!muted && (
                      <div className="space-y-3 bg-gradient-to-r from-gray-800/20 to-gray-700/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-purple-200 font-medium">
                            Гучність:
                          </label>
                          <span className="text-sm text-yellow-300 font-mono">
                            {Math.round(volume * 100)}%
                          </span>
                        </div>
                        <Slider
                          value={[volume * 100]}
                          onValueChange={([value]) => setVolume(value / 100)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

    </header>
  );
}
