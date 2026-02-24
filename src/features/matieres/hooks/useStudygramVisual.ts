import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Node styles control visual rendering in the studygram grid
export interface StudygramNode {
  text: string;
  style: 'highlight' | 'outline' | 'plain' | 'quote';
}

// Each section groups related key points under a thematic colored heading
export interface StudygramSection {
  heading: string;
  color: 'blue' | 'pink' | 'green' | 'purple' | 'amber' | 'rose';
  emoji: string;
  nodes: StudygramNode[];
}

// Complete studygram data returned by the edge function
export interface StudygramData {
  title: string;
  subtitle: string;
  sections: StudygramSection[];
}

interface CachedStudygram {
  data: StudygramData;
  generatedAt: string;
  lessonTitle: string;
}

interface UseStudygramVisualParams {
  lessonId: string;
  lessonTitle: string;
  contenu: string;
  exemplesExercices: string;
  objectif: string;
  gradeLevel: string;
  subjectName: string;
}

interface UseStudygramVisualResult {
  studygram: StudygramData | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  isStale: boolean;
  regenerate: () => void;
}

const CACHE_VERSION = 'v1';
const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7-day cache window

// Separate cache key from Points Clés to avoid collisions
function getCacheKey(lessonId: string): string {
  return `ai_studygram_visual_${lessonId}_${CACHE_VERSION}`;
}

function getFromCache(key: string): CachedStudygram | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedStudygram;
    // Validate cache shape before trusting it
    if (!parsed.data || !parsed.data.sections || !parsed.generatedAt) return null;
    return parsed;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function saveToCache(key: string, data: StudygramData, lessonTitle: string): void {
  try {
    const entry: CachedStudygram = {
      data,
      generatedAt: new Date().toISOString(),
      lessonTitle,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage full — silently fail, user will regenerate next time
    console.warn('[StudygramVisual] localStorage save failed for', key);
  }
}

function isStale(generatedAt: string): boolean {
  return Date.now() - new Date(generatedAt).getTime() > STALE_THRESHOLD_MS;
}

/**
 * Hook for AI-generated visual studygram (mind-map style revision sheet).
 * Cache-first, lazy generation — same pattern as usePointsClesCards.
 */
export function useStudygramVisual(
  params: UseStudygramVisualParams
): UseStudygramVisualResult {
  const { lessonId, lessonTitle, contenu, exemplesExercices, objectif, gradeLevel, subjectName } = params;

  const [studygram, setStudygram] = useState<StudygramData | null>(null);
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
        setStudygram(cached.data);
        setIsStaleFlag(isStale(cached.generatedAt));
        setIsLoading(false);
        return;
      }
    }

    // Step 2: Generate via dedicated visual edge function
    setIsGenerating(true);
    setIsLoading(true);

    try {
      const { data: responseData, error: invokeError } = await supabase.functions.invoke('generate-studygram-visual', {
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
        throw new Error(invokeError.message || 'Erreur lors de la génération du studygram');
      }

      if (!responseData?.success || !responseData?.studygram) {
        throw new Error('Le studygram généré est invalide. Réessayez.');
      }

      const generatedData = responseData.studygram as StudygramData;

      // Cache for offline/3G resilience
      saveToCache(cacheKey, generatedData, lessonTitle);

      setStudygram(generatedData);
      setIsStaleFlag(false);
      setError(null);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('[StudygramVisual] Generation error:', err);
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
    setStudygram(null);
    generate(true);
  }, [cacheKey, generate]);

  return { studygram, isLoading, isGenerating, error, isStale: isStaleFlag, regenerate };
}
