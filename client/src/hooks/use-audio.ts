import { useRef, useEffect, useCallback } from "react";

export function useAudio({
  src,
  volume = 1,
  loop = false,
  muted = false,
  autoPlay = false,
  onEnded,
}: {
  src: string;
  volume?: number;
  loop?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  onEnded?: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Effect for creating/changing the audio source and managing event listeners
  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;
    audio.crossOrigin = "anonymous";
    audio.loop = loop;
    audio.volume = volume;
    audio.muted = muted;

    if (autoPlay) {
      audio.play().catch((e) => console.error("Audio autoplay failed:", e));
    }

    const handleEnded = () => onEnded?.();
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      audioRef.current = null;
    };
  }, [src, autoPlay, onEnded]); // Note: loop, volume, muted are not here

  // Separate effects to update properties without restarting the track
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = loop;
  }, [loop]);

  const play = useCallback(() => {
    return audioRef.current?.play();
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
