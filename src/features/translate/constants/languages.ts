/**
 * Language Constants for Translation Feature
 * 
 * Centralized language definitions - no hardcoded strings in components.
 */

import type { Language, LanguageCode } from '../types/translate.types';

export const SUPPORTED_LANGUAGES: readonly Language[] = [
  { code: 'en', name: 'Anglais', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ht', name: 'Créole', nativeName: 'Kreyòl Ayisyen', flag: '🇭🇹' },
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Espagnol', nativeName: 'Español', flag: '🇪🇸' },
] as const;

// Character limits
export const MAX_TEXT_LENGTH = 5000;
export const MIN_TEXT_LENGTH = 1;

// Default language selection
export const DEFAULT_SOURCE_LANG: LanguageCode = 'fr';
export const DEFAULT_TARGET_LANG: LanguageCode = 'ht';

/**
 * Get language by code
 */
export function getLanguageByCode(code: LanguageCode): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

/**
 * Get display label for language (flag + name)
 */
export function getLanguageLabel(code: LanguageCode): string {
  const lang = getLanguageByCode(code);
  return lang ? `${lang.flag} ${lang.name}` : code;
}
