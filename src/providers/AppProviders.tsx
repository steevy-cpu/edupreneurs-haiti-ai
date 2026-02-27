/**
 * Rationalized Provider Stack
 * 
 * Organized into logical layers to minimize re-renders and improve performance:
 * 
 * LAYER 1: Core Infrastructure (never re-render)
 *   - QueryClientProvider
 *   - SessionAuthProvider
 *   - NetworkProvider
 *   - ThemeProvider
 * 
 * LAYER 2: UI Utilities (low-cost re-renders)
 *   - TooltipProvider
 *   - Toasters
 * 
 * LAYER 3: Feature Providers (auth-dependent, heavier)
 *   - MusicPlayerProvider
 *   - PresenceProvider
 *   - VisitorProvider
 *   - FirstTimeUserProvider
 */

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Core Infrastructure
import { SessionAuthProvider } from '@/contexts/SessionAuthContext';
import { NetworkProvider } from '@/contexts/NetworkContext';
import { ThemeProvider } from '@/components/ThemeProvider';

// UI Utilities
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

// Feature Providers (auth-dependent)
import { MusicPlayerProvider } from '@/contexts/MusicPlayerContext';
import { PresenceProvider } from '@/contexts/PresenceContext';
import { VisitorProvider } from '@/contexts/VisitorContext';
import { FirstTimeUserProvider } from '@/contexts/FirstTimeUserContext';
import { JudeAudioProvider } from '@/contexts/JudeAudioContext';
import { StreakProvider } from '@/contexts/StreakContext';

/**
 * Query client with optimized settings for 3G performance.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
      gcTime: 1000 * 60 * 30, // Cache persists for 30 minutes
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch on component mount if data is fresh
      retry: 1, // Only retry failed requests once
    },
  },
});

interface UIProvidersProps {
  children: ReactNode;
}

/**
 * Layer 2: UI utility providers with low re-render cost.
 */
function UIProviders({ children }: UIProvidersProps) {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {children}
    </TooltipProvider>
  );
}

interface FeatureProvidersProps {
  children: ReactNode;
}

/**
 * Layer 3: Feature providers that depend on auth.
 * These are heavier and should be inside the router for route access.
 */
function FeatureProviders({ children }: FeatureProvidersProps) {
  return (
    <PresenceProvider>
      <VisitorProvider>
        <MusicPlayerProvider>
          {/* JudeAudioProvider after MusicPlayer — needs useMusicPlayer for ducking */}
          <JudeAudioProvider>
            {/* StreakProvider after JudeAudio — uses edge function, no heavy deps */}
            <StreakProvider>
              <FirstTimeUserProvider>
                {children}
              </FirstTimeUserProvider>
            </StreakProvider>
          </JudeAudioProvider>
        </MusicPlayerProvider>
      </VisitorProvider>
    </PresenceProvider>
  );
}

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Complete provider stack with optimized layering.
 * 
 * Order matters:
 * 1. QueryClientProvider - caching layer
 * 2. SessionAuthProvider - auth state
 * 3. NetworkProvider - connection detection
 * 4. ThemeProvider - theming
 * 5. UIProviders - tooltips, toasts
 * 6. BrowserRouter - routing
 * 7. FeatureProviders - auth-dependent features
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionAuthProvider>
        <NetworkProvider>
            <ThemeProvider 
              attribute="class" 
              defaultTheme="system" 
              enableSystem={true} 
              storageKey="edupreneur-theme"
              forcedTheme={undefined}
            >
            <UIProviders>
              <BrowserRouter>
                <FeatureProviders>
                  {children}
                </FeatureProviders>
              </BrowserRouter>
            </UIProviders>
          </ThemeProvider>
        </NetworkProvider>
      </SessionAuthProvider>
    </QueryClientProvider>
  );
}

export default AppProviders;
