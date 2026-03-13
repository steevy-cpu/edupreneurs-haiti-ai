/**
 * @file emailService.ts
 * @description Generates secure 6-digit confirmation codes for email/phone verification flows.
 * @module utils
 *
 * @example
 * const code = generateConfirmationCode(); // → "482917"
 */

/**
 * Generate a 6-digit confirmation code for account verification.
 * @returns A random 6-digit numeric string
 */
export const generateConfirmationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
