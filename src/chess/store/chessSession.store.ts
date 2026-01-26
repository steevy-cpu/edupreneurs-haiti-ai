/**
 * Chess Session Persistence Store
 * 
 * Manages sessionStorage for active chess games, allowing users to 
 * rejoin games if they accidentally navigate away or close the browser.
 */

const CHESS_SESSION_KEY = 'edupreneurs_chess_session';
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface ChessSessionState {
  matchId: string;
  joinedAt: number;
  expiresAt: number;
}

/**
 * Save an active chess session to sessionStorage
 */
export function saveChessSession(matchId: string): void {
  try {
    const state: ChessSessionState = {
      matchId,
      joinedAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    sessionStorage.setItem(CHESS_SESSION_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save chess session:', err);
  }
}

/**
 * Retrieve an active chess session from sessionStorage
 * Returns null if no session exists or if it has expired
 */
export function getChessSession(): ChessSessionState | null {
  try {
    const stored = sessionStorage.getItem(CHESS_SESSION_KEY);
    if (!stored) return null;
    
    const state: ChessSessionState = JSON.parse(stored);
    
    // Check expiration
    if (Date.now() > state.expiresAt) {
      clearChessSession();
      return null;
    }
    
    return state;
  } catch (err) {
    console.error('Failed to get chess session:', err);
    clearChessSession();
    return null;
  }
}

/**
 * Clear the active chess session from sessionStorage
 */
export function clearChessSession(): void {
  try {
    sessionStorage.removeItem(CHESS_SESSION_KEY);
  } catch (err) {
    console.error('Failed to clear chess session:', err);
  }
}
