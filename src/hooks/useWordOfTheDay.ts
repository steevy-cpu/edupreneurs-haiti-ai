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
  display_order: number | null;
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

const CACHED_WORD_KEY = 'cached_daily_word_v3';

// Get today's date in Haiti timezone (YYYY-MM-DD format)
const getHaitiDate = (): string => {
  return new Date().toLocaleDateString('en-CA', { 
    timeZone: 'America/Port-au-Prince' 
  });
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

  // Fetch word of the day using sequential rotation
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

        // Get current rotation state from app_settings
        const { data: settings } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'word_of_day')
          .maybeSingle();

        const settingsValue = settings?.value as { last_date?: string; last_order?: number } | null;
        const lastDate = settingsValue?.last_date;
        const lastOrder = settingsValue?.last_order || 0;
        
        let currentOrder = lastOrder;
        let needsUpdate = false;

        // If it's a new day, advance to next word
        if (lastDate !== haitiDate) {
          // Get max display_order
          const { data: maxData } = await supabase
            .from('daily_words')
            .select('display_order')
            .eq('is_active', true)
            .order('display_order', { ascending: false })
            .limit(1)
            .single();

          const maxOrder = maxData?.display_order || 1;
          currentOrder = (lastOrder % maxOrder) + 1;
          needsUpdate = true;
        }

        // Fetch the word with this display_order
        const { data: wordData, error: wordError } = await supabase
          .from('daily_words')
          .select('id, word, phonetic, part_of_speech, definition, example, audio_url, category, display_order')
          .eq('is_active', true)
          .eq('display_order', currentOrder)
          .maybeSingle();

        // Fallback to first active word if display_order not found
        let finalWord: DailyWord | null = wordData;
        if (!wordData) {
          const { data: fallbackWord } = await supabase
            .from('daily_words')
            .select('id, word, phonetic, part_of_speech, definition, example, audio_url, category, display_order')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .limit(1)
            .single();
          
          finalWord = fallbackWord;
          if (fallbackWord) {
            currentOrder = fallbackWord.display_order || 1;
          }
        }

        // On slow connections, clear audio_url to defer loading
        if (finalWord && shouldDeferAudio) {
          finalWord = { ...finalWord, audio_url: null };
        }

        // Update rotation state if it's a new day (only for authenticated users)
        if (needsUpdate && !isVisitor) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Use RPC to update (security definer function)
            await supabase.rpc('update_app_setting', {
              _key: 'word_of_day',
              _value: { last_date: haitiDate, last_order: currentOrder }
            });
          }
        }

        // Track for authenticated users (analytics)
        if (finalWord && !isVisitor) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Track which word was shown today (fire and forget)
            supabase
              .from('user_daily_word')
              .upsert(
                { user_id: user.id, word_id: finalWord.id, date: haitiDate },
                { onConflict: 'user_id,date', ignoreDuplicates: true }
              )
              .then(() => {});
          }
        }

        setWord(finalWord);

        // Cache the word for future instant loads (3G optimization)
        if (finalWord) {
          localStorage.setItem(CACHED_WORD_KEY, JSON.stringify({
            word: finalWord,
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

      // Generate audio on-demand if none exists (founders only - will fail for regular users)
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
      toast.error('Audio non disponible pour ce mot');
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
