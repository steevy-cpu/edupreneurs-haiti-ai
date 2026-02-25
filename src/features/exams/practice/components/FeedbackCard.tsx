/**
 * FeedbackCard - Compact Jude response card for exam practice.
 * Plays pre-generated reaction clip, then chains explanation narration via useJudeVoice.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ContentBlocksRenderer } from '../../rendering/ContentBlocksRenderer';
import { MathText } from '@/components/MathContent';
import judeProfile from '@/assets/jude-profile.jpeg';
import type { TutorResponse } from '../../types/exam.types';
import type { RunnerState } from '../types';
import { CheckCircle2, XCircle, Lightbulb, Eye, Volume2, VolumeX, Loader2, Square } from 'lucide-react';
import { getJudeFeedbackAudioUrl } from '@/utils/judeFeedbackAudio';
import { useJudeVoice } from '@/hooks/useJudeVoice';

const MUTE_KEY = 'jude-voice-muted';

interface FeedbackCardProps {
  feedback: TutorResponse;
  state: RunnerState;
}

export function FeedbackCard({ feedback, state }: FeedbackCardProps) {
  const isCorrect = state === 'correct';
  const isIncorrect = state === 'incorrect';
  const isPartial = state === 'partial';
  const isRevealed = state === 'revealed';
  const isHint = state === 'idle' && feedback.blocks?.length > 0;

  // Extract plain text explanation for voice narration
  const explanationText = feedback.response || '';

  // Voice feedback (only for correct/incorrect)
  const [isMuted, setIsMuted] = useState(() => {
    try { return localStorage.getItem(MUTE_KEY) === 'true'; } catch { return false; }
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioIndex = useMemo(
    () => (isCorrect || isIncorrect) ? Math.floor(Math.random() * 10) : null,
    [isCorrect, isIncorrect]
  );

  const audioUrl = useMemo(
    () => audioIndex !== null
      ? getJudeFeedbackAudioUrl(isCorrect ? 'correct' : 'incorrect', audioIndex)
      : null,
    [isCorrect, audioIndex]
  );

  // Explanation voice hook — chains after reaction clip
  const explanationKey = explanationText
    ? `feedback/exam-${btoa(encodeURIComponent(explanationText)).slice(0, 32)}`
    : null;

  const {
    play: playExplanation,
    stop: stopExplanation,
    isSpeaking: isExplanationSpeaking,
    isLoading: isExplanationLoading,
  } = useJudeVoice({
    text: explanationText,
    storageKey: explanationKey || 'feedback/empty',
    context: 'feedback',
    autoPreload: !!explanationText && (isCorrect || isIncorrect),
  });

  // Ref to avoid re-triggering audio useEffect when playExplanation identity changes
  const playExplanationRef = useRef(playExplanation);
  useEffect(() => { playExplanationRef.current = playExplanation; }, [playExplanation]);

  // Play reaction clip, then chain explanation voice via onended
  useEffect(() => {
    if (isMuted || !audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.volume = 0.7;
    audioRef.current = audio;

    // Chain explanation narration after reaction clip finishes
    audio.onended = () => {
      if (explanationText && !isMuted) {
        playExplanationRef.current();
      }
    };

    audio.play().catch(() => {});
    return () => { audio.pause(); audio.src = ''; audioRef.current = null; };
  }, [audioUrl, isMuted, explanationText]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try { localStorage.setItem(MUTE_KEY, String(next)); } catch {}
      // Stop reaction clip if muting
      if (next && audioRef.current) audioRef.current.pause();
      // Also stop explanation voice if playing
      if (next) stopExplanation();
      return next;
    });
  }, [stopExplanation]);

  // Determine icon and border color
  const getStateStyles = () => {
    if (isCorrect) {
      return {
        border: 'border-green-500/50',
        bg: 'bg-green-500/5',
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      };
    }
    if (isIncorrect) {
      return {
        border: 'border-red-500/50',
        bg: 'bg-red-500/5',
        icon: <XCircle className="h-4 w-4 text-red-500" />,
      };
    }
    if (isRevealed) {
      return {
        border: 'border-amber-500/50',
        bg: 'bg-amber-500/5',
        icon: <Eye className="h-4 w-4 text-amber-500" />,
      };
    }
    if (isPartial) {
      return {
        border: 'border-yellow-500/50',
        bg: 'bg-yellow-500/5',
        icon: <CheckCircle2 className="h-4 w-4 text-yellow-500" />,
      };
    }
    // Hint state
    return {
      border: 'border-blue-500/50',
      bg: 'bg-blue-500/5',
      icon: <Lightbulb className="h-4 w-4 text-blue-500" />,
    };
  };

  const styles = getStateStyles();

  // State-aware speaker icon for correct/incorrect states
  const renderSpeakerIcon = () => {
    if (isExplanationLoading) {
      return (
        <button
          className="p-1 rounded-md hover:bg-muted transition-colors flex-shrink-0"
          aria-label="Chargement de la voix..."
          disabled
        >
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
        </button>
      );
    }
    if (isExplanationSpeaking) {
      return (
        <button
          onClick={stopExplanation}
          className="p-1 rounded-md hover:bg-muted transition-colors flex-shrink-0"
          aria-label="Arrêter la voix de Jude"
          title="Arrêter"
        >
          <Square className="w-4 h-4 text-muted-foreground" />
        </button>
      );
    }
    return (
      <button
        onClick={toggleMute}
        className="p-1 rounded-md hover:bg-muted transition-colors flex-shrink-0"
        aria-label={isMuted ? 'Activer la voix de Jude' : 'Couper la voix de Jude'}
        title={isMuted ? 'Activer la voix' : 'Couper la voix'}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Volume2 className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    );
  };

  return (
    <Card className={cn('p-4 mt-4 border-2', styles.border, styles.bg)}>
      <div className="flex items-start gap-3">
        {/* Jude Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0 border border-primary/30">
          <AvatarImage src={judeProfile} alt="Jude" />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">J</AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Status indicator */}
          <div className="flex items-center gap-2 mb-2">
            {styles.icon}
            <span className="text-sm font-medium">
              {isCorrect && 'Bravo, c\'est correct! 🎉'}
              {isPartial && 'Pas mal! Mais tu peux faire mieux. 💪'}
              {isIncorrect && 'Pas exactement... Regarde bien l\'explication.'}
              {isRevealed && 'Voici la réponse. Étudie-la bien!'}
              {isHint && 'Voici un indice pour t\'aider'}
            </span>
            {feedback.grading?.pointsAwarded != null && feedback.grading.pointsAwarded > 0 && (
              <span className="text-sm font-semibold text-green-600">
                +{feedback.grading.pointsAwarded} pts
              </span>
            )}
            {/* State-aware speaker icon — only for correct/incorrect */}
            {(isCorrect || isIncorrect) && renderSpeakerIcon()}
          </div>

          {/* Jude's response */}
          <div className="text-sm leading-relaxed">
            {feedback.blocks && feedback.blocks.length > 0 ? (
              <ContentBlocksRenderer blocks={feedback.blocks} />
            ) : feedback.response ? (
              <MathText text={feedback.response} />
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
