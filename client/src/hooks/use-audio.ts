import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioState {
  isPlaying: boolean;
  isMuted: boolean;
  soundEffectsEnabled: boolean;
  volume: number;
  soundEffectVolume: number;
  currentTrack: string | null;
  currentTrackName: string | null;
  isLoading: boolean;
}

const BACKGROUND_TRACKS = [
  { name: "Epic Quest", file: "/audio/Epic Quest.mp3", mood: "adventurous" },
  { name: "Mythic Realm", file: "/audio/Mythic Realm.mp3", mood: "mystical" },
  { name: "Hero's Rise", file: "/audio/Hero's Rise.mp3", mood: "heroic" },
  { name: "Mystic Realms", file: "/audio/Mystic Realms.mp3", mood: "mystical" },
  { name: "Elysian", file: "/audio/Elysian.mp3", mood: "peaceful" },
  { name: "Valor", file: "/audio/Valor.mp3", mood: "heroic" },
  { name: "DoubleTake", file: "/audio/DoubleTake.mp3", mood: "mysterious" },
  { name: "Epic Realm", file: "/audio/Epic Realm.mp3", mood: "epic" },
  { name: "Epilogue", file: "/audio/Epilogue.mp3", mood: "contemplative" },
  { name: "Epiphany", file: "/audio/Epiphany.mp3", mood: "enlightening" },
  { name: "Hero's Call", file: "/audio/Hero's Call.mp3", mood: "calling" },
  { name: "Heroic Tale", file: "/audio/Heroic Tale.mp3", mood: "legendary" },
  { name: "Mythic Paradox", file: "/audio/Mythic Paradox.mp3", mood: "complex" },
  { name: "Mythic Pulse", file: "/audio/Mythic Pulse.mp3", mood: "rhythmic" },
  { name: "Mythic Pulse2", file: "/audio/Mythic Pulse2.mp3", mood: "rhythmic" },
  { name: "Mythic Rise", file: "/audio/Mythic Rise.mp3", mood: "ascending" },
  { name: "Mythic", file: "/audio/Mythic.mp3", mood: "ancient" },
  { name: "Quest", file: "/audio/Quest.mp3", mood: "adventurous" },
  { name: "The Vanguard", file: "/audio/The Vanguard.mp3", mood: "triumphant" }
];

const SOUND_EFFECTS = {
  magicChime: "/audio/magic-chime.wav",
  parchmentRustle: "/audio/parchment-rustle.wav",
  quillButton: "/audio/quill-button.wav"
};

