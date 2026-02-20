import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNetworkAwareLoading } from '@/hooks/useNetworkAwareLoading';
import { toast } from 'sonner';

// Re-export canonical type so existing imports from this hook still work
export type { DailyWord } from '@/types/dailyWord';
import type { DailyWord } from '@/types/dailyWord';

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
const REFERENCE_DATE = new Date('2026-01-01T00:00:00');

/** Get today's date in Haiti timezone (YYYY-MM-DD) */
const getHaitiDate = (): string => {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Port-au-Prince',
  });
};

/** Pure deterministic function: same date + same word count = same display_order */
const computeDisplayOrder = (haitiDate: string, totalWords: number): number => {
  const today = new Date(haitiDate + 'T00:00:00');
  const daysSince = Math.floor(
    (today.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );
  return (((daysSince % totalWords) + totalWords) % totalWords) + 1;
};

export const useWordOfTheDay = (): UseWordOfTheDayReturn => {
  const { isSlowConnection, loadingStrategy } = useNetworkAwareLoading();
  const [word, setWord] = useState<DailyWord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const shouldDeferAudio = isSlowConnection || loadingStrategy === 'minimal';

  useEffect(() => {
    const fetchWord = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const haitiDate = getHaitiDate();

        // 1. Check localStorage cache
        const cached = localStorage.getItem(CACHED_WORD_KEY);
        if (cached) {
          try {
            const { word: cachedWord, date } = JSON.parse(cached);
            if (date === haitiDate && cachedWord) {
              setWord(cachedWord);
              setIsLoading(false);
              // Still track for authenticated users in background
              trackWordView(cachedWord, haitiDate);
              return;
            }
          } catch {
            // Invalid cache, continue
          }
        }

        // 2. Get count of active words
        const { count, error: countError } = await supabase
          .from('daily_words')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        if (countError || !count || count === 0) {
          setError('Aucun mot disponible');
          setIsLoading(false);
          return;
        }

        // 3. Compute deterministic display_order
        const displayOrder = computeDisplayOrder(haitiDate, count);

        // 4. Fetch the word
        const { data: wordData } = await supabase
          .from('daily_words')
          .select('id, word, phonetic, part_of_speech, definition, example, audio_url, audio_source, category, display_order, is_active, created_at')
          .eq('is_active', true)
          .eq('display_order', displayOrder)
          .maybeSingle();

        // Fallback if display_order gap exists
        let finalWord: DailyWord | null = wordData;
        if (!wordData) {
          const { data: fallbackWord } = await supabase
            .from('daily_words')
            .select('id, word, phonetic, part_of_speech, definition, example, audio_url, audio_source, category, display_order, is_active, created_at')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .limit(1)
            .maybeSingle();
          finalWord = fallbackWord;
        }

        // Defer audio on slow connections
        if (finalWord && shouldDeferAudio) {
          finalWord = { ...finalWord, audio_url: null };
        }

        setWord(finalWord);

        // 5. Cache
        if (finalWord) {
          localStorage.setItem(CACHED_WORD_KEY, JSON.stringify({
            word: finalWord,
            date: haitiDate,
          }));
        }

        // 6. Track (authenticated only, fire-and-forget)
        if (finalWord) {
          trackWordView(finalWord, haitiDate);
        }
      } catch (err) {
        console.error('Error fetching word of the day:', err);
        setError('Erreur lors du chargement du mot du jour');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWord();
  }, [shouldDeferAudio]);

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

    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (word.audio_url) {
      const audio = new Audio(word.audio_url);
      audioRef.current = audio;
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => { setIsPlaying(false); };
      audio.play().catch(() => setIsPlaying(false));
      return;
    }

    setIsGenerating(true);
    try {
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
          audio.onerror = () => { setIsPlaying(false); };
          await audio.play();
          setIsGenerating(false);
          return;
        }
      }

      const response = await supabase.functions.invoke('generate-word-audio', {
        body: { wordId: word.id, word: word.word },
      });

      if (response.error) throw response.error;

      if (response.data?.audioUrl) {
        setWord(prev => prev ? { ...prev, audio_url: response.data.audioUrl } : null);
        const audio = new Audio(response.data.audioUrl);
        audioRef.current = audio;
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => { setIsPlaying(false); };
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

  return { word, isLoading, isPlaying, isGenerating, playAudio, stopAudio, error, shouldDeferAudio };
};

/** Fire-and-forget tracking for authenticated users */
function trackWordView(word: DailyWord, haitiDate: string) {
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
      supabase
        .from('user_daily_word')
        .upsert(
          { user_id: user.id, word_id: word.id, date: haitiDate },
          { onConflict: 'user_id,date', ignoreDuplicates: true }
        )
        .then(() => {});
    }
  });
}
