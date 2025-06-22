import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { useAudio } from "@/hooks/use-audio";

// Динамічний список всіх аудіо файлів
const allAudioFiles = [
  "DoubleTake.mp3",
  "Elysian.mp3",
  "Epic Quest.mp3",
  "Epic Realm.mp3",
  "Epiphany.mp3",
  "Mystic Realms.mp3",
  "Mythic Pulse.mp3",
  "Mythic Realm.mp3",
  "Mythic Rise.mp3",
  "Mythic.mp3",
  "The Vanguard.mp3",
  "Valor.mp3",
  "Epilogue.mp3",
  "Heroic Tale.mp3",
  "Hero's Call.mp3",
  "Hero's Rise.mp3",
  "Mythic Paradox.mp3",
  "Mythic Pulse2.mp3",
  "Quest.mp3",
];

const PLAYLIST_FILES = allAudioFiles.map((song) => `/audio/${song}`);

// Звукові ефекти
const SOUND_EFFECTS = {
  magicChime: "/audio/magic-chime.wav",
  quillButton: "/audio/quill-button.wav",
  parchmentRustle: "/audio/parchment-rustle.wav",
};

interface AudioContextProps {
  muted: boolean;
  setMuted: (m: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
  playEffect: (effect: keyof typeof SOUND_EFFECTS) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  currentTrack: string;
  availableTracks: string[];
  setCurrentTrack: (track: string) => void;
  isPlaying: boolean;
  togglePlay: () => void;
}

const AudioContext = createContext<AudioContextProps | undefined>(undefined);

export function useAudioContext() {
  const ctx = useContext(AudioContext);
  if (!ctx)
    throw new Error("useAudioContext must be used within AudioProvider");
  return ctx;
}

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = PLAYLIST_FILES[currentTrackIndex];

  const handleNextTrack = useCallback(() => {
    setCurrentTrackIndex(
      (prevIndex) => (prevIndex + 1) % PLAYLIST_FILES.length
    );
  }, []);

  const handlePreviousTrack = useCallback(() => {
    setCurrentTrackIndex((prevIndex) =>
      prevIndex === 0 ? PLAYLIST_FILES.length - 1 : prevIndex - 1
    );
  }, []);

  const setCurrentTrack = useCallback((track: string) => {
    const index = PLAYLIST_FILES.indexOf(track);
    if (index !== -1) {
      setCurrentTrackIndex(index);
    }
  }, []);

  const music = useAudio({
    src: currentTrack,
    volume,
    muted,
    loop: false,
    onEnded: handleNextTrack,
    autoPlay: false,
  });

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      music.pause();
      setIsPlaying(false);
    } else {
      music
        .play()
        ?.then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }, [isPlaying, music]);

  const playEffect = useCallback(
    (effect: keyof typeof SOUND_EFFECTS) => {
      if (muted) return;

      const audio = new Audio(SOUND_EFFECTS[effect]);
      audio.volume = volume;
      audio.play().catch(() => {});
    },
    [muted, volume]
  );

  // Автоматичне відтворення після першої взаємодії
  useEffect(() => {
    const playMusicOnFirstInteraction = () => {
      if (!muted && !isPlaying) {
        music
          .play()
          ?.then(() => setIsPlaying(true))
          .catch(() => {});
      }
      window.removeEventListener("click", playMusicOnFirstInteraction);
      window.removeEventListener("keydown", playMusicOnFirstInteraction);
    };

    window.addEventListener("click", playMusicOnFirstInteraction);
    window.addEventListener("keydown", playMusicOnFirstInteraction);

    return () => {
      window.removeEventListener("click", playMusicOnFirstInteraction);
      window.removeEventListener("keydown", playMusicOnFirstInteraction);
    };
  }, [music, muted, isPlaying]);

  // Синхронізація стану відтворення
  useEffect(() => {
    if (muted) {
      music.pause();
      setIsPlaying(false);
    }
  }, [muted, music]);

  // Оновлення треку при зміні індексу
  useEffect(() => {
    if (isPlaying && !muted) {
      music
        .play()
        ?.then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }, [currentTrackIndex, music, isPlaying, muted]);

  const value = useMemo(
    () => ({
      muted,
      setMuted,
      volume,
      setVolume,
      playEffect,
      nextTrack: handleNextTrack,
      previousTrack: handlePreviousTrack,
      currentTrack,
      availableTracks: PLAYLIST_FILES,
      setCurrentTrack,
      isPlaying,
      togglePlay,
    }),
    [
      muted,
      volume,
      playEffect,
      handleNextTrack,
      handlePreviousTrack,
      currentTrack,
      setCurrentTrack,
      isPlaying,
      togglePlay,
    ]
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};
