import { useState, useEffect, useCallback } from 'react';

export interface CookiePreferences {
  essential: boolean; // Always true, cannot be disabled
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentState {
  hasDecided: boolean;
  hasAccepted: boolean;
  preferences: CookiePreferences;
}

const STORAGE_KEY = 'cookieConsent';
const PREFERENCES_KEY = 'cookiePreferences';

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
};

export const useCookieConsent = () => {
  const [state, setState] = useState<CookieConsentState>({
    hasDecided: false,
    hasAccepted: false,
    preferences: DEFAULT_PREFERENCES,
  });

  // Load consent state from localStorage on mount
  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    const preferencesStr = localStorage.getItem(PREFERENCES_KEY);
    
    let preferences = DEFAULT_PREFERENCES;
    if (preferencesStr) {
      try {
        preferences = JSON.parse(preferencesStr);
        // Ensure essential is always true
        preferences.essential = true;
      } catch {
        preferences = DEFAULT_PREFERENCES;
      }
    }
    
    setState({
      hasDecided: consent !== null,
      hasAccepted: consent === 'accepted' || consent === 'essential',
      preferences,
    });
  }, []);

  // Accept all cookies
  const acceptAll = useCallback(() => {
    const newPreferences: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem(STORAGE_KEY, 'accepted');
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
    setState({
      hasDecided: true,
      hasAccepted: true,
      preferences: newPreferences,
    });
  }, []);

  // Accept only essential cookies
  const acceptEssential = useCallback(() => {
    const newPreferences: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem(STORAGE_KEY, 'essential');
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
    setState({
      hasDecided: true,
      hasAccepted: true,
      preferences: newPreferences,
    });
  }, []);

  // Decline all non-essential cookies (same as acceptEssential)
  const decline = useCallback(() => {
    const newPreferences: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem(STORAGE_KEY, 'declined');
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
    setState({
      hasDecided: true,
      hasAccepted: false,
      preferences: newPreferences,
    });
  }, []);

  // Update specific preferences
  const updatePreferences = useCallback((newPreferences: Partial<CookiePreferences>) => {
    const updated: CookiePreferences = {
      ...state.preferences,
      ...newPreferences,
      essential: true, // Always keep essential true
    };
    
    const consentType = updated.analytics || updated.marketing ? 'accepted' : 'essential';
    localStorage.setItem(STORAGE_KEY, consentType);
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    
    setState(prev => ({
      ...prev,
      hasDecided: true,
      hasAccepted: true,
      preferences: updated,
    }));
  }, [state.preferences]);

  // Reset consent (for testing or settings page)
  const resetConsent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREFERENCES_KEY);
    setState({
      hasDecided: false,
      hasAccepted: false,
      preferences: DEFAULT_PREFERENCES,
    });
  }, []);

  // Check if a specific cookie type is allowed
  const isAllowed = useCallback((type: keyof CookiePreferences): boolean => {
    if (type === 'essential') return true;
    return state.hasAccepted && state.preferences[type];
  }, [state.hasAccepted, state.preferences]);

  return {
    ...state,
    acceptAll,
    acceptEssential,
    decline,
    updatePreferences,
    resetConsent,
    isAllowed,
  };
};

// Singleton event emitter for cookie consent changes
type ConsentListener = (accepted: boolean) => void;
const listeners: Set<ConsentListener> = new Set();

export const onConsentChange = (callback: ConsentListener) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const emitConsentChange = (accepted: boolean) => {
  listeners.forEach(cb => cb(accepted));
};
