/**
 * Normalizes a string to create a URL-safe slug without special characters
 * Removes accents and converts to lowercase with hyphens
 * 
 * @param text - The text to normalize
 * @returns A normalized slug safe for URLs
 * 
 * @example
 * normalizeToSlug("Français") // returns "francais"
 * normalizeToSlug("Sciences Sociales") // returns "sciences-sociales"
 */
export function normalizeToSlug(text: string): string {
  return text
    .normalize('NFD') // Decompose combined graphemes into simple ones
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // Remove non-word chars except hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Remove leading hyphens
    .replace(/-+$/, ''); // Remove trailing hyphens
}