export function useAudio() {
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    isMuted: false,
    soundEffectsEnabled: true,
    volume: 0.6,
    soundEffectVolume: 0.8,
    currentTrack: null,
    currentTrackName: null,
    isLoading: false
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackIndex = useRef<number>(0);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('audioSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setState(prev => ({ ...prev, ...settings }));
      } catch (e) {
        console.warn('Failed to load audio settings');
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newState: Partial<AudioState>) => {
    const settingsToSave = {
      volume: newState.volume ?? state.volume,
      soundEffectVolume: newState.soundEffectVolume ?? state.soundEffectVolume,
      isMuted: newState.isMuted ?? state.isMuted,
      soundEffectsEnabled: newState.soundEffectsEnabled ?? state.soundEffectsEnabled
    };
    localStorage.setItem('audioSettings', JSON.stringify(settingsToSave));
  }, [state]);

  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      audio.volume = state.volume;
      audio.preload = 'auto';
      
      audio.addEventListener('loadstart', () => {
        setState(prev => ({ ...prev, isLoading: true }));
      });
      
      audio.addEventListener('canplaythrough', () => {
        setState(prev => ({ ...prev, isLoading: false }));
      });
      
      audio.addEventListener('ended', () => {
        nextTrack();
      });
      
      audio.addEventListener('error', (e) => {
        console.warn('Audio loading error:', e);
        setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
      });
      
      audioRef.current = audio;
    }
  }, [state.volume]);

  const togglePlay = useCallback(() => {
    initializeAudio();
    
    if (audioRef.current) {
      if (state.isPlaying) {
        audioRef.current.pause();
        setState(prev => ({ ...prev, isPlaying: false }));
      } else {
        if (!state.currentTrack) {
          playTrack(BACKGROUND_TRACKS[0].file, BACKGROUND_TRACKS[0].name);
        } else {
          audioRef.current.play().catch(e => {
            console.warn('Audio play failed:', e);
          });
          setState(prev => ({ ...prev, isPlaying: true }));
        }
      }
    }
  }, [state.isPlaying, state.currentTrack]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !state.isMuted;
    }
    const newMuted = !state.isMuted;
    setState(prev => ({ ...prev, isMuted: newMuted }));
    saveSettings({ isMuted: newMuted });
  }, [state.isMuted, saveSettings]);

  const toggleSoundEffects = useCallback(() => {
    const newEnabled = !state.soundEffectsEnabled;
    setState(prev => ({ ...prev, soundEffectsEnabled: newEnabled }));
    saveSettings({ soundEffectsEnabled: newEnabled });
  }, [state.soundEffectsEnabled, saveSettings]);

  const setVolumeLevel = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    setState(prev => ({ ...prev, volume }));
    saveSettings({ volume });
  }, [saveSettings]);

  const setSoundEffectVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, soundEffectVolume: volume }));
    saveSettings({ soundEffectVolume: volume });
  }, [saveSettings]);

  const playTrack = useCallback((trackUrl: string, trackName?: string) => {
    initializeAudio();
    
    if (audioRef.current) {
      setState(prev => ({ ...prev, isLoading: true }));
      
      audioRef.current.src = trackUrl;
      audioRef.current.volume = state.volume;
      audioRef.current.muted = state.isMuted;
      
      audioRef.current.play().then(() => {
        setState(prev => ({ 
          ...prev, 
          currentTrack: trackUrl,
          currentTrackName: trackName || trackUrl.split('/').pop()?.replace('.mp3', '') || 'Unknown',
          isPlaying: true,
          isLoading: false
        }));
      }).catch(e => {
        console.warn('Audio play failed:', e);
        setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
      });
    }
  }, [state.volume, state.isMuted, initializeAudio]);

  const nextTrack = useCallback(() => {
    currentTrackIndex.current = (currentTrackIndex.current + 1) % BACKGROUND_TRACKS.length;
    const nextTrack = BACKGROUND_TRACKS[currentTrackIndex.current];
    playTrack(nextTrack.file, nextTrack.name);
  }, [playTrack]);

  const previousTrack = useCallback(() => {
    currentTrackIndex.current = currentTrackIndex.current === 0 
      ? BACKGROUND_TRACKS.length - 1 
      : currentTrackIndex.current - 1;
    const prevTrack = BACKGROUND_TRACKS[currentTrackIndex.current];
    playTrack(prevTrack.file, prevTrack.name);
  }, [playTrack]);

  const playRandomTrack = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * BACKGROUND_TRACKS.length);
    currentTrackIndex.current = randomIndex;
    const randomTrack = BACKGROUND_TRACKS[randomIndex];
    playTrack(randomTrack.file, randomTrack.name);
  }, [playTrack]);

  const playTrackByMood = useCallback((mood: string) => {
    const moodTracks = BACKGROUND_TRACKS.filter(track => track.mood === mood);
    if (moodTracks.length > 0) {
      const randomTrack = moodTracks[Math.floor(Math.random() * moodTracks.length)];
      const trackIndex = BACKGROUND_TRACKS.findIndex(t => t.file === randomTrack.file);
      currentTrackIndex.current = trackIndex;
      playTrack(randomTrack.file, randomTrack.name);
    }
  }, [playTrack]);

  const playSound = useCallback((soundKey: keyof typeof SOUND_EFFECTS | string) => {
    if (!state.soundEffectsEnabled || state.isMuted) return;
    
    const soundUrl = soundKey in SOUND_EFFECTS 
      ? SOUND_EFFECTS[soundKey as keyof typeof SOUND_EFFECTS]
      : soundKey;
    
    const sound = new Audio(soundUrl);
    sound.volume = state.soundEffectVolume * 0.7;
    sound.play().catch(e => {
      console.warn('Sound effect play failed:', e);
    });
  }, [state.soundEffectsEnabled, state.isMuted, state.soundEffectVolume]);

  const playContextSound = useCallback((context: 'modal' | 'button' | 'magic' | 'scroll' | 'success' | 'error') => {
    const contextSounds = {
      modal: 'parchmentRustle',
      button: 'quillButton',
      magic: 'magicChime',
      scroll: 'parchmentRustle',
      success: 'magicChime',
      error: 'quillButton'
    };
    
    playSound(contextSounds[context] || 'quillButton');
  }, [playSound]);

  return {
    ...state,
    tracks: BACKGROUND_TRACKS,
    togglePlay,
    toggleMute,
    toggleSoundEffects,
    setVolume: setVolumeLevel,
    setSoundEffectVolume,
    playTrack,
    nextTrack,
    previousTrack,
    playRandomTrack,
    playTrackByMood,
    playSound,
    playContextSound
  };
}

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
