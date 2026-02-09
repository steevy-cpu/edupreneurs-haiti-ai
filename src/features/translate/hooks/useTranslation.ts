/**
 * useTranslation Hook
 * 
 * Encapsulates all translation logic:
 * - State management (loading, error, result)
 * - API call to edge function
 * - Error handling with user-friendly messages
 * - Rate limit detection (429 handling)
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TranslationRequest, TranslationError } from '../types/translate.types';
import { MAX_TEXT_LENGTH, MIN_TEXT_LENGTH } from '../constants/languages';

interface UseTranslationReturn {
  translate: (request: TranslationRequest) => Promise<void>;
  isLoading: boolean;
  error: TranslationError | null;
  result: string;
  clearResult: () => void;
  clearError: () => void;
}

export function useTranslation(): UseTranslationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TranslationError | null>(null);
  const [result, setResult] = useState<string>('');

  const translate = useCallback(async (request: TranslationRequest): Promise<void> => {
    // Clear previous state
    setError(null);
    setResult('');

    // Client-side validation
    if (!request.text || request.text.trim().length < MIN_TEXT_LENGTH) {
      setError({ message: 'Veuillez entrer du texte à traduire', code: 'VALIDATION' });
      return;
    }

    if (request.text.length > MAX_TEXT_LENGTH) {
      setError({ 
        message: `Le texte est trop long (max ${MAX_TEXT_LENGTH} caractères)`, 
        code: 'VALIDATION' 
      });
      return;
    }

    if (request.sourceLang === request.targetLang) {
      setError({ 
        message: 'Veuillez sélectionner deux langues différentes', 
        code: 'VALIDATION' 
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('translate-text', {
        body: {
          text: request.text.trim(),
          sourceLang: request.sourceLang,
          targetLang: request.targetLang,
        },
      });

      if (functionError) {
        console.error('Translation function error:', functionError);
        
        // Check for rate limiting
        if (functionError.message?.includes('429') || functionError.message?.includes('rate')) {
          setError({ 
            message: 'Trop de requêtes. Veuillez patienter quelques secondes.', 
            code: 'RATE_LIMIT' 
          });
          return;
        }

        setError({ 
          message: functionError.message || 'Erreur lors de la traduction', 
          code: 'SERVER' 
        });
        return;
      }

      if (data?.error) {
        setError({ message: data.error, code: 'SERVER' });
        return;
      }

      if (data?.translatedText) {
        setResult(data.translatedText);
      } else {
        setError({ message: 'Traduction échouée. Veuillez réessayer.', code: 'SERVER' });
      }
    } catch (err) {
      console.error('Translation error:', err);
      setError({ 
        message: 'Erreur de connexion. Vérifiez votre connexion internet.', 
        code: 'NETWORK' 
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult('');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    translate,
    isLoading,
    error,
    result,
    clearResult,
    clearError,
  };
}
