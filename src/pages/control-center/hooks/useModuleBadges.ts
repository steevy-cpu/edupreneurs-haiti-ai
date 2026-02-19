import { useState, useEffect, useCallback } from "react";
import { CONTROL_CENTER_MODULES } from "../modules";

export function useModuleBadges() {
  const [badges, setBadges] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const refreshBadges = useCallback(async () => {
    setIsLoading(true);

    // Only modules that declare a badge function
    const badgeModules = CONTROL_CENTER_MODULES.filter(m => m.badge);

    // Fire all badge queries simultaneously — allSettled ensures one failure
    // does not cancel the others; failed badges fall back to 0 silently
    const results = await Promise.allSettled(
      badgeModules.map(m => m.badge!())
    );

    const newBadges: Record<string, number> = {};
    results.forEach((result, index) => {
      const moduleId = badgeModules[index].id;
      if (result.status === "fulfilled") {
        newBadges[moduleId] = result.value;
      } else {
        console.error(`Error fetching badge for ${moduleId}:`, result.reason);
        newBadges[moduleId] = 0;
      }
    });

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
