import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSessionAuth } from '@/contexts/SessionAuthContext';

// Map tour step index to nav icon path for mobile highlighting.
const TOUR_STEP_NAV_PATHS: Record<number, string | null> = {
  0: '/dashboard',
  1: '/dashboard',
  2: '/matieres',
  3: '/feed',
  4: null,
  5: null,
  6: '/community',
  7: null,
};

interface FirstTimeUserContextType {
  // Welcome popup state
  showWelcome: boolean;
  welcomeComplete: boolean;
  
  // Onboarding quiz state (between welcome and avatar)
  showOnboardingQuiz: boolean;
  onboardingQuizComplete: boolean;
  
  // Avatar generation step
  showAvatarGeneration: boolean;
  avatarGenerationComplete: boolean;
  
  // Tour state
  tourActive: boolean;
  tourStep: number;
  tourCompleted: boolean;
  currentTourNavPath: string | null;
  
  // User info
  userNickname: string | null;
  userGrade: string | null;
  userId: string | null;
  isSuperUser: boolean;
  isPendingGift: boolean;
  
  // Loading
  isLoading: boolean;
  
  // Actions
  completeWelcome: () => void;
  completeOnboardingQuiz: () => void;
  skipOnboardingQuiz: () => void;
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
  showOnboardingQuiz: false,
  onboardingQuizComplete: true,
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
  isPendingGift: false,
  isLoading: false,
  completeWelcome: () => {},
  completeOnboardingQuiz: () => {},
  skipOnboardingQuiz: () => {},
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
  if (!context) return SAFE_DEFAULTS;
  return context;
}

interface FirstTimeUserProviderProps {
  children: ReactNode;
}

