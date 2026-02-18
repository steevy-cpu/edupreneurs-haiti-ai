/**
 * Batch Operation Session Persistence Store
 * 
 * Manages sessionStorage for active batch operations, allowing users to
 * see previous progress and resume if they refresh or navigate away.
 */

import type { OperationResult, OperationProgress } from "../types";

const SESSION_PREFIX = 'edupreneurs_batch_';
const SESSION_TTL_MS = 120 * 60 * 1000; // 120 minutes

export interface BatchSessionState {
  operationType: string;
  gradeLevel: string;
  progress: OperationProgress;
  results: OperationResult[];
  currentItem: string;
  savedAt: number;
  expiresAt: number;
}

function getKey(operationType: string, gradeLevel: string): string {
  return `${SESSION_PREFIX}${operationType}_${gradeLevel}`;
}

/**
 * Save batch operation progress to sessionStorage.
 * Called after each lesson completes.
 */
export function saveBatchSession(
  operationType: string,
  gradeLevel: string,
  progress: OperationProgress,
  results: OperationResult[],
  currentItem: string,
): void {
  try {
    const state: BatchSessionState = {
      operationType,
      gradeLevel,
      progress,
      results,
      currentItem,
      savedAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    sessionStorage.setItem(getKey(operationType, gradeLevel), JSON.stringify(state));
  } catch (err) {
    console.error('[BatchSession] Failed to save:', err);
  }
}

/**
 * Retrieve a saved batch session.
 * Returns null if no session exists or if it has expired.
 */
export function getBatchSession(operationType: string, gradeLevel: string): BatchSessionState | null {
  try {
    const stored = sessionStorage.getItem(getKey(operationType, gradeLevel));
    if (!stored) return null;

    const state: BatchSessionState = JSON.parse(stored);

    if (Date.now() > state.expiresAt) {
      clearBatchSession(operationType, gradeLevel);
      return null;
    }

    return state;
  } catch (err) {
    console.error('[BatchSession] Failed to get:', err);
    clearBatchSession(operationType, gradeLevel);
    return null;
  }
}

/**
 * Clear the batch session from sessionStorage.
 */
export function clearBatchSession(operationType: string, gradeLevel: string): void {
  try {
    sessionStorage.removeItem(getKey(operationType, gradeLevel));
  } catch (err) {
    console.error('[BatchSession] Failed to clear:', err);
  }
}
