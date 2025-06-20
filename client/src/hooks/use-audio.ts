import { useRef, useEffect, useCallback } from "react";

export function useAudio({
  src,
  volume = 1,
  loop = true,
  muted = false,
  autoPlay = false,
}: {
  src: string;
  volume?: number;
  loop?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.loop = loop;
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
      if (autoPlay) audioRef.current.play();
    } else {
      audioRef.current.src = src;
      audioRef.current.loop = loop;
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
    return () => {
      audioRef.current?.pause();
    };
  }, [src, loop, volume, muted, autoPlay]);

  const play = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const setMuted = useCallback((m: boolean) => {
    if (audioRef.current) audioRef.current.muted = m;
  }, []);

  return { play, pause, setVolume, setMuted, audio: audioRef.current };
}
