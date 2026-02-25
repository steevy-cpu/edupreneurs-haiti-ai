/**
 * useJudeVoice — Shared hook for all Jude voice surfaces.
 *
 * Handles: edge function call → session URL caching → playback via JudeAudioContext.
 * Respects the existing jude-voice-muted localStorage flag.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useJudeAudio } from '@/contexts/JudeAudioContext';

/** Module-level cache — survives component remounts within the session */
const urlCache = new Map<string, string>();

type VoiceContext = 'points-cles' | 'studygram' | 'onboarding' | 'visitor' | 'feedback';

interface UseJudeVoiceOptions {
  /** Text to convert to speech (max 500 chars) */
  text: string;
  /** Unique key for Storage caching (alphanumeric, hyphens, slashes) */
  storageKey: string;
  /** Which feature surface is requesting voice */
  context: VoiceContext;
  /** If true, fetch audio URL in background on mount */
  autoPreload?: boolean;
}

interface UseJudeVoiceReturn {
  /** Trigger playback — preloads if URL not yet cached */
  play: () => Promise<void>;
  /** Stop current Jude audio */
  stop: () => void;
  /** Whether Jude is currently speaking */
  isSpeaking: boolean;
  /** Whether the edge function call is in progress */
  isLoading: boolean;
  /** Whether an error occurred */
  isError: boolean;
  /** Whether the audio URL is resolved and ready to play */
  isReady: boolean;
}

export function useJudeVoice({
  text,
  storageKey,
  context,
  autoPreload = false,
}: UseJudeVoiceOptions): UseJudeVoiceReturn {
  const { speak, stop, isSpeaking } = useJudeAudio();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isReady, setIsReady] = useState(() => urlCache.has(storageKey));

  // Track mounted state to prevent state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /** Fetch audio URL from edge function, store in session cache */
  const preload = useCallback(async () => {
    // Already cached — no-op
    if (urlCache.has(storageKey)) {
      if (mountedRef.current) setIsReady(true);
      return;
    }

    // Skip if text is empty
    if (!text.trim()) return;

    if (mountedRef.current) {
      setIsLoading(true);
      setIsError(false);
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-jude-voice', {
        body: { text, storageKey, context },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No URL returned');

      urlCache.set(storageKey, data.url);
      if (mountedRef.current) setIsReady(true);
    } catch (err) {
      console.error('[useJudeVoice] Preload failed:', err);
      if (mountedRef.current) setIsError(true);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [text, storageKey, context]);

  // Auto-preload on mount if requested
  useEffect(() => {
    if (autoPreload && text.trim()) {
      preload();
    }
  }, [autoPreload, storageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Play voice — respects mute toggle, preloads if needed */
  const play = useCallback(async () => {
    // Respect existing mute preference from JudeFeedback
    const isMuted = localStorage.getItem('jude-voice-muted') === 'true';
    if (isMuted) return;

    // Ensure URL is cached
    if (!urlCache.has(storageKey)) {
      await preload();
    }

    const url = urlCache.get(storageKey);
    if (url) {
      await speak(url);
    }
  }, [storageKey, preload, speak]);

  return {
    play,
    stop,
    isSpeaking,
    isLoading,
    isError,
    isReady,
  };
}
