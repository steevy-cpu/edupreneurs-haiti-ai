import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseElevenLabsTTSOptions {
  subjectSlug: string;
  lessonSlug: string;
  text: string;
}

interface UseElevenLabsTTSReturn {
  isLoading: boolean;
  isPlaying: boolean;
  error: string | null;
  audioUrl: string | null;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  currentTime: number;
  duration: number;
}

export const useElevenLabsTTS = ({
  subjectSlug,
  lessonSlug,
  text,
}: UseElevenLabsTTSOptions): UseElevenLabsTTSReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for cached audio on mount
  useEffect(() => {
    const checkCachedAudio = async () => {
      try {
        const audioPath = `${subjectSlug}/${lessonSlug}.mp3`;
        const { data } = supabase.storage
          .from('lesson-audio')
          .getPublicUrl(audioPath);
        
        // Test if the URL is valid by making a HEAD request
        const response = await fetch(data.publicUrl, { method: 'HEAD' });
        if (response.ok) {
          setAudioUrl(data.publicUrl);
          console.log('Found cached audio:', data.publicUrl);
        }
      } catch (err) {
        // No cached audio found, will generate on first play
        console.log('No cached audio found, will generate on demand');
      }
    };

    if (subjectSlug && lessonSlug) {
      checkCachedAudio();
    }
  }, [subjectSlug, lessonSlug]);

  // Setup audio element and event listeners
  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setError('Erreur de lecture audio');
        setIsPlaying(false);
      });
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [audioUrl]);

  const generateAudio = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text,
            subjectSlug,
            lessonSlug,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération audio');
      }

      const data = await response.json();
      setAudioUrl(data.audioUrl);
      
      // Create new audio element with the URL
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;
      
      return audio;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [text, subjectSlug, lessonSlug]);

  const play = useCallback(async () => {
    try {
      let audio = audioRef.current;
      
      // Generate audio if not available
      if (!audio || !audioUrl) {
        audio = await generateAudio();
        
        // Wait for audio to be ready
        await new Promise<void>((resolve, reject) => {
          audio!.addEventListener('canplaythrough', () => resolve(), { once: true });
          audio!.addEventListener('error', () => reject(new Error('Audio load failed')), { once: true });
          audio!.load();
        });
      }

      await audio!.play();
      setIsPlaying(true);

      // Update current time
      intervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }, 100);

    } catch (err) {
      console.error('Play error:', err);
      setError('Impossible de lire l\'audio');
      setIsPlaying(false);
    }
  }, [audioUrl, generateAudio]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    isPlaying,
    error,
    audioUrl,
    play,
    pause,
    stop,
    currentTime,
    duration,
  };
};
