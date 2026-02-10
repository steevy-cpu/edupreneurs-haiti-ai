/**
 * Floating Layer - Centralized floating UI components.
 * 
 * REPLACES scattered floating components across App.tsx and Layout.tsx.
 * All floating UI lives here with visibility controlled by the shell.
 * 
 * This component NEVER unmounts after login - only individual items hide/show.
 */

import { lazy, Suspense } from 'react';
import { useVisibility } from './hooks/useVisibility';
import { useKeyboardOpen } from '@/hooks/useKeyboardOpen';

// Lazy load floating components for better 3G performance
const JudeChatbot = lazy(() => import('@/components/JudeChatbot').then(m => ({ default: m.JudeChatbot })));
const GlobalMusicPlayer = lazy(() => import('@/components/GlobalMusicPlayer').then(m => ({ default: m.GlobalMusicPlayer })));
const QuickMessageFAB = lazy(() => import('@/components/shared/QuickMessageFAB'));
const CookieConsent = lazy(() => import('@/components/CookieConsent').then(m => ({ default: m.CookieConsent })));

// Visitor-specific components (VisitorMusicSync is in App.tsx to survive logout navigation)
const VisitorTour = lazy(() => import('@/components/visitor/VisitorTour').then(m => ({ default: m.VisitorTour })));

// First-time user overlays
const FirstTimeUserWelcome = lazy(() => import('@/components/firsttime/FirstTimeUserWelcome'));
const AvatarGenerationStep = lazy(() => import('@/components/firsttime/AvatarGenerationStep'));
const FirstTimeUserTour = lazy(() => import('@/components/firsttime/FirstTimeUserTour'));

// Wrapper components that handle their own props/logic
import { NotificationBannerWrapper } from './wrappers/NotificationBannerWrapper';
import { PWAPromptWrapper } from './wrappers/PWAPromptWrapper';
import { SubscriptionExpiryBannerWrapper } from './wrappers/SubscriptionExpiryBannerWrapper';

/**
 * Centralized floating UI layer.
 * Visibility is controlled by useVisibility hook based on current route.
 */
export function FloatingLayer() {
  const keyboardOpen = useKeyboardOpen();
  const visibility = useVisibility({ keyboardOpen });
  
  return (
    <>
      {/* AI Assistant - Jude */}
      {visibility.showJude && (
        <Suspense fallback={null}>
          <JudeChatbot />
        </Suspense>
      )}
      
      {/* Music Player */}
      {visibility.showMusicPlayer && (
        <Suspense fallback={null}>
          <GlobalMusicPlayer />
        </Suspense>
      )}
      
      {/* Quick Message FAB */}
      {visibility.showQuickMessage && (
        <Suspense fallback={null}>
          <QuickMessageFAB />
        </Suspense>
      )}
      
      {/* Notification Permission Banner - has internal userId logic */}
      {visibility.showNotificationBanner && <NotificationBannerWrapper />}
      
      {/* Subscription Expiry Warning Banner */}
      {visibility.showSubscriptionBanner && <SubscriptionExpiryBannerWrapper />}
      
      {/* PWA Install Prompt - has internal hook logic */}
      {visibility.showPWAPrompt && <PWAPromptWrapper />}
      
      {/* Cookie Consent - self-manages visibility */}
      <Suspense fallback={null}>
        <CookieConsent />
      </Suspense>
      
      {/* Visitor-specific overlays (VisitorMusicSync is in App.tsx) */}
      <Suspense fallback={null}>
        <VisitorTour />
      </Suspense>
      
      {/* First-time user onboarding sequence */}
      <OnboardingOverlays />
    </>
  );
}

/**
 * Onboarding overlays - renders sequentially (one at a time).
 * These are self-managing based on FirstTimeUserContext.
 */
function OnboardingOverlays() {
  return (
    <Suspense fallback={null}>
      <FirstTimeUserWelcome />
      <AvatarGenerationStep />
      <FirstTimeUserTour />
    </Suspense>
  );
}

export default FloatingLayer;
