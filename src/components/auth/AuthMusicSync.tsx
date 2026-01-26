import { useEffect, useRef } from "react";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

/**
 * Root-level component that watches auth state and stops music
 * when user logs out. This component is always mounted (in FloatingLayer),
 * so it survives route changes like navigating to /auth.
 */
export const AuthMusicSync = () => {
  const { isAuthenticated, isLoading } = useSessionAuth();
  const { stopMusic } = useMusicPlayer();
  const prevAuthRef = useRef<boolean>(isAuthenticated);
  const initialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    // Skip during initial loading to avoid false triggers
    if (isLoading) return;
    
    // Skip the first render after loading completes
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      prevAuthRef.current = isAuthenticated;
      return;
    }

    // Stop music when transitioning FROM authenticated TO unauthenticated
    if (prevAuthRef.current === true && isAuthenticated === false) {
      console.log('[AuthMusicSync] User logged out -> stopping music');
      stopMusic();
    }
    
    // Update ref for next comparison
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, isLoading, stopMusic]);

  // This component renders nothing - it's just a state watcher
  return null;
};
