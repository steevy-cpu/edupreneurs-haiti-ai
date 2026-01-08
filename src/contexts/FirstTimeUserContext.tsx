import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FirstTimeUserContextType {
  // Welcome popup state
  showWelcome: boolean;
  welcomeComplete: boolean;
  
  // Tour state
  tourActive: boolean;
  tourStep: number;
  tourCompleted: boolean;
  
  // User info
  userNickname: string | null;
  userGrade: string | null;
  userId: string | null;
  
  // Loading
  isLoading: boolean;
  
  // Actions
  completeWelcome: () => void;
  startTour: () => void;
  nextTourStep: () => void;
  previousTourStep: () => void;
  skipTour: () => void;
  completeTour: () => Promise<void>;
  restartTour: () => void;
}

const FirstTimeUserContext = createContext<FirstTimeUserContextType | null>(null);

export function useFirstTimeUser() {
  const context = useContext(FirstTimeUserContext);
  if (!context) {
    throw new Error('useFirstTimeUser must be used within a FirstTimeUserProvider');
  }
  return context;
}

interface FirstTimeUserProviderProps {
  children: ReactNode;
}

export function FirstTimeUserProvider({ children }: FirstTimeUserProviderProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeComplete, setWelcomeComplete] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [userGrade, setUserGrade] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check tour completion status on mount
  useEffect(() => {
    const checkTourStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

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
      } catch (error) {
        console.error('Error checking tour status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTourStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        checkTourStatus();
      } else if (event === 'SIGNED_OUT') {
        setShowWelcome(false);
        setWelcomeComplete(false);
        setTourActive(false);
        setTourStep(0);
        setTourCompleted(false);
        setUserNickname(null);
        setUserGrade(null);
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const completeWelcome = useCallback(() => {
    setWelcomeComplete(true);
    setShowWelcome(false);
    // Automatically start tour after welcome
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
    setShowWelcome(true);
    setTourActive(false);
    setTourStep(0);
    
    if (userId) {
      localStorage.removeItem(`first_time_tour_completed_${userId}`);
    }
  }, [userId]);

  return (
    <FirstTimeUserContext.Provider
      value={{
        showWelcome,
        welcomeComplete,
        tourActive,
        tourStep,
        tourCompleted,
        userNickname,
        userGrade,
        userId,
        isLoading,
        completeWelcome,
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