export function FirstTimeUserProvider({ children }: FirstTimeUserProviderProps) {
  // Used to invalidate profile cache after onboarding saves nickname/grade/avatar
  const queryClient = useQueryClient();
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeComplete, setWelcomeComplete] = useState(false);
  const [showOnboardingQuiz, setShowOnboardingQuiz] = useState(false);
  const [onboardingQuizComplete, setOnboardingQuizComplete] = useState(false);
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

  const hasInitialized = useRef(false);

  const SUPER_USER_IDS = [
    '410b9fc5-6df8-4032-8469-df4588089055',
    '9e8c41d7-db17-407e-b02c-be1587e04617'
  ];

  const TEST_ACCOUNT_IDS = [
    '6698f395-7f46-48b9-b7d3-d1151d9cec8c'
  ];

  const location = useLocation();
  const isOnDashboard = location.pathname === '/dashboard';
  const { user: authUser, isAuthenticated } = useSessionAuth();

  // Check tour completion status when user is on dashboard
  useEffect(() => {
    const checkTourStatus = async () => {
      if (!isOnDashboard) { setIsLoading(false); return; }
      if (tourActive || showWelcome || showAvatarGeneration || showOnboardingQuiz) { setIsLoading(false); return; }
      if (hasInitialized.current) { setIsLoading(false); return; }
      if (!authUser) { setIsLoading(false); return; }

      try {
        setUserId(authUser.id);
        setIsSuperUser(SUPER_USER_IDS.includes(authUser.id));
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('nickname, academic_grade, onboarding_tour_completed, subscription_status, subscription_end_date, has_free_access')
          .eq('user_id', authUser.id)
          .maybeSingle();

        if (error) { console.error('Error fetching profile for tour:', error); setIsLoading(false); return; }

        setUserNickname(profile?.nickname || null);
        setUserGrade(profile?.academic_grade || null);

        // Skip onboarding if subscription is not active
        if (!profile?.has_free_access) {
          const isActive = profile?.subscription_status === 'active'
            && profile?.subscription_end_date
            && new Date(profile.subscription_end_date) > new Date();
          if (!isActive) { setIsLoading(false); return; }
        }

        const isTestAccount = TEST_ACCOUNT_IDS.includes(authUser.id);

        if (isTestAccount) {
          const sessionKey = `tour_session_started_${authUser.id}`;
          if (!sessionStorage.getItem(sessionKey)) {
            localStorage.removeItem(`first_time_tour_completed_${authUser.id}`);
            sessionStorage.setItem(sessionKey, 'true');
            setShowWelcome(true);
            setTourCompleted(false);
          }
        } else {
          const dbCompleted = profile?.onboarding_tour_completed === true;
          const localCompleted = localStorage.getItem(`first_time_tour_completed_${authUser.id}`) === 'true';
          if (dbCompleted || localCompleted) {
            setTourCompleted(true);
            setShowWelcome(false);
          } else {
            setShowWelcome(true);
          }
        }

        hasInitialized.current = true;
      } catch (error) {
        console.error('Error checking tour status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTourStatus();
  }, [isOnDashboard, tourActive, showWelcome, showAvatarGeneration, showOnboardingQuiz, authUser]);

  // Handle sign out state reset
  useEffect(() => {
    if (!isAuthenticated && userId) {
      hasInitialized.current = false;
      setShowWelcome(false);
      setWelcomeComplete(false);
      setShowOnboardingQuiz(false);
      setOnboardingQuizComplete(false);
      setShowAvatarGeneration(false);
      setAvatarGenerationComplete(false);
      setTourActive(false);
      setTourStep(0);
      setTourCompleted(false);
      setUserNickname(null);
      setUserGrade(null);
      if (userId) sessionStorage.removeItem(`tour_session_started_${userId}`);
      setUserId(null);
    }
  }, [isAuthenticated, userId]);

  // Phase: welcome → onboarding_quiz → avatar_generation → tour → completed
  const completeWelcome = useCallback(() => {
    setWelcomeComplete(true);
    setShowWelcome(false);
    // Advance to onboarding quiz (not directly to avatar)
    setShowOnboardingQuiz(true);
  }, []);

  const completeOnboardingQuiz = useCallback(() => {
    setOnboardingQuizComplete(true);
    setShowOnboardingQuiz(false);
    // Invalidate profile cache so dashboard shows fresh nickname/grade
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    // Advance to avatar generation
    setShowAvatarGeneration(true);
  }, [queryClient]);

  const skipOnboardingQuiz = useCallback(() => {
    // Same as complete — advances to avatar step
    setOnboardingQuizComplete(true);
    setShowOnboardingQuiz(false);
    // Invalidate in case user had partial saves before skipping
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    setShowAvatarGeneration(true);
  }, [queryClient]);

  const completeAvatarGeneration = useCallback(() => {
    setAvatarGenerationComplete(true);
    setShowAvatarGeneration(false);
    // Invalidate profile cache so dashboard shows fresh avatar
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    setTourActive(true);
    setTourStep(0);
  }, [queryClient]);

  const skipAvatarGeneration = useCallback(() => {
    setAvatarGenerationComplete(true);
    setShowAvatarGeneration(false);
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
    if (userId) {
      localStorage.setItem(`first_time_tour_completed_${userId}`, 'true');
      await supabase.from('profiles').update({ 
        onboarding_tour_completed: true,
        onboarding_tour_completed_at: new Date().toISOString()
      }).eq('user_id', userId);
    }
  }, [userId]);

  const completeTour = useCallback(async () => {
    setTourActive(false);
    setTourCompleted(true);
    if (userId) {
      localStorage.setItem(`first_time_tour_completed_${userId}`, 'true');
      try {
        await supabase.from('profiles').update({ 
          onboarding_tour_completed: true,
          onboarding_tour_completed_at: new Date().toISOString()
        }).eq('user_id', userId);
      } catch (error) {
        console.error('Error saving tour completion:', error);
      }
    }
  }, [userId]);

  const restartTour = useCallback(() => {
    setTourCompleted(false);
    setWelcomeComplete(false);
    setOnboardingQuizComplete(false);
    setAvatarGenerationComplete(false);
    setShowOnboardingQuiz(false);
    setShowAvatarGeneration(false);
    setShowWelcome(true);
    setTourActive(false);
    setTourStep(0);
    hasInitialized.current = false;
    if (userId) {
      localStorage.removeItem(`first_time_tour_completed_${userId}`);
      sessionStorage.removeItem(`tour_session_started_${userId}`);
    }
  }, [userId]);

  const currentTourNavPath = tourActive && !tourCompleted 
    ? TOUR_STEP_NAV_PATHS[tourStep] ?? null 
    : null;

  return (
    <FirstTimeUserContext.Provider
      value={{
        showWelcome,
        welcomeComplete,
        showOnboardingQuiz,
        onboardingQuizComplete,
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
        completeOnboardingQuiz,
        skipOnboardingQuiz,
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
