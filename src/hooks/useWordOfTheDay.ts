import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVisitor } from '@/contexts/VisitorContext';
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
}

const VISITOR_WORD_KEY = 'visitor_word_of_day';

// Get today's date in Haiti timezone (YYYY-MM-DD format)
const getHaitiDate = (): string => {
  return new Date().toLocaleDateString('en-CA', { 
    timeZone: 'America/Port-au-Prince' 
  });
};

export const useWordOfTheDay = (): UseWordOfTheDayReturn => {
  const { isVisitor } = useVisitor();
  const [word, setWord] = useState<DailyWord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch word of the day - same word until midnight Haiti time
  useEffect(() => {
    const fetchWord = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const haitiDate = getHaitiDate();
        const { data: { user } } = await supabase.auth.getUser();
        
        let wordData: DailyWord | null = null;

        if (user && !isVisitor) {
          // For authenticated users, check if they already have a word for today
          const { data: todaysWord, error: todayError } = await supabase
            .from('user_daily_word')
            .select('word_id, daily_words(*)')
            .eq('user_id', user.id)
            .eq('date', haitiDate)
            .maybeSingle();

          if (todayError) throw todayError;

          // If user already has a word for today, return it
          if (todaysWord?.daily_words) {
            wordData = todaysWord.daily_words as unknown as DailyWord;
          } else {
            // No word for today - pick a new one avoiding recently seen words
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

            // Get words seen in last 30 days
            const { data: recentWords } = await supabase
              .from('user_daily_word')
              .select('word_id')
              .eq('user_id', user.id)
              .gte('date', thirtyDaysAgoStr);

            const recentIds = recentWords?.map(w => w.word_id) || [];

            // Get all active words
            const { data: allActiveWords, error: wordsError } = await supabase
              .from('daily_words')
              .select('id, word, phonetic, part_of_speech, definition, example, audio_url, category')
              .eq('is_active', true);

            if (wordsError) throw wordsError;

            // Filter out recently seen words
            let availableWords = allActiveWords || [];
            if (recentIds.length > 0 && availableWords.length > recentIds.length) {
              availableWords = availableWords.filter(w => !recentIds.includes(w.id));
            }

            // Pick a random word from available
            if (availableWords.length > 0) {
              const randomIndex = Math.floor(Math.random() * availableWords.length);
              wordData = availableWords[randomIndex];

              // Save as today's word using upsert to prevent race conditions
              await supabase
                .from('user_daily_word')
                .upsert(
                  { user_id: user.id, word_id: wordData.id, date: haitiDate },
                  { onConflict: 'user_id,date', ignoreDuplicates: true }
                );
            }
          }
        } else {
          // For visitors, use localStorage to persist word for the day
          const stored = localStorage.getItem(VISITOR_WORD_KEY);
          
          if (stored) {
            try {
              const { wordId, date } = JSON.parse(stored);
              if (date === haitiDate && wordId) {
                // Fetch the same word
                const { data: existingWord, error: fetchError } = await supabase
                  .from('daily_words')
                  .select('id, word, phonetic, part_of_speech, definition, example, audio_url, category')
                  .eq('id', wordId)
                  .eq('is_active', true)
                  .maybeSingle();

                if (!fetchError && existingWord) {
                  wordData = existingWord;
                }
              }
            } catch {
              // Invalid localStorage data, ignore
            }
          }

          // If no valid stored word, get a random one
          if (!wordData) {
            const { data: allWords, error: fetchError } = await supabase
              .from('daily_words')
              .select('id, word, phonetic, part_of_speech, definition, example, audio_url, category')
              .eq('is_active', true);

            if (fetchError) throw fetchError;

            if (allWords && allWords.length > 0) {
              const randomIndex = Math.floor(Math.random() * allWords.length);
              wordData = allWords[randomIndex];

              // Save to localStorage for the day
              localStorage.setItem(VISITOR_WORD_KEY, JSON.stringify({
                wordId: wordData.id,
                date: haitiDate
              }));
            }
          }
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
  }, [isVisitor]);

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

    // Otherwise, generate audio on-demand
    setIsGenerating(true);
    try {
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
  }, [word]);

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
  };
};
