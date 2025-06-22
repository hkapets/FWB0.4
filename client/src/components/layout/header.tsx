import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import LanguageSelector from "@/components/ui/language-selector";
import { useTranslation } from "@/lib/i18n";
import { useAudioContext } from "@/components/audio-provider";
import GlobalSearch from "@/components/global-search";
import { Link } from "wouter";
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
  const t = useTranslation();
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
    <header className="fixed top-0 left-0 w-full h-16 flex items-center px-6 bg-gradient-to-r from-purple-900 via-gray-900 to-purple-800 shadow-lg z-50 fantasy-border">
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center w-full">
          <Link href="/" className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="text-purple-900 text-xl" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-fantasy font-bold text-yellow-200">
              Fantasy World Builder
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <GlobalSearch />
            <Button
              className="fantasy-button px-3 py-2 text-sm text-white font-medium whitespace-nowrap"
              onClick={handleSave}
              disabled={!currentWorldId}
            >
              {t.header.saveProject}
            </Button>
            <Button
              className="fantasy-button px-3 py-2 text-sm text-white font-medium whitespace-nowrap"
              onClick={handleExport}
              disabled={!currentWorldId}
            >
              {t.header.export}
            </Button>
            <LanguageSelector />
            <div className="relative flex items-center gap-2">
              <Popover open={isAudioOpen} onOpenChange={setIsAudioOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="fantasy-button text-white hover:text-gold-300"
                  >
                    <Music className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 fantasy-border bg-gradient-to-br from-purple-900/90 to-purple-800/90 backdrop-blur-md border-purple-600/50 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-fantasy text-gold-400">
                        Аудіо
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMuted(!muted)}
                        className="text-white hover:text-gold-300"
                      >
                        {muted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-300 mb-1">
                        Поточний трек:
                      </p>
                      <p className="text-white font-medium truncate">
                        {getCurrentTrackName()}
                      </p>
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

                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={previousTrack}
                        className="text-white hover:text-gold-300"
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePlay}
                        className="text-white hover:text-gold-300"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextTrack}
                        className="text-white hover:text-gold-300"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>

                    {!muted && (
                      <div className="space-y-2">
                        <label className="text-sm text-gray-300">
                          Гучність:
                        </label>
                        <Slider
                          value={[volume * 100]}
                          onValueChange={([value]) => setVolume(value / 100)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="text-center text-sm text-gray-400">
                          {Math.round(volume * 100)}%
                        </div>
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
