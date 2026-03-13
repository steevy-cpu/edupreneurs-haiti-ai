/**
 * @file logger.ts
 * @description Environment-aware logging utility that suppresses non-error logs in production.
 * @module utils
 *
 * @example
 * logger.log('Debug info');   // Only in dev
 * logger.error('Always shown'); // In all environments
 */

// Debug logger that only logs in development mode
const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: any[]) => {
    // Always log errors
    console.error(...args);
  },
  debug: (...args: any[]) => {
    if (isDev) console.debug(...args);
  },
  info: (...args: any[]) => {
    if (isDev) console.info(...args);
  },
};
