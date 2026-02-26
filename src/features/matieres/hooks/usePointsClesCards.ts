import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Card types returned by the AI edge function
export interface PointsClesCard {
  title: string;
  content: string;
  emoji: string;
  type: 'concept' | 'example' | 'formula' | 'tip' | 'remember';
}

interface CachedPointsCles {
  cards: PointsClesCard[];
  generatedAt: string;
  lessonTitle: string;
}

interface UsePointsClesCardsParams {
  lessonId: string;
  lessonTitle: string;
  contenu: string;
  exemplesExercices: string;
  objectif: string;
  gradeLevel: string;
  subjectName: string;
}

interface UsePointsClesCardsResult {
  cards: PointsClesCard[] | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  isStale: boolean;
  regenerate: () => void;
}

const CACHE_VERSION = 'v2';
const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7-day cache window

// Keep same localStorage key for backward compatibility with existing user caches
function getCacheKey(lessonId: string): string {
  return `ai_studygram_${lessonId}_${CACHE_VERSION}`;
}

function getFromCache(key: string): CachedPointsCles | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPointsCles;
    // Validate cache shape before trusting it
    if (!parsed.cards || !Array.isArray(parsed.cards) || !parsed.generatedAt) return null;
    return parsed;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function saveToCache(key: string, cards: PointsClesCard[], lessonTitle: string): void {
  try {
    const entry: CachedPointsCles = {
      cards,
      generatedAt: new Date().toISOString(),
      lessonTitle,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage full — silently fail, user will regenerate next time
    console.warn('[PointsCles] localStorage save failed for', key);
  }
}

function isStale(generatedAt: string): boolean {
  return Date.now() - new Date(generatedAt).getTime() > STALE_THRESHOLD_MS;
}

/**
 * Hook for AI-generated Points Clés flashcards with localStorage caching.
 * Mirrors the pattern in useAIGeneratedContent.ts — cache-first, lazy generation.
 */
export function usePointsClesCards(
  params: UsePointsClesCardsParams
): UsePointsClesCardsResult {
  const { lessonId, lessonTitle, contenu, exemplesExercices, objectif, gradeLevel, subjectName } = params;

  const [cards, setCards] = useState<PointsClesCard[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStaleFlag, setIsStaleFlag] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const cacheKey = getCacheKey(lessonId);

  const generate = useCallback(async (skipCache = false) => {
    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);

    // Step 1: Check cache unless explicitly regenerating
    if (!skipCache) {
      const cached = getFromCache(cacheKey);
      if (cached) {
        setCards(cached.cards);
        setIsStaleFlag(isStale(cached.generatedAt));
        setIsLoading(false);
        return;
      }
    }

    // Step 2: Generate via edge function (name unchanged for backend compatibility)
    setIsGenerating(true);
    setIsLoading(true);

    try {
      const { data: responseData, error: invokeError } = await supabase.functions.invoke('generate-studygram', {
        body: {
          lessonTitle,
          contenu,
          exemplesExercices,
          objectif,
          gradeLevel,
          subject: subjectName,
        },
      });

      if (controller.signal.aborted) return;

      if (invokeError) {
        throw new Error(invokeError.message || 'Erreur lors de la génération des flashcards');
      }

      if (!responseData?.success || !responseData?.cards) {
        throw new Error('Les flashcards générées sont invalides. Réessayez.');
      }

      const generatedCards = responseData.cards as PointsClesCard[];

      // Cache for offline/3G resilience
      saveToCache(cacheKey, generatedCards, lessonTitle);

      setCards(generatedCards);
      setIsStaleFlag(false);
      setError(null);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('[PointsCles] Generation error:', err);
    } finally {
      if (!controller.signal.aborted) {
        setIsGenerating(false);
        setIsLoading(false);
      }
    }
  }, [cacheKey, lessonTitle, contenu, exemplesExercices, objectif, gradeLevel, subjectName]);

  // Auto-generate on mount
  useEffect(() => {
    generate(false);
    return () => {
      abortRef.current?.abort();
    };
  }, [lessonId]); // Only re-run when lessonId changes

  const regenerate = useCallback(() => {
    localStorage.removeItem(cacheKey);
    setCards(null);
    generate(true);
  }, [cacheKey, generate]);

  return { cards, isLoading, isGenerating, error, isStale: isStaleFlag, regenerate };
}
