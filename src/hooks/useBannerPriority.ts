import { useState, useEffect } from "react";

interface BannerState {
  id: string;
  priority: number;
  dismissed: boolean;
  dismissedAt?: number;
}

const BANNER_DISMISS_DAYS = 7;

export const useBannerPriority = () => {
  const [dismissedBanners, setDismissedBanners] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dismissed-banners');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dismissed-banners', JSON.stringify(dismissedBanners));
    }
  }, [dismissedBanners]);

  const dismissBanner = (bannerId: string, days: number = BANNER_DISMISS_DAYS) => {
    const expiresAt = Date.now() + (days * 24 * 60 * 60 * 1000);
    setDismissedBanners(prev => ({
      ...prev,
      [bannerId]: expiresAt,
    }));
  };

  const isBannerDismissed = (bannerId: string): boolean => {
    const expiresAt = dismissedBanners[bannerId];
    if (!expiresAt) return false;
    
    // Check if dismissal has expired
    if (Date.now() > expiresAt) {
      // Clean up expired dismissal
      setDismissedBanners(prev => {
        const next = { ...prev };
        delete next[bannerId];
        return next;
      });
      return false;
    }
    
    return true;
  };

  const getActiveBanner = (banners: { id: string; priority: number; show: boolean }[]): string | null => {
    // Sort by priority (lower number = higher priority)
    const sortedBanners = [...banners]
      .filter(b => b.show && !isBannerDismissed(b.id))
      .sort((a, b) => a.priority - b.priority);
    
    return sortedBanners[0]?.id || null;
  };

  return {
    dismissBanner,
    isBannerDismissed,
    getActiveBanner,
  };
};

export default useBannerPriority;
