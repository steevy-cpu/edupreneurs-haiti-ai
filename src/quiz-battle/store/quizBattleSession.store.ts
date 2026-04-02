/**
 * Quiz Battle Session Persistence Store
 * 
 * Manages sessionStorage for active quiz battles, allowing users to 
 * rejoin games if they accidentally navigate away or refresh the page.
 */

const QUIZ_BATTLE_SESSION_KEY = 'edupreneurs_quiz_battle_session';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

export interface QuizBattleSessionState {
  battleId: string;
  mode: 'solo' | 'friend' | 'random';
  joinedAt: number;
  expiresAt: number;
}

/**
 * Save an active quiz battle session to sessionStorage
 */
export function saveQuizBattleSession(battleId: string, mode: 'solo' | 'friend' | 'random'): void {
  try {
    const state: QuizBattleSessionState = {
      battleId,
      mode,
      joinedAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    sessionStorage.setItem(QUIZ_BATTLE_SESSION_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('[QuizBattleSession] Failed to save session:', err);
  }
}

/**
 * Retrieve an active quiz battle session from sessionStorage
 * Returns null if no session exists or if it has expired
 */
export function getQuizBattleSession(): QuizBattleSessionState | null {
  try {
    const stored = sessionStorage.getItem(QUIZ_BATTLE_SESSION_KEY);
    if (!stored) return null;
    
    const state: QuizBattleSessionState = JSON.parse(stored);
    
    // Check expiration
    if (Date.now() > state.expiresAt) {
      clearQuizBattleSession();
      return null;
    }
    
    return state;
  } catch (err) {
    console.error('[QuizBattleSession] Failed to get session:', err);
    clearQuizBattleSession();
    return null;
  }
}

/**
 * Clear the active quiz battle session from sessionStorage
 */
export function clearQuizBattleSession(): void {
  try {
    sessionStorage.removeItem(QUIZ_BATTLE_SESSION_KEY);
  } catch (err) {
    console.error('[QuizBattleSession] Failed to clear session:', err);
  }
}
