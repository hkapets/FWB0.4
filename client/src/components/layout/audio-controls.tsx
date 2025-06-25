import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Volume2, 
  VolumeX, 
  Music, 
  Upload, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Shuffle, 
  Loader2,
  Headphones
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAudio } from "@/hooks/use-audio";
import { useTranslation } from "@/lib/i18n";
import { AudioVisualizer } from "@/components/shared/audio-visualizer";

const MOOD_COLORS = {
  adventurous: "bg-green-600",
  mystical: "bg-purple-600", 
  heroic: "bg-blue-600",
  peaceful: "bg-emerald-600",
  mysterious: "bg-indigo-600",
  epic: "bg-red-600",
  contemplative: "bg-gray-600",
  enlightening: "bg-yellow-600",
  calling: "bg-orange-600",
  legendary: "bg-amber-600",
  complex: "bg-violet-600",
  rhythmic: "bg-pink-600",
  ascending: "bg-sky-600",
  ancient: "bg-stone-600",
  triumphant: "bg-gold-600"
};

export function AudioControls() {
  const { 
    isPlaying, 
    isMuted, 
    soundEffectsEnabled,
    currentTrackName, 
    volume,
    soundEffectVolume,
    isLoading,
    tracks,
    togglePlay, 
    toggleMute, 
    toggleSoundEffects,
    setVolume,
    setSoundEffectVolume,
    playTrack,
    nextTrack,
    previousTrack,
    playRandomTrack,
    playTrackByMood,
    playContextSound
  } = useAudio();
  
  const t = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTrackSelect = (track: { name: string; file: string }) => {
    playTrack(track.file, track.name);
    playContextSound('magic');
  };

  const handleCustomMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const name = file.name.replace(/\.[^/.]+$/, "");
      playTrack(url, name);
      playContextSound('success');
    }
  };

  const handleMoodSelect = (mood: string) => {
    playTrackByMood(mood);
    playContextSound('magic');
  };

  const uniqueMoods = [...new Set(tracks.map(track => track.mood))];

  return (
    <div className="flex items-center gap-1">
      {/* Sound Effects Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          toggleSoundEffects();
          playContextSound('button');
        }}
        className={`text-yellow-200 hover:text-yellow-100 hover:bg-purple-800/50 ${
          !soundEffectsEnabled ? 'opacity-50' : ''
        }`}
        title={soundEffectsEnabled ? "Вимкнути звукові ефекти" : "Увімкнути звукові ефекти"}
      >
        <Headphones className="w-4 h-4" />
      </Button>

      {/* Main Audio Controls */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-yellow-200 hover:text-yellow-100 hover:bg-purple-800/50 relative"
            title="Аудіо контроли"
            onClick={() => playContextSound('button')}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Music className="w-4 h-4" />
            )}
            {isPlaying && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-80 bg-gray-900/95 border border-yellow-600/20 backdrop-blur-sm"
        >
          {/* Current Track Info */}
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-200">
                🎵 Фонова музика
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toggleMute();
                  playContextSound('button');
                }}
                className="text-yellow-200 hover:text-yellow-100"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
            
            {currentTrackName && (
              <div className="text-xs text-gray-300 mb-3 p-2 bg-purple-900/30 rounded">
                <span className="text-yellow-300">Грає:</span> {currentTrackName}
                <div className="mt-2">
                  <AudioVisualizer width={240} height={40} barCount={24} />
                </div>
              </div>
            )}

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  previousTrack();
                  playContextSound('button');
                }}
                className="text-yellow-200 hover:text-yellow-100"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  togglePlay();
                  playContextSound('button');
                }}
                className="text-yellow-200 hover:text-yellow-100"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  nextTrack();
                  playContextSound('button');
                }}
                className="text-yellow-200 hover:text-yellow-100"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  playRandomTrack();
                  playContextSound('magic');
                }}
                className="text-yellow-200 hover:text-yellow-100"
                title="Випадковий трек"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>

            {/* Volume Controls */}
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Гучність музики: {Math.round(volume * 100)}%
                </label>
                <Slider
                  value={[volume * 100]}
                  onValueChange={([value]) => setVolume(value / 100)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Гучність ефектів: {Math.round(soundEffectVolume * 100)}%
                </label>
                <Slider
                  value={[soundEffectVolume * 100]}
                  onValueChange={([value]) => setSoundEffectVolume(value / 100)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Mood Selection */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-yellow-200">
              🎭 Вибір за настроєм
            </DropdownMenuLabel>
            <div className="px-2 pb-2">
              <div className="grid grid-cols-2 gap-1">
                {uniqueMoods.slice(0, 6).map((mood) => (
                  <Badge
                    key={mood}
                    variant="outline"
                    className={`cursor-pointer text-xs py-1 px-2 hover:bg-purple-700/50 border-gray-600 text-gray-200 hover:text-yellow-200 transition-colors`}
                    onClick={() => handleMoodSelect(mood)}
                  >
                    {mood}
                  </Badge>
                ))}
              </div>
            </div>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Track List */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-yellow-200">
              🎼 Доступні треки
            </DropdownMenuLabel>
            <div className="max-h-48 overflow-y-auto">
              {tracks.map((track) => (
                <DropdownMenuItem
                  key={track.file}
                  onClick={() => handleTrackSelect(track)}
                  className="text-gray-200 hover:text-yellow-200 hover:bg-purple-800/50 flex items-center justify-between"
                >
                  <span>🎵 {track.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ml-2 ${MOOD_COLORS[track.mood] || 'bg-gray-600'} text-white border-none`}
                  >
                    {track.mood}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Custom Music Upload */}
          <div className="p-2">
            <label className="flex items-center gap-2 text-sm text-gray-300 hover:text-yellow-200 cursor-pointer p-2 rounded hover:bg-purple-800/30">
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