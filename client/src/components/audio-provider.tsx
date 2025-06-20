import React, { createContext, useContext, useState, useMemo } from "react";
import { useAudio } from "@/hooks/use-audio";

// Fantasy background music (замінити на свій файл або URL)
const MUSIC_URL =
  "https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b6b6b6.mp3";
// Fantasy UI sound (замінити на свій файл або URL)
const UI_SOUND_URL =
  "https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b6b6b6.mp3";

interface AudioContextProps {
  muted: boolean;
  setMuted: (m: boolean) => void;
  volume: number;
  setVolume: (v: number) => void;
  playEffect: (url?: string) => void;
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

  // Фонова музика
  const music = useAudio({
    src: MUSIC_URL,
    volume,
    muted,
    loop: true,
    autoPlay: true,
  });

  // Програвання ефекту (одноразово)
  const playEffect = (url: string = UI_SOUND_URL) => {
    const audio = new Audio(url);
    audio.volume = muted ? 0 : volume;
    audio.play();
  };

  // Автоматично відтворювати/зупиняти музику при mute
  React.useEffect(() => {
    if (muted) music.pause();
    else music.play();
  }, [muted]);

  React.useEffect(() => {
    music.setVolume(volume);
  }, [volume]);

  const value = useMemo(
    () => ({ muted, setMuted, volume, setVolume, playEffect }),
    [muted, volume]
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};
