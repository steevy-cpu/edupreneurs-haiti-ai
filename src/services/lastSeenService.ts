import { supabase } from '@/integrations/supabase/client';

/** Heartbeat interval: 5 minutes */
export const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Persist the user's last_seen timestamp to the database.
 * Fire-and-forget pattern - does not block UI.
 */
export async function persistLastSeen(userId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('persist_last_seen', { 
      p_user_id: userId 
    });
    if (error) {
      console.warn('[LastSeen] Failed to persist:', error.message);
    }
  } catch (err) {
    // Silent fail - don't crash the app for timestamp updates
    console.warn('[LastSeen] Network error:', err);
  }
}

/**
 * Send final last_seen via beacon API for tab close scenarios.
 * More reliable than fetch in beforeunload.
 */
export function persistLastSeenBeacon(userId: string): void {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/persist_last_seen`;
  const payload = JSON.stringify({ p_user_id: userId });
  
  // sendBeacon is more reliable during page unload
  const sent = navigator.sendBeacon(
    url, 
    new Blob([payload], { type: 'application/json' })
  );
  
  if (!sent) {
    // Fallback - try fetch with keepalive
    // Get the current session synchronously if possible
    const session = supabase.auth.getSession();
    
    fetch(url, {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      keepalive: true
    }).catch(() => {/* silent */});
  }
}
