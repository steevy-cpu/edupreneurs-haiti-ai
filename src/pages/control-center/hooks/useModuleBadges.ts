import { useState, useEffect, useCallback } from "react";
import { CONTROL_CENTER_MODULES } from "../modules";

export function useModuleBadges() {
  const [badges, setBadges] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const refreshBadges = useCallback(async () => {
    setIsLoading(true);
    const newBadges: Record<string, number> = {};
    
    for (const module of CONTROL_CENTER_MODULES) {
      if (module.badge) {
        try {
          const count = await module.badge();
          newBadges[module.id] = count;
        } catch (error) {
          console.error(`Error fetching badge for ${module.id}:`, error);
          newBadges[module.id] = 0;
        }
      }
    }
    
    setBadges(newBadges);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshBadges();
    
    // Refresh badges every 30 seconds
    const interval = setInterval(refreshBadges, 30000);
    return () => clearInterval(interval);
  }, [refreshBadges]);

  return { badges, refreshBadges, isLoading };
}
