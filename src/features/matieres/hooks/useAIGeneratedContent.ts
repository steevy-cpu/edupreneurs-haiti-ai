import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { QuizPayload } from '@/features/matieres/validation/quiz.schema';

type ContentType = 'quiz' | 'activities';

interface CachedContent<T> {
  payload: T;
  generatedAt: string;
  lessonTitle: string;
}

interface UseAIGeneratedContentParams {
  lessonId: string;
  contentType: ContentType;
  lessonTitle: string;
  lessonContent: string;
  lessonExamples: string;
  gradeLevel: string;
  subjectName: string;
  subjectSlug?: string;
  lessonSlug?: string;
}

interface UseAIGeneratedContentResult<T> {
  data: T | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  isStale: boolean;
  regenerate: () => void;
}

const CACHE_VERSION = 'v1';
const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getCacheKey(contentType: ContentType, lessonId: string): string {
  return `ai_${contentType}_${lessonId}_${CACHE_VERSION}`;
}

function getFromCache<T>(key: string): CachedContent<T> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedContent<T>;
    if (!parsed.payload || !parsed.generatedAt) return null;
    return parsed;
  } catch {
    // Cache corruption — clear it
    localStorage.removeItem(key);
    return null;
  }
}

function saveToCache<T>(key: string, payload: T, lessonTitle: string): void {
  try {
    const entry: CachedContent<T> = {
      payload,
      generatedAt: new Date().toISOString(),
      lessonTitle,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage full — silently fail, user will just regenerate next time
    console.warn('localStorage save failed for', key);
  }
}

function isStale(generatedAt: string): boolean {
  return Date.now() - new Date(generatedAt).getTime() > STALE_THRESHOLD_MS;
}

/**
 * Hook that manages AI content generation + localStorage caching.
 * 
 * Flow:
 * 1. Check localStorage for cached content
 * 2. If cached → return immediately (no network)
 * 3. If not cached → call edge function, validate, cache, return
 * 4. regenerate() → clear cache and re-trigger
 */
export function useAIGeneratedQuiz(
  params: UseAIGeneratedContentParams
): UseAIGeneratedContentResult<QuizPayload> {
  const { lessonId, lessonTitle, lessonContent, lessonExamples, gradeLevel, subjectName, subjectSlug, lessonSlug } = params;
  
  const [data, setData] = useState<QuizPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStaleFlag, setIsStaleFlag] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const cacheKey = getCacheKey('quiz', lessonId);

  const generate = useCallback(async (skipCache = false) => {
    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);

    // Step 1: Check cache (unless regenerating)
    if (!skipCache) {
      const cached = getFromCache<QuizPayload>(cacheKey);
      if (cached) {
        setData(cached.payload);
        setIsStaleFlag(isStale(cached.generatedAt));
        setIsLoading(false);
        return;
      }
    }

    // Step 2: No cache — generate via edge function
    setIsGenerating(true);
    setIsLoading(true);

    try {
      const slug = lessonSlug || lessonTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const sSlug = subjectSlug || subjectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const combinedContent = `${lessonContent || ''}\n\n${lessonExamples || ''}`.trim();

      const { data: responseData, error: invokeError } = await supabase.functions.invoke('generate-quiz-final', {
        body: {
          lessonTitle,
          lessonSlug: slug,
          subjectSlug: sSlug,
          contenu: lessonContent,
          exemplesExercices: lessonExamples,
          gradeLevel,
          subject: subjectName,
          outputFormat: 'json',
        },
      });

      if (controller.signal.aborted) return;

      if (invokeError) {
        throw new Error(invokeError.message || 'Erreur lors de la génération du quiz');
      }

      if (!responseData?.success || !responseData?.payload) {
        const validationErrors = responseData?.validationErrors;
        if (validationErrors) {
          console.error('Quiz validation errors:', validationErrors);
        }
        throw new Error('Le quiz généré est invalide. Réessayez.');
      }

      const payload = responseData.payload as QuizPayload;

      // Save to cache
      saveToCache(cacheKey, payload, lessonTitle);

      setData(payload);
      setIsStaleFlag(false);
      setError(null);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('Quiz generation error:', err);
    } finally {
      if (!controller.signal.aborted) {
        setIsGenerating(false);
        setIsLoading(false);
      }
    }
  }, [cacheKey, lessonTitle, lessonContent, lessonExamples, gradeLevel, subjectName, subjectSlug, lessonSlug]);

  // Initial load
  useEffect(() => {
    generate(false);
    return () => {
      abortRef.current?.abort();
    };
  }, [lessonId]); // Only re-run when lessonId changes

  const regenerate = useCallback(() => {
    localStorage.removeItem(cacheKey);
    setData(null);
    generate(true);
  }, [cacheKey, generate]);

  return { data, isLoading, isGenerating, error, isStale: isStaleFlag, regenerate };
}

/**
 * Hook for AI-generated activities content.
 * Activities edge function returns markdown/text content (not JSON).
 */
export function useAIGeneratedActivities(
  params: UseAIGeneratedContentParams
): UseAIGeneratedContentResult<string> {
  const { lessonId, lessonTitle, lessonContent, lessonExamples, gradeLevel, subjectName } = params;

  const [data, setData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStaleFlag, setIsStaleFlag] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const cacheKey = getCacheKey('activities', lessonId);

  const generate = useCallback(async (skipCache = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);

    if (!skipCache) {
      const cached = getFromCache<string>(cacheKey);
      if (cached) {
        setData(cached.payload);
        setIsStaleFlag(isStale(cached.generatedAt));
        setIsLoading(false);
        return;
      }
    }

    setIsGenerating(true);
    setIsLoading(true);

    try {
      const combinedContent = `${lessonContent || ''}\n\n${lessonExamples || ''}`.trim();

      const { data: responseData, error: invokeError } = await supabase.functions.invoke('generate-interactive-activities', {
        body: {
          exercisesContent: combinedContent,
          contenu: lessonContent,
          exemplesExercices: lessonExamples,
          lessonTitle,
          gradeLevel,
          subject: subjectName,
        },
      });

      if (controller.signal.aborted) return;

      if (invokeError) {
        throw new Error(invokeError.message || 'Erreur lors de la génération des activités');
      }

      if (!responseData?.success || !responseData?.content) {
        throw new Error('Les activités générées sont invalides. Réessayez.');
      }

      const content = responseData.content as string;

      saveToCache(cacheKey, content, lessonTitle);

      setData(content);
      setIsStaleFlag(false);
      setError(null);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      console.error('Activities generation error:', err);
    } finally {
      if (!controller.signal.aborted) {
        setIsGenerating(false);
        setIsLoading(false);
      }
    }
  }, [cacheKey, lessonTitle, lessonContent, lessonExamples, gradeLevel, subjectName]);

  useEffect(() => {
    generate(false);
    return () => {
      abortRef.current?.abort();
    };
  }, [lessonId]);

  const regenerate = useCallback(() => {
    localStorage.removeItem(cacheKey);
    setData(null);
    generate(true);
  }, [cacheKey, generate]);

  return { data, isLoading, isGenerating, error, isStale: isStaleFlag, regenerate };
}
