/**
 * @file payment.ts
 * @description Constants for payment polling and callback logic.
 * @module lib/constants
 */

/** Maximum number of polling attempts for payment status */
export const PAYMENT_MAX_POLL_ATTEMPTS = 10;

/** Interval in milliseconds between payment status polls */
export const PAYMENT_POLL_INTERVAL_MS = 3000;
