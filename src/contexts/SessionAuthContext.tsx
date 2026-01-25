import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { clearAllPersistedCache } from "@/utils/queryPersistence";
import { useQueryClient } from "@tanstack/react-query";

interface SessionAuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const SessionAuthContext = createContext<SessionAuthState | undefined>(undefined);

// Safe defaults for when context is accessed during initialization
const SAFE_DEFAULTS: SessionAuthState = {
  session: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

interface SessionAuthProviderProps {
  children: ReactNode;
}

export function SessionAuthProvider({ children }: SessionAuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Single initial session fetch - eliminates the waterfall of auth calls
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Single global auth state listener (consolidated from App.tsx and other components)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setIsLoading(false);

      // Cache management (moved from App.tsx)
      if (event === 'SIGNED_OUT') {
        clearAllPersistedCache();
        queryClient.clear();
        console.log('User signed out - cleared all caches');
      }
      if (event === 'SIGNED_IN') {
        // Clear stale profile cache to ensure fresh data for new user
        queryClient.removeQueries({ queryKey: ['user-profile'] });
        queryClient.removeQueries({ queryKey: ['sidebar-badges'] });
        console.log('User signed in - cleared profile caches for fresh data');
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const value: SessionAuthState = {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session?.user,
    isLoading,
  };

  return (
    <SessionAuthContext.Provider value={value}>
      {children}
    </SessionAuthContext.Provider>
  );
}

/**
 * Hook to access centralized session/auth state.
 * Returns safe defaults if used outside provider (during initialization).
 * This prevents React error #310 during navigation transitions.
 */
export function useSessionAuth(): SessionAuthState {
  const context = useContext(SessionAuthContext);
  // Return safe defaults if used outside provider (during initialization)
  if (context === undefined) {
    return SAFE_DEFAULTS;
  }
  return context;
}
