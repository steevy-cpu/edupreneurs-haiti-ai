/**
 * Hook to detect if virtual keyboard is open on mobile.
 * Used by FloatingLayer and MobileBottomNav to hide when keyboard appears.
 */

import { useState, useEffect, useCallback } from 'react';

const KEYBOARD_THRESHOLD = 150; // pixels

/**
 * Detects if the virtual keyboard is open on mobile devices.
 * Uses viewport height comparison with a threshold.
 * 
 * @returns boolean indicating if keyboard appears to be open
 */
export function useKeyboardOpen(): boolean {
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  
  const checkKeyboard = useCallback(() => {
    // Only check on mobile/tablet devices
    if (typeof window === 'undefined' || window.innerWidth > 1024) {
      return;
    }
    
    // Use visualViewport if available (more accurate)
    if (window.visualViewport) {
      const heightDiff = window.innerHeight - window.visualViewport.height;
      setKeyboardOpen(heightDiff > KEYBOARD_THRESHOLD);
      return;
    }
    
    // Fallback: check if focused element is an input
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.getAttribute('contenteditable') === 'true'
    );
    
    setKeyboardOpen(!!isInputFocused);
  }, []);
  
  useEffect(() => {
    // Initial check
    checkKeyboard();
    
    // Listen to visualViewport changes (most reliable)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', checkKeyboard);
      return () => {
        window.visualViewport?.removeEventListener('resize', checkKeyboard);
      };
    }
    
    // Fallback: listen to focus/blur events
    const handleFocus = () => setTimeout(checkKeyboard, 100);
    const handleBlur = () => setTimeout(checkKeyboard, 100);
    
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, [checkKeyboard]);
  
  return keyboardOpen;
}

export default useKeyboardOpen;
