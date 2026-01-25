import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useSessionAuth } from "@/contexts/SessionAuthContext";

export type VisitorType = "student" | "parent" | "investor" | "educator" | null;

interface VisitorState {
  isVisitor: boolean;
  visitorType: VisitorType;
  tourStep: number;
  tourCompleted: boolean;
  tourActive: boolean;
  showWelcomePopup: boolean;
  setVisitorType: (type: VisitorType) => void;
  startVisitorMode: (type: VisitorType) => void;
  exitVisitorMode: () => void;
  nextTourStep: () => void;
  previousTourStep: () => void;
  skipTour: () => void;
  startTour: () => void;
  completeTour: () => void;
  completeWelcomePopup: () => void;
}

const VisitorContext = createContext<VisitorState | undefined>(undefined);

const VISITOR_STORAGE_KEY = "edupreneurs_visitor_mode";

interface VisitorProviderProps {
  children: ReactNode;
}

export const VisitorProvider = ({ children }: VisitorProviderProps) => {
  // Use centralized session auth - eliminates duplicate getSession() call
  const { isAuthenticated, user } = useSessionAuth();
  
  const [isVisitor, setIsVisitor] = useState(false);
  const [visitorType, setVisitorTypeState] = useState<VisitorType>(null);
  const [tourStep, setTourStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  // Load visitor state from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(VISITOR_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setIsVisitor(parsed.isVisitor || false);
        setVisitorTypeState(parsed.visitorType || null);
        setTourStep(parsed.tourStep || 0);
        setTourCompleted(parsed.tourCompleted || false);
        setTourActive(parsed.tourActive || false);
        setShowWelcomePopup(parsed.showWelcomePopup || false);
      }
    } catch (error) {
      console.error("[VisitorContext] Error loading visitor state:", error);
    }
  }, []);

  // Auto-clear visitor mode when user signs in (reactive to centralized auth)
  useEffect(() => {
    // Only clear visitor mode if there's an ACTUAL authenticated session
    if (isAuthenticated && user && isVisitor) {
      setIsVisitor(false);
      setVisitorTypeState(null);
      setTourStep(0);
      setTourCompleted(false);
      setTourActive(false);
      setShowWelcomePopup(false);
      sessionStorage.removeItem(VISITOR_STORAGE_KEY);
    }
  }, [isAuthenticated, user, isVisitor]);

  // Persist visitor state to sessionStorage
  useEffect(() => {
    if (isVisitor) {
      const state = {
        isVisitor,
        visitorType,
        tourStep,
        tourCompleted,
        tourActive,
        showWelcomePopup,
      };
      sessionStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(state));
    } else {
      sessionStorage.removeItem(VISITOR_STORAGE_KEY);
    }
  }, [isVisitor, visitorType, tourStep, tourCompleted, tourActive, showWelcomePopup]);

  const setVisitorType = (type: VisitorType) => {
    setVisitorTypeState(type);
  };

  const startVisitorMode = (type: VisitorType) => {
    setIsVisitor(true);
    setVisitorTypeState(type);
    setTourStep(0);
    setTourCompleted(false);
    setTourActive(false); // Tour doesn't start yet - wait for welcome popup
    setShowWelcomePopup(true); // Show welcome popup first
    
    // Analytics stub - ready for future implementation
    console.log("[Visitor Analytics] visitor_mode_started", { visitorType: type });
  };

  const completeWelcomePopup = () => {
    setShowWelcomePopup(false);
    setTourActive(true); // Now start the tour
    
    console.log("[Visitor Analytics] welcome_popup_completed");
  };

  const exitVisitorMode = () => {
    setIsVisitor(false);
    setVisitorTypeState(null);
    setTourStep(0);
    setTourCompleted(false);
    setTourActive(false);
    setShowWelcomePopup(false);
    sessionStorage.removeItem(VISITOR_STORAGE_KEY);
    
    // Analytics stub
    console.log("[Visitor Analytics] visitor_mode_exited");
  };

  const nextTourStep = () => {
    setTourStep((prev) => prev + 1);
    
    // Analytics stub
    console.log("[Visitor Analytics] tour_step_next", { step: tourStep + 1 });
  };

  const previousTourStep = () => {
    setTourStep((prev) => Math.max(0, prev - 1));
  };

  const skipTour = () => {
    setTourActive(false);
    setTourCompleted(true);
    
    // Analytics stub
    console.log("[Visitor Analytics] tour_skipped", { atStep: tourStep });
  };

  const startTour = () => {
    setTourActive(true);
    setTourStep(0);
    setTourCompleted(false);
  };

  const completeTour = () => {
    setTourActive(false);
    setTourCompleted(true);
    
    // Analytics stub
    console.log("[Visitor Analytics] tour_completed");
  };

  return (
    <VisitorContext.Provider
      value={{
        isVisitor,
        visitorType,
        tourStep,
        tourCompleted,
        tourActive,
        showWelcomePopup,
        setVisitorType,
        startVisitorMode,
        exitVisitorMode,
        nextTourStep,
        previousTourStep,
        skipTour,
        startTour,
        completeTour,
        completeWelcomePopup,
      }}
    >
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitor = () => {
  const context = useContext(VisitorContext);
  if (context === undefined) {
    throw new Error("useVisitor must be used within a VisitorProvider");
  }
  return context;
};
