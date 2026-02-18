import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSessionAuth } from '@/contexts/SessionAuthContext';

// Map tour step index to nav icon path for mobile highlighting.
// IMPORTANT: Keep this in sync with tourSteps array in FirstTimeUserTour.tsx (8 steps).
// Step 1 (Music FAB) stays on /dashboard, so it maps to '/dashboard' — not null.
const TOUR_STEP_NAV_PATHS: Record<number, string | null> = {
  0: '/dashboard',    // Dashboard KPI cards
  1: '/dashboard',    // Music FAB (stays on /dashboard)
  2: '/matieres',     // BookOpen icon
  3: '/feed',         // Rss icon
  4: null,            // /leaderboard - no nav icon
  5: null,            // /passion-discovery - no nav icon
  6: '/community',    // MessageSquare icon
  7: null,            // /settings - no nav icon
};

interface FirstTimeUserContextType {
  // Welcome popup state
  showWelcome: boolean;
  welcomeComplete: boolean;
  
  // Avatar generation step
  showAvatarGeneration: boolean;
  avatarGenerationComplete: boolean;
  
  // Tour state
  tourActive: boolean;
  tourStep: number;
  tourCompleted: boolean;
  currentTourNavPath: string | null; // Path to highlight in mobile nav
  
  // User info
  userNickname: string | null;
  userGrade: string | null;
  userId: string | null;
  isSuperUser: boolean;
  
  // Loading
  isLoading: boolean;
  
  // Actions
  completeWelcome: () => void;
  completeAvatarGeneration: () => void;
  skipAvatarGeneration: () => void;
  startTour: () => void;
  nextTourStep: () => void;
  previousTourStep: () => void;
  skipTour: () => void;
  completeTour: () => Promise<void>;
  restartTour: () => void;
}

const FirstTimeUserContext = createContext<FirstTimeUserContextType | null>(null);

// Safe defaults when context is unavailable (prevents React error #310)
const SAFE_DEFAULTS: FirstTimeUserContextType = {
  showWelcome: false,
  welcomeComplete: true,
  showAvatarGeneration: false,
  avatarGenerationComplete: true,
  tourActive: false,
  tourStep: 0,
  tourCompleted: true,
  currentTourNavPath: null,
  userNickname: null,
  userGrade: null,
  userId: null,
  isSuperUser: false,
  isLoading: false,
  completeWelcome: () => {},
  completeAvatarGeneration: () => {},
  skipAvatarGeneration: () => {},
  startTour: () => {},
  nextTourStep: () => {},
  previousTourStep: () => {},
  skipTour: () => {},
  completeTour: async () => {},
  restartTour: () => {},
};

export function useFirstTimeUser(): FirstTimeUserContextType {
  const context = useContext(FirstTimeUserContext);
  
  // Return safe defaults instead of throwing when context is unavailable
  // This prevents React error #310 during navigation transitions
  if (!context) {
    return SAFE_DEFAULTS;
  }
  
  return context;
}

interface FirstTimeUserProviderProps {
  children: ReactNode;
}

