/**
 * JudeAudioContext — Global audio manager for Jude voice playback.
 *
 * Ensures only one Jude voice clip plays at a time and ducks the music player
 * volume to ~20% while Jude is speaking. Restores volume on stop/end/error.
 *
 * Must be mounted AFTER MusicPlayerProvider in the provider stack.
 */

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { toast } from 'sonner';

/** Volume level applied to music while Jude speaks (0-100 scale) */
const DUCK_VOLUME = 10;

interface JudeAudioContextType {
  /** Play an audio URL — stops any currently playing Jude audio first */
  speak: (audioUrl: string) => Promise<void>;
  /** Stop current Jude audio and restore music volume */
  stop: () => void;
  /** Whether Jude is currently speaking */
  isSpeaking: boolean;
  /** Whether the last playback attempt failed */
  isError: boolean;
}

const JudeAudioContext = createContext<JudeAudioContextType | null>(null);

/** Safe defaults — prevents crashes if used outside provider tree */
const SAFE_DEFAULTS: JudeAudioContextType = {
  speak: async () => {},
  stop: () => {},
  isSpeaking: false,
  isError: false,
};

export function JudeAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isError, setIsError] = useState(false);

  // Music ducking — save pre-duck volume to restore later
  const { volume, setVolume, isPlaying: isMusicPlaying } = useMusicPlayer();
  const preDuckVolumeRef = useRef(volume);
  const isDuckedRef = useRef(false);

  /** Duck music volume — only if music is actually playing */
  /** Duck unconditionally — don't gate on isMusicPlaying to avoid stale closure skips */
  const duckMusic = useCallback(() => {
    if (!isDuckedRef.current) {
      preDuckVolumeRef.current = volume;
      setVolume(DUCK_VOLUME);
      isDuckedRef.current = true;
    }
  }, [volume, setVolume]);

  /** Restore music volume after ducking */
  const restoreMusic = useCallback(() => {
    if (isDuckedRef.current) {
      setVolume(preDuckVolumeRef.current);
      isDuckedRef.current = false;
    }
  }, [setVolume]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current = null;
    }
    setIsSpeaking(false);
    restoreMusic();
  }, [restoreMusic]);

  const speak = useCallback(async (audioUrl: string) => {
    // Stop any currently playing Jude audio first
    stop();

    // Duck music before starting playback
    duckMusic();

    const audio = new Audio(audioUrl);
    /** Jude playback volume — 0.75 = 75% to avoid overpowering */
    audio.volume = 0.90;
    audioRef.current = audio;

    audio.onended = () => {
      setIsSpeaking(false);
      restoreMusic();
      audioRef.current = null;
    };

    audio.onerror = () => {
      setIsSpeaking(false);
      setIsError(true);
      restoreMusic();
      audioRef.current = null;
      toast.error('Impossible de lire la voix de Jude.');
    };

    setIsError(false);
    setIsSpeaking(true);

    try {
      await audio.play();
    } catch {
      // Autoplay blocked or network error — handled by onerror
      setIsSpeaking(false);
      setIsError(true);
      restoreMusic();
    }
  }, [stop, duckMusic, restoreMusic]);

  // Cleanup on unmount — stop audio and restore music
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <JudeAudioContext.Provider value={{ speak, stop, isSpeaking, isError }}>
      {children}
    </JudeAudioContext.Provider>
  );
}

/** Hook to access the Jude audio manager — safe to use outside provider tree */
export const useJudeAudio = (): JudeAudioContextType => {
  const context = useContext(JudeAudioContext);
  if (!context) return SAFE_DEFAULTS;
  return context;
};
