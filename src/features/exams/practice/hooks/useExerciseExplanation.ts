/**
 * useExerciseExplanation - Fetches AI-generated explanation for wrong answers
 * Calls generate-exercise-explanation edge function with per-exercise caching.
 * Silent fail: if the edge function errors, explanation stays null.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ExerciseForRunner } from '../types';

interface UseExerciseExplanationProps {
  /** The exercise to explain — null when no explanation needed */
  exercise: ExerciseForRunner | null;
  /** Exam subject (e.g. "Mathématiques") */
  subject: string;
  /** Exam grade level (e.g. "9AF", "NS4") */
  gradeLevel: string;
  /** Exam series/track (e.g. "C", "D") — optional */
  series?: string;
  /** Only fetch when true (set after wrong answer confirmed) */
  enabled: boolean;
}

interface UseExerciseExplanationReturn {
  explanation: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useExerciseExplanation({
  exercise,
  subject,
  gradeLevel,
  series,
  enabled,
}: UseExerciseExplanationProps): UseExerciseExplanationReturn {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache: Map<exerciseId, explanation> — survives re-renders, cleared on unmount
  const cacheRef = useRef<Map<string, string>>(new Map());

  // Fetch explanation when enabled transitions to true
  useEffect(() => {
    if (!enabled || !exercise) return;

    const exerciseId = exercise.id;

    // Return cached result if available (avoids re-fetch on re-render)
    const cached = cacheRef.current.get(exerciseId);
    if (cached) {
      setExplanation(cached);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setExplanation(null);

    (async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          'generate-exercise-explanation',
          {
            body: {
              questionText: exercise.question_text,
              subject,
              gradeLevel,
              series: series || undefined,
            },
          }
        );

        if (cancelled) return;

        if (fnError) {
          console.error('Exercise explanation fetch error:', fnError);
          setError('Impossible de charger l\'explication');
          setIsLoading(false);
          return;
        }

        const text = data?.explanation || null;
        if (text) {
          cacheRef.current.set(exerciseId, text);
        }
        setExplanation(text);
      } catch (err) {
        if (cancelled) return;
        console.error('Exercise explanation exception:', err);
        setError('Erreur réseau');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [enabled, exercise?.id, subject, gradeLevel, series]);

  return { explanation, isLoading, error };
}
