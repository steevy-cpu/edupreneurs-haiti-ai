/**
 * Text Moderation Utility for User-Generated Content
 * 
 * Validates nicknames and names for:
 * - Profanity (French, Haitian Creole, English)
 * - Reserved/official usernames
 * - Leet-speak bypass attempts
 * 
 * Client-side only - no database changes required.
 */

// Owner exceptions - accounts that can use reserved words
const OWNER_EXCEPTIONS = ['jude'];

// Reserved usernames that could cause confusion
const RESERVED_USERNAMES = [
  'admin', 'administrator', 'administrateur',
  'support', 'helpdesk', 'aide',
  'edupreneurs', 'edupreneur', 'eduprenuer',
  'jude', 'judeai', 'jude_ai',
  'moderator', 'mod', 'moderateur',
  'staff', 'official', 'officiel',
  'haiti', 'haïti', 'ayiti',
  'test', 'null', 'undefined', 'system',
  'root', 'superuser', 'guest', 'anonymous',
];

// Profanity patterns (contextual for educational platform)
const FORBIDDEN_PATTERNS = [
  // French common
  'merde', 'putain', 'salaud', 'connard', 'bordel', 'enculer',
  'nique', 'foutre', 'baiser', 'chier', 'salope', 'pute',
  'encule', 'connasse', 'batard',
  
  // Haitian Creole
  'bouzen', 'makomè', 'kaka', 'malpwop', 'salop',
  'kokorat', 'bouzin', 'enfim', 'zonbi',
  
  // English common
  'fuck', 'shit', 'bitch', 'dick', 'pussy', 'cunt',
  'nigger', 'nigga', 'faggot', 'asshole', 'bastard',
  
  // Slurs (all languages)
  'nazi', 'hitler',
];

/**
 * Normalize text for comparison
 * - Converts to lowercase
 * - Removes accents
 * - Converts leet-speak
 * - Collapses repeated characters
 */
function normalizeText(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    // Remove accents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Leet-speak conversion
    .replace(/@|4/g, 'a')
    .replace(/3/g, 'e')
    .replace(/1|!/g, 'i')
    .replace(/0/g, 'o')
    .replace(/5|\$/g, 's')
    .replace(/7/g, 't')
    // Remove non-alphanumeric (except underscore for nicknames)
    .replace(/[^a-z0-9_]/g, '')
    // Collapse repeated characters: baaad -> bad
    .replace(/(.)\1{2,}/g, '$1$1');
}

export interface ModerationResult {
  valid: boolean;
  hasProfanity: boolean;
  isReserved: boolean;
  error?: string;
}

/**
 * Check if text contains forbidden words
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const normalized = normalizeText(text);
  return FORBIDDEN_PATTERNS.some(pattern => normalized.includes(pattern));
}

/**
 * Check if username is reserved
 */
export function isReservedUsername(text: string): boolean {
  if (!text) return false;
  const normalized = normalizeText(text);
  
  // Allow exact matches for owner exceptions
  if (OWNER_EXCEPTIONS.includes(normalized)) {
    return false;
  }
  
  return RESERVED_USERNAMES.some(reserved => 
    normalized === reserved || normalized.startsWith(reserved + '_')
  );
}

/**
 * Validate text for user content (nickname or fullName)
 */
export function validateUserText(
  text: string, 
  fieldType: 'nickname' | 'fullName'
): ModerationResult {
  if (!text || text.trim().length === 0) {
    return { valid: true, hasProfanity: false, isReserved: false };
  }
  
  const hasProfanity = containsProfanity(text);
  const isReserved = fieldType === 'nickname' && isReservedUsername(text);
  
  if (hasProfanity) {
    return {
      valid: false,
      hasProfanity: true,
      isReserved: false,
      error: fieldType === 'nickname' 
        ? "Ce pseudo contient des termes inappropriés"
        : "Le nom contient des termes inappropriés",
    };
  }
  
  if (isReserved) {
    return {
      valid: false,
      hasProfanity: false,
      isReserved: true,
      error: "Ce pseudo est réservé",
    };
  }
  
  return { valid: true, hasProfanity: false, isReserved: false };
}
