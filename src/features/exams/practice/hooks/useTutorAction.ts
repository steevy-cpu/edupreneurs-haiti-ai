/**
 * useTutorAction - Hook for action-based tutor API calls
 * Manages runner state machine and API communication
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TutorResponse } from '../../types/exam.types';
import type { RunnerState, ExerciseForRunner, ReferenceText } from '../types';

interface UseTutorActionProps {
  sessionId: string;
  exerciseId: string;
  exercise: ExerciseForRunner;
  referenceTexts?: ReferenceText[];
  onAnswerValidated?: (isCorrect: boolean, points: number) => void;
}

interface UseTutorActionReturn {
  state: RunnerState;
  feedback: TutorResponse | null;
  hintLevel: number;
  selectedAnswer: string | null;
  checkAnswer: (answer: string, answerType?: 'mcq' | 'short') => Promise<void>;
  requestHint: () => Promise<void>;
  revealAnswer: () => Promise<void>;
  askJude: (question: string) => Promise<TutorResponse | null>;
  reset: () => void;
  setSelectedAnswer: (answer: string | null) => void;
}

export function useTutorAction({
  sessionId,
  exerciseId,
  exercise,
  referenceTexts = [],
  onAnswerValidated,
}: UseTutorActionProps): UseTutorActionReturn {
  const [state, setState] = useState<RunnerState>('idle');
  const [feedback, setFeedback] = useState<TutorResponse | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const checkAnswer = useCallback(async (answer: string, answerType: 'mcq' | 'short' = 'mcq') => {
    setState('checking');
    setSelectedAnswer(answer);

    try {
      const { data, error } = await supabase.functions.invoke('exam-tutor', {
        body: {
          action: 'check',
          exercise,
          studentAnswer: answer,
          referenceTexts,
        },
      });

      if (error) {
        console.error('Tutor check error:', error);
        setState('error');
        return;
      }

      setFeedback(data as TutorResponse);
      const isCorrect = data.grading?.isCorrect === true;
      setState(isCorrect ? 'correct' : 'incorrect');

      // Trigger callback for score updates
      if (data.grading?.pointsAwarded && onAnswerValidated) {
        onAnswerValidated(isCorrect, data.grading.pointsAwarded);
      }
    } catch (err) {
      console.error('Tutor check exception:', err);
      setState('error');
    }
  }, [exercise, referenceTexts, onAnswerValidated]);

  const requestHint = useCallback(async () => {
    const newLevel = Math.min(hintLevel + 1, 3);
    setState('checking');

    try {
      const { data, error } = await supabase.functions.invoke('exam-tutor', {
        body: {
          action: 'hint',
          exercise,
          hint_level: newLevel,
          referenceTexts,
        },
      });

      if (error) {
        console.error('Tutor hint error:', error);
        setState('idle');
        return;
      }

      setFeedback(data as TutorResponse);
      setHintLevel(newLevel);
      setState('idle');
    } catch (err) {
      console.error('Tutor hint exception:', err);
      setState('idle');
    }
  }, [exercise, hintLevel, referenceTexts]);

  const revealAnswer = useCallback(async () => {
    setState('checking');

    try {
      const { data, error } = await supabase.functions.invoke('exam-tutor', {
        body: {
          action: 'reveal',
          exercise,
          revealAnswer: true,
          referenceTexts,
        },
      });

      if (error) {
        console.error('Tutor reveal error:', error);
        setState('error');
        return;
      }

      setFeedback(data as TutorResponse);
      setState('revealed');
    } catch (err) {
      console.error('Tutor reveal exception:', err);
      setState('error');
    }
  }, [exercise, referenceTexts]);

  const askJude = useCallback(async (question: string): Promise<TutorResponse | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('exam-tutor', {
        body: {
          action: 'ask',
          exercise,
          userMessage: question,
          referenceTexts,
        },
      });

      if (error) {
        console.error('Tutor ask error:', error);
        return null;
      }

      return data as TutorResponse;
    } catch (err) {
      console.error('Tutor ask exception:', err);
      return null;
    }
  }, [exercise, referenceTexts]);

  const reset = useCallback(() => {
    setState('idle');
    setFeedback(null);
    setHintLevel(0);
    setSelectedAnswer(null);
  }, []);

  return {
    state,
    feedback,
    hintLevel,
    selectedAnswer,
    checkAnswer,
    requestHint,
    revealAnswer,
    askJude,
    reset,
    setSelectedAnswer,
  };
}
