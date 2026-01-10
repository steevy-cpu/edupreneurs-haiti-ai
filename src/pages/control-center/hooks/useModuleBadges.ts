import { useState, useEffect, useCallback, useRef } from "react";
import { CONTROL_CENTER_MODULES } from "../modules";

export function useModuleBadges() {
  const [badges, setBadges] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  const refreshBadges = useCallback(async () => {
    setIsLoading(true);
    const newBadges: Record<string, number> = {};
    
    // Fetch all badges in parallel for better performance
    const badgePromises = CONTROL_CENTER_MODULES
      .filter(module => module.badge)
      .map(async (module) => {
        try {
          const count = await module.badge!();
          return { id: module.id, count };
        } catch (error) {
          console.error(`Error fetching badge for ${module.id}:`, error);
          return { id: module.id, count: 0 };
        }
      });

    try {
      const results = await Promise.all(badgePromises);
      results.forEach(({ id, count }) => {
        newBadges[id] = count;
      });
      
      if (isMounted.current) {
        setBadges(newBadges);
      }
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    refreshBadges();
    
    // Refresh badges every 30 seconds
    const interval = setInterval(refreshBadges, 30000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [refreshBadges]);

  return { badges, refreshBadges, isLoading };
}
