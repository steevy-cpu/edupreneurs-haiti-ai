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

export const useWordOfTheDay = (): UseWordOfTheDayReturn => {
  const { isVisitor } = useVisitor();
  const [word, setWord] = useState<DailyWord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch word of the day
  useEffect(() => {
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
