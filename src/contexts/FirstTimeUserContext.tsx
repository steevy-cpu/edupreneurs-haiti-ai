import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Map tour step index to nav icon path for mobile highlighting
const TOUR_STEP_NAV_PATHS: Record<number, string | null> = {
  0: '/dashboard',    // Home icon
  1: '/matieres',     // BookOpen icon
  2: '/feed',         // Rss icon
  3: null,            // /leaderboard - no nav icon
  4: null,            // /passion-discovery - no nav icon
  5: '/community',    // MessageSquare icon
  6: null,            // /settings - no nav icon
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

  // Get current location to check if user is on dashboard
  const location = useLocation();
  const isOnDashboard = location.pathname === '/dashboard';

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

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        setUserId(user.id);
        setIsSuperUser(SUPER_USER_IDS.includes(user.id));
        // Fetch profile data including tour completion status
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('nickname, academic_grade, onboarding_tour_completed')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile for tour:', error);
          setIsLoading(false);
          return;
        }

        setUserNickname(profile?.nickname || null);
        setUserGrade(profile?.academic_grade || null);

        // Check if this is a test account - always show tour for testing
        const isTestAccount = TEST_ACCOUNT_IDS.includes(user.id);

        if (isTestAccount) {
          // Test accounts: only show if not already started in this session
          const sessionKey = `tour_session_started_${user.id}`;
          if (!sessionStorage.getItem(sessionKey)) {
            console.log('Test account detected - showing tour for testing');
            localStorage.removeItem(`first_time_tour_completed_${user.id}`);
            sessionStorage.setItem(sessionKey, 'true');
            setShowWelcome(true);
            setTourCompleted(false);
          }
        } else {
          // Check if tour was already completed
          const dbCompleted = profile?.onboarding_tour_completed === true;
          const localCompleted = localStorage.getItem(`first_time_tour_completed_${user.id}`) === 'true';
          
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user && isOnDashboard) {
        // Only check if not already initialized and tour not active
        if (!hasInitialized.current && !tourActive && !showWelcome) {
          checkTourStatus();
        }
      } else if (event === 'SIGNED_OUT') {
        // Reset everything on sign out
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
        setUserId(null);
        // Clear session storage for this user
        if (session?.user?.id) {
          sessionStorage.removeItem(`tour_session_started_${session.user.id}`);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [isOnDashboard, tourActive, showWelcome, showAvatarGeneration]);

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
