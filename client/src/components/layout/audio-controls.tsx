import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Music, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAudio } from "@/hooks/use-audio";
import { useTranslation } from "@/lib/i18n";

const backgroundMusicTracks = [
  { name: "Epic Quest", file: "/audio/Epic Quest.mp3" },
  { name: "Mythic Realm", file: "/audio/Mythic Realm.mp3" },
  { name: "Hero's Rise", file: "/audio/Hero's Rise.mp3" },
  { name: "Mystic Realms", file: "/audio/Mystic Realms.mp3" },
  { name: "Elysian", file: "/audio/Elysian.mp3" },
  { name: "Valor", file: "/audio/Valor.mp3" },
];

export function AudioControls() {
  const { 
    isPlaying, 
    isMuted, 
    currentTrack, 
    volume,
    togglePlay, 
    toggleMute, 
    setVolume,
    playTrack,
    playSound 
  } = useAudio();
  
  const t = useTranslation();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const handleTrackSelect = (track: { name: string; file: string }) => {
    playTrack(track.file);
  };

  const handleCustomMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      playTrack(url);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Sound Effects Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMute}
        className="text-yellow-200 hover:text-yellow-100 hover:bg-purple-800/50"
        title={isMuted ? "Увімкнути звуки" : "Вимкнути звуки"}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </Button>

      {/* Background Music Controls */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-yellow-200 hover:text-yellow-100 hover:bg-purple-800/50"
            title="Фонова музика"
          >
            <Music className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-64 bg-gray-900/95 border border-yellow-600/20"
        >
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-200">Фонова музика</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-yellow-200 hover:text-yellow-100"
              >
                {isPlaying ? "⏸️" : "▶️"}
              </Button>
            </div>
            
            {currentTrack && (
              <div className="text-xs text-gray-400 mb-2">
                Грає: {currentTrack.split('/').pop()?.replace('.mp3', '')}
              </div>
            )}

            {/* Volume Control */}
            <div className="mb-2">
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          <DropdownMenuSeparator />

          <div className="max-h-48 overflow-y-auto">
            {backgroundMusicTracks.map((track) => (
              <DropdownMenuItem
                key={track.file}
                onClick={() => handleTrackSelect(track)}
                className="text-gray-200 hover:text-yellow-200 hover:bg-purple-800/50"
              >
                🎵 {track.name}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator />

          {/* Custom Music Upload */}
          <div className="p-2">
            <label className="flex items-center gap-2 text-sm text-gray-300 hover:text-yellow-200 cursor-pointer">
              <Upload className="w-4 h-4" />
              Завантажити свою музику
              <input
                type="file"
                accept="audio/*"
                onChange={handleCustomMusicUpload}
                className="hidden"
              />
            </label>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}