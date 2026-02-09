/**
 * Translation Feature Types
 * 
 * TypeScript interfaces for the multi-language translator.
 * Supports: English, Haitian Creole, French, Spanish
 */

export type LanguageCode = 'en' | 'ht' | 'fr' | 'es';

export interface Language {
  code: LanguageCode;
  name: string;           // Display name in French
  nativeName: string;     // Name in its own language
  flag: string;           // Emoji flag
}

export interface TranslationRequest {
  text: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
}

export interface TranslationResult {
  translatedText: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
}

export interface TranslationError {
  message: string;
  code?: 'VALIDATION' | 'RATE_LIMIT' | 'NETWORK' | 'SERVER';
}
