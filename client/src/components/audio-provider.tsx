import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useAudio } from "@/hooks/use-audio";

const PLAYLIST = [
  "DoubleTake.mp3",
  "Elysian.mp3",
  "Epic Quest.mp3",
  "Epic Realm.mp3",
  "Epiphany.mp3",
  "magic-chime.mp3",
  "Mystic Realms.mp3",
  "Mythic Pulse.mp3",
  "Mythic Realm.mp3",
  "Mythic Rise.mp3",
  "Mythic.mp3",
  "parchment-rustle.mp3",
  "The Vanguard.mp3",
  "Valor.mp3",
].map((song) => `/audio/${song}`);

const UI_SOUND_URL = "/audio/quill-button.mp3";

interface AudioContextProps {
  muted: boolean;
  setMuted: (m: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
  playEffect: (url?: string) => void;
  nextTrack: () => void;
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
  const [volume, setVolume] = useState(1);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const handleNextTrack = useCallback(() => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % PLAYLIST.length);
  }, []);

  const music = useAudio({
    src: PLAYLIST[currentTrackIndex],
    volume,
    muted,
    loop: false,
    onEnded: handleNextTrack,
    autoPlay: !muted, // Autoplay if not muted initially
  });

  const playEffect = (url: string = UI_SOUND_URL) => {
    const audio = new Audio(url);
    audio.volume = muted ? 0 : volume;
    audio.play();
  };

  React.useEffect(() => {
    const playMusicOnFirstInteraction = () => {
      if (!muted) {
        music.play()?.catch(() => {});
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
  }, [music, muted]);

  React.useEffect(() => {
    if (muted) {
      music.pause();
    } else {
      music.play()?.catch(() => {});
    }
  }, [muted, music]);

  const value = useMemo(
    () => ({
      muted,
      setMuted,
      volume,
      setVolume,
      playEffect,
      nextTrack: handleNextTrack,
    }),
    [muted, volume, handleNextTrack]
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};
