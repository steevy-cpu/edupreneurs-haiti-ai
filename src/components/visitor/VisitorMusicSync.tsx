import { useEffect, useRef } from "react";
import { useVisitor } from "@/contexts/VisitorContext";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

/**
 * Root-level component that watches visitor mode state and stops music
 * when user exits visitor mode. This component is always mounted (in App.tsx),
 * so it survives route changes like navigating to /auth.
 */
export const VisitorMusicSync = () => {
  const { isVisitor } = useVisitor();
  const { stopMusic } = useMusicPlayer();
  const prevIsVisitorRef = useRef<boolean>(isVisitor);

  useEffect(() => {
    // Only stop music when transitioning FROM visitor mode TO non-visitor mode
    if (prevIsVisitorRef.current === true && isVisitor === false) {
      stopMusic();
    }
    
    // Update ref for next comparison
    prevIsVisitorRef.current = isVisitor;
  }, [isVisitor, stopMusic]);

  // This component renders nothing - it's just a state watcher
  return null;
};
