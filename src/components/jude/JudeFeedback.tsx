/**
 * JudeFeedback Component
 * 
 * Shows Jude's avatar next to feedback text after answering a question.
 * Provides a personalized "Jude says..." experience with randomized messages.
 * Plays pre-generated voice audio matching the feedback message.
 */

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import judeChairDesk from "@/assets/eric-chair-desk.png";
import { getJudeFeedbackAudioUrl } from '@/utils/judeFeedbackAudio';

const CORRECT_MESSAGES = [
  { emoji: '🎉', text: 'Bravo !' },
  { emoji: '🌟', text: 'Excellent !' },
  { emoji: '✨', text: 'Parfait !' },
  { emoji: '💪', text: 'Super boulot !' },
  { emoji: '🔥', text: 'Tu gères !' },
  { emoji: '👏', text: 'Impressionnant !' },
  { emoji: '✅', text: "C'est ça !" },
  { emoji: '🏆', text: 'Bien joué !' },
  { emoji: '⭐', text: 'Tu assures !' },
  { emoji: '💎', text: 'Magnifique !' },
];

const INCORRECT_MESSAGES = [
  { emoji: '📚', text: 'Pas tout à fait...' },
  { emoji: '🤏', text: 'Presque !' },
  { emoji: '💡', text: 'Essaie encore la prochaine fois !' },
  { emoji: '🔍', text: 'Pas exactement...' },
  { emoji: '😊', text: "C'est pas grave, on apprend !" },
  { emoji: '👍', text: 'Bonne tentative !' },
  { emoji: '💪', text: 'Continue, tu vas y arriver !' },
  { emoji: '🤔', text: 'Hmm, pas cette fois...' },
  { emoji: '🚀', text: 'Ne lâche pas !' },
  { emoji: '👀', text: "Regarde bien l'explication !" },
];

const MUTE_KEY = 'jude-voice-muted';

interface JudeFeedbackProps {
  isCorrect: boolean;
  explanation: string;
  children?: React.ReactNode;
}

export function JudeFeedback({ isCorrect, explanation, children }: JudeFeedbackProps) {
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { feedback, index } = useMemo(() => {
    const pool = isCorrect ? CORRECT_MESSAGES : INCORRECT_MESSAGES;
    const idx = Math.floor(Math.random() * pool.length);
    return { feedback: pool[idx], index: idx };
  }, [isCorrect]);

  const audioUrl = useMemo(
    () => getJudeFeedbackAudioUrl(isCorrect ? 'correct' : 'incorrect', index),
    [isCorrect, index]
  );

  // Play audio when feedback appears
  useEffect(() => {
    if (isMuted || !audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.volume = 0.7;
    audioRef.current = audio;
    audio.play().catch(() => {
      // Silently fail if autoplay is blocked by browser
    });

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [audioUrl, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem(MUTE_KEY, String(next));
      } catch {}
      // Stop current audio if muting
      if (next && audioRef.current) {
        audioRef.current.pause();
      }
      return next;
    });
  }, []);

  return (
    <div className={`
      p-4 sm:p-5 rounded-lg border-2 animate-fade-in
      ${isCorrect
        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700' 
        : 'bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-700'
      }
    `}>
      <div className="flex items-start gap-3">
        <img
          src={judeChairDesk}
          alt="Jude"
          className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full bg-primary/5 p-1 flex-shrink-0"
          loading="lazy"
          decoding="async"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold mb-1 text-sm sm:text-base">
              {feedback.emoji} {feedback.text}
            </p>
            <button
              onClick={toggleMute}
              className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label={isMuted ? 'Activer la voix de Jude' : 'Couper la voix de Jude'}
              title={isMuted ? 'Activer la voix' : 'Couper la voix'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {children || (
            <p className="text-xs sm:text-sm leading-relaxed break-words text-muted-foreground">
              {explanation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