export function FirstTimeUserProvider({ children }: FirstTimeUserProviderProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeComplete, setWelcomeComplete] = useState(false);
  const [showAvatarGeneration, setShowAvatarGeneration] = useState(false);
  const [avatarGenerationComplete, setAvatarGenerationComplete] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [userGrade, setUserGrade] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Ref to track if onboarding has been initialized this session
  const hasInitialized = useRef(false);

  // Super user IDs
  const SUPER_USER_IDS = [
    '410b9fc5-6df8-4032-8469-df4588089055', // Steevy
    '9e8c41d7-db17-407e-b02c-be1587e04617'  // Djood
  ];

  // Test account IDs - always show tour for testing
  const TEST_ACCOUNT_IDS = [
    '6698f395-7f46-48b9-b7d3-d1151d9cec8c'  // vibemusical02@gmail.com (Test01)
  ];

  const location = useLocation();
  const isOnDashboard = location.pathname === '/dashboard';
  
  // Use centralized session auth - eliminates duplicate getUser() call
  const { user: authUser, isAuthenticated } = useSessionAuth();

  // Check tour completion status when user is on dashboard
  useEffect(() => {
    const checkTourStatus = async () => {
      // Only proceed if user is on the dashboard
      if (!isOnDashboard) {
        setIsLoading(false);
        return;
      }

      // CRITICAL FIX: Skip if tour/welcome is already active to prevent restart
      if (tourActive || showWelcome || showAvatarGeneration) {
        setIsLoading(false);
        return;
      }

      // CRITICAL FIX: Skip if already initialized this session
      if (hasInitialized.current) {
        setIsLoading(false);
        return;
      }

      // Use user from centralized auth context instead of separate getUser() call
      if (!authUser) {
        setIsLoading(false);
        return;
      }

      try {
        setUserId(authUser.id);
        setIsSuperUser(SUPER_USER_IDS.includes(authUser.id));
        // Fetch profile data including tour completion status
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('nickname, academic_grade, onboarding_tour_completed, subscription_status, subscription_end_date, has_free_access')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile for tour:', error);
          setIsLoading(false);
          return;
        }

        setUserNickname(profile?.nickname || null);
        setUserGrade(profile?.academic_grade || null);

        // Skip onboarding if subscription is not active
        // (SubscriptionGate will show payment/pending prompt instead)
        if (!profile?.has_free_access) {
          const isActive = profile?.subscription_status === 'active'
            && profile?.subscription_end_date
            && new Date(profile.subscription_end_date) > new Date();

          if (!isActive) {
            setIsLoading(false);
            // Do NOT set hasInitialized.current = true here.
            // Let checkTourStatus re-run when subscription activates.
            return;
          }
        }

        // Check if this is a test account - always show tour for testing
        const isTestAccount = TEST_ACCOUNT_IDS.includes(authUser.id);

        if (isTestAccount) {
          // Test accounts: only show if not already started in this session
          const sessionKey = `tour_session_started_${authUser.id}`;
          if (!sessionStorage.getItem(sessionKey)) {
            console.log('Test account detected - showing tour for testing');
            localStorage.removeItem(`first_time_tour_completed_${authUser.id}`);
            sessionStorage.setItem(sessionKey, 'true');
            setShowWelcome(true);
            setTourCompleted(false);
          }
        } else {
          // Check if tour was already completed
          const dbCompleted = profile?.onboarding_tour_completed === true;
          const localCompleted = localStorage.getItem(`first_time_tour_completed_${authUser.id}`) === 'true';
          
          if (dbCompleted || localCompleted) {
            setTourCompleted(true);
            setShowWelcome(false);
          } else {
            // First time user - show welcome!
            setShowWelcome(true);
          }
        }

        // Mark as initialized after successful setup
        hasInitialized.current = true;
      } catch (error) {
        console.error('Error checking tour status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTourStatus();

    // React to auth state changes via centralized SessionAuth
    // The auth listener is now in SessionAuthContext, so we just need to react to user changes
  }, [isOnDashboard, tourActive, showWelcome, showAvatarGeneration, authUser]);

  // Handle sign out state reset
  useEffect(() => {
    if (!isAuthenticated && userId) {
      // User signed out - reset everything
      hasInitialized.current = false;
      setShowWelcome(false);
      setWelcomeComplete(false);
      setShowAvatarGeneration(false);
      setAvatarGenerationComplete(false);
      setTourActive(false);
      setTourStep(0);
      setTourCompleted(false);
      setUserNickname(null);
      setUserGrade(null);
      if (userId) {
        sessionStorage.removeItem(`tour_session_started_${userId}`);
      }
      setUserId(null);
    }
  }, [isAuthenticated, userId]);

  const completeWelcome = useCallback(() => {
    setWelcomeComplete(true);
    setShowWelcome(false);
    // Show avatar generation step after welcome
    setShowAvatarGeneration(true);
  }, []);

  const completeAvatarGeneration = useCallback(() => {
    setAvatarGenerationComplete(true);
    setShowAvatarGeneration(false);
    // Start tour after avatar generation
    setTourActive(true);
    setTourStep(0);
  }, []);

  const skipAvatarGeneration = useCallback(() => {
    setAvatarGenerationComplete(true);
    setShowAvatarGeneration(false);
    // Start tour even if avatar is skipped
    setTourActive(true);
    setTourStep(0);
  }, []);

  const startTour = useCallback(() => {
    setTourActive(true);
    setTourStep(0);
  }, []);

  const nextTourStep = useCallback(() => {
    setTourStep(prev => prev + 1);
  }, []);

  const previousTourStep = useCallback(() => {
    setTourStep(prev => Math.max(0, prev - 1));
  }, []);

  const skipTour = useCallback(async () => {
    setTourActive(false);
    setTourCompleted(true);
    
    // Save to database and localStorage
    if (userId) {
      localStorage.setItem(`first_time_tour_completed_${userId}`, 'true');
      
      await supabase
        .from('profiles')
        .update({ 
          onboarding_tour_completed: true,
          onboarding_tour_completed_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    }
  }, [userId]);

  const completeTour = useCallback(async () => {
    setTourActive(false);
    setTourCompleted(true);
    
    // Save to database and localStorage
    if (userId) {
      localStorage.setItem(`first_time_tour_completed_${userId}`, 'true');
      
      try {
        await supabase
          .from('profiles')
          .update({ 
            onboarding_tour_completed: true,
            onboarding_tour_completed_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        console.log('Tour completion saved to database');
      } catch (error) {
        console.error('Error saving tour completion:', error);
      }
    }
  }, [userId]);

  const restartTour = useCallback(() => {
    // For testing purposes - restart the tour
    setTourCompleted(false);
    setWelcomeComplete(false);
    setAvatarGenerationComplete(false);
    setShowAvatarGeneration(false);
    setShowWelcome(true);
    setTourActive(false);
    setTourStep(0);
    
    // Reset initialization flag to allow restart
    hasInitialized.current = false;
    
    if (userId) {
      localStorage.removeItem(`first_time_tour_completed_${userId}`);
      sessionStorage.removeItem(`tour_session_started_${userId}`);
    }
  }, [userId]);

  // Compute which nav path should be highlighted during tour
  const currentTourNavPath = tourActive && !tourCompleted 
    ? TOUR_STEP_NAV_PATHS[tourStep] ?? null 
    : null;

  return (
    <FirstTimeUserContext.Provider
      value={{
        showWelcome,
        welcomeComplete,
        showAvatarGeneration,
        avatarGenerationComplete,
        tourActive,
        tourStep,
        tourCompleted,
        currentTourNavPath,
        userNickname,
        userGrade,
        userId,
        isSuperUser,
        isLoading,
        completeWelcome,
        completeAvatarGeneration,
        skipAvatarGeneration,
        startTour,
        nextTourStep,
        previousTourStep,
        skipTour,
        completeTour,
        restartTour,
      }}
    >
      {children}
    </FirstTimeUserContext.Provider>
  );
}
