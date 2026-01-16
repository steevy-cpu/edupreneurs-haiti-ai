import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVisitor } from '@/contexts/VisitorContext';
import { useNetworkAwareLoading } from '@/hooks/useNetworkAwareLoading';
import { toast } from 'sonner';

export interface DailyWord {
  id: string;
  word: string;
  phonetic: string;
  part_of_speech: string;
  definition: string;
  example: string;
  audio_url: string | null;
  category: string | null;
}

interface UseWordOfTheDayReturn {
  word: DailyWord | null;
  isLoading: boolean;
  isPlaying: boolean;
  isGenerating: boolean;
  playAudio: () => void;
  stopAudio: () => void;
  error: string | null;
  shouldDeferAudio: boolean;
}

const CACHED_WORD_KEY = 'cached_daily_word';

// Get today's date in Haiti timezone (YYYY-MM-DD format)
const getHaitiDate = (): string => {
  return new Date().toLocaleDateString('en-CA', { 
    timeZone: 'America/Port-au-Prince' 
  });
};

// Deterministic word selection based on date - ensures same word for everyone
const getGlobalWordIndex = (date: string, totalWords: number): number => {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = ((hash << 5) - hash) + date.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash) % totalWords;
};

export const useWordOfTheDay = (): UseWordOfTheDayReturn => {
  const { isVisitor } = useVisitor();
  const { isSlowConnection, loadingStrategy } = useNetworkAwareLoading();
  const [word, setWord] = useState<DailyWord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Defer audio on slow connections
  const shouldDeferAudio = isSlowConnection || loadingStrategy === 'minimal';

  // Fetch word of the day - same word until midnight Haiti time
  useEffect(() => {
    const fetchWord = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const haitiDate = getHaitiDate();
        
        // Check localStorage cache first (for ALL users - 3G optimization)
        const cached = localStorage.getItem(CACHED_WORD_KEY);
        if (cached) {
          try {
            const { word: cachedWord, date } = JSON.parse(cached);
            if (date === haitiDate && cachedWord) {
              setWord(cachedWord);
              setIsLoading(false);
              // Don't return yet for authenticated users - validate in background
              if (isVisitor) return;
            }
          } catch {
            // Invalid cache, continue to fetch
          }
        }

        // Fetch all active words (ordered for consistent selection)
        const { data: allWords, error: wordsError } = await supabase
          .from('daily_words')
          .select('id, word, phonetic, part_of_speech, definition, example, audio_url, category')
          .eq('is_active', true)
          .order('id', { ascending: true });

        if (wordsError) throw wordsError;

        let wordData: DailyWord | null = null;

        if (allWords && allWords.length > 0) {
          // Use deterministic selection based on today's date
          const wordIndex = getGlobalWordIndex(haitiDate, allWords.length);
          const rawWord = allWords[wordIndex];
          
          // On slow connections, clear audio_url to defer loading
          wordData = shouldDeferAudio 
            ? { ...rawWord, audio_url: null }
            : rawWord;

          // Optionally track for authenticated users (analytics)
          const { data: { user } } = await supabase.auth.getUser();
          if (user && !isVisitor) {
            // Track which word was shown today (fire and forget)
            supabase
              .from('user_daily_word')
              .upsert(
                { user_id: user.id, word_id: rawWord.id, date: haitiDate },
                { onConflict: 'user_id,date', ignoreDuplicates: true }
              )
              .then(() => {});
          }
        }

        setWord(wordData);

        // Cache the word for future instant loads (3G optimization)
        if (wordData) {
          localStorage.setItem(CACHED_WORD_KEY, JSON.stringify({
            word: wordData,
            date: haitiDate
          }));
        }
      } catch (err) {
        console.error('Error fetching word of the day:', err);
        setError('Erreur lors du chargement du mot du jour');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWord();
  }, [isVisitor, shouldDeferAudio]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playAudio = useCallback(async () => {
    if (!word) return;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // If audio exists, play it directly
    if (word.audio_url) {
      const audio = new Audio(word.audio_url);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        console.error('Error playing audio');
      };

      audio.play().catch(err => {
        console.error('Error starting playback:', err);
        setIsPlaying(false);
      });
      return;
    }

    // Otherwise, fetch audio URL first (for deferred loading) or generate on-demand
    setIsGenerating(true);
    try {
      // First try to fetch the audio_url if we deferred it
      if (shouldDeferAudio) {
        const { data: wordWithAudio } = await supabase
          .from('daily_words')
          .select('audio_url')
          .eq('id', word.id)
          .single();

        if (wordWithAudio?.audio_url) {
          setWord(prev => prev ? { ...prev, audio_url: wordWithAudio.audio_url } : null);
          
          const audio = new Audio(wordWithAudio.audio_url);
          audioRef.current = audio;

          audio.onplay = () => setIsPlaying(true);
          audio.onended = () => setIsPlaying(false);
          audio.onerror = () => {
            setIsPlaying(false);
            console.error('Error playing audio');
          };

          await audio.play();
          setIsGenerating(false);
          return;
        }
      }

      // Generate audio on-demand if none exists
      const response = await supabase.functions.invoke('generate-word-audio', {
        body: { wordId: word.id, word: word.word }
      });

      if (response.error) {
        throw response.error;
      }

      if (response.data?.audioUrl) {
        // Update local state with new audio URL
        setWord(prev => prev ? { ...prev, audio_url: response.data.audioUrl } : null);

        // Play the newly generated audio
        const audio = new Audio(response.data.audioUrl);
        audioRef.current = audio;

        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setIsPlaying(false);
          console.error('Error playing generated audio');
        };

        await audio.play();
      }
    } catch (err) {
      console.error('Error generating audio:', err);
      toast.error('Erreur lors de la génération audio');
    } finally {
      setIsGenerating(false);
    }
  }, [word, shouldDeferAudio]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  return {
    word,
    isLoading,
    isPlaying,
    isGenerating,
    playAudio,
    stopAudio,
    error,
    shouldDeferAudio,
  };
};