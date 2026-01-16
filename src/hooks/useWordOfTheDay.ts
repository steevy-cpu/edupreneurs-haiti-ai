import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVisitor } from '@/contexts/VisitorContext';

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
  isDismissed: boolean;
  isPlaying: boolean;
  playAudio: () => void;
  stopAudio: () => void;
  dismiss: () => void;
  error: string | null;
}

const getDismissKey = (): string => {
  const today = new Date().toISOString().split('T')[0];
  return `word_dismissed_${today}`;
};

export const useWordOfTheDay = (): UseWordOfTheDayReturn => {
  const { isVisitor } = useVisitor();
  const [word, setWord] = useState<DailyWord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check if dismissed today
  useEffect(() => {
    const dismissKey = getDismissKey();
    const dismissed = localStorage.getItem(dismissKey) === 'true';
    setIsDismissed(dismissed);
  }, []);

  // Fetch word of the day
  useEffect(() => {
    if (isDismissed) {
      setIsLoading(false);
      return;
    }

    const fetchWord = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        
        let wordData: DailyWord | null = null;

        if (user && !isVisitor) {
          // For authenticated users, get an unseen word
          const { data: seenWordIds } = await supabase
            .from('user_seen_words')
            .select('word_id')
            .eq('user_id', user.id);

          const seenIds = seenWordIds?.map(sw => sw.word_id) || [];

          let query = supabase
            .from('daily_words')
            .select('id, word, phonetic, part_of_speech, definition, example, audio_url, category')
            .eq('is_active', true);

          if (seenIds.length > 0) {
            query = query.not('id', 'in', `(${seenIds.join(',')})`);
          }

          const { data, error: fetchError } = await query.limit(1).maybeSingle();

          if (fetchError) throw fetchError;

          // If all words have been seen, get a random one
          if (!data) {
            const { data: randomWord, error: randomError } = await supabase
              .from('daily_words')
              .select('id, word, phonetic, part_of_speech, definition, example, audio_url, category')
              .eq('is_active', true)
              .limit(1)
              .maybeSingle();

            if (randomError) throw randomError;
            wordData = randomWord;
          } else {
            wordData = data;

            // Mark as seen
            await supabase
              .from('user_seen_words')
              .insert({ user_id: user.id, word_id: data.id });
          }
        } else {
          // For visitors, just get a random word
          const { data, error: fetchError } = await supabase
            .from('daily_words')
            .select('id, word, phonetic, part_of_speech, definition, example, audio_url, category')
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();

          if (fetchError) throw fetchError;
          wordData = data;
        }

        setWord(wordData);
      } catch (err) {
        console.error('Error fetching word of the day:', err);
        setError('Erreur lors du chargement du mot du jour');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWord();
  }, [isDismissed, isVisitor]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playAudio = useCallback(() => {
    if (!word?.audio_url) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

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
  }, [word?.audio_url]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    const dismissKey = getDismissKey();
    localStorage.setItem(dismissKey, 'true');
    setIsDismissed(true);
  }, []);

  return {
    word,
    isLoading,
    isDismissed,
    isPlaying,
    playAudio,
    stopAudio,
    dismiss,
    error,
  };
};
