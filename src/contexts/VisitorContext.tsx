import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export type VisitorType = "student" | "parent" | "investor" | "educator" | null;

interface VisitorState {
  isVisitor: boolean;
  visitorType: VisitorType;
  tourStep: number;
  tourCompleted: boolean;
  tourActive: boolean;
  setVisitorType: (type: VisitorType) => void;
  startVisitorMode: (type: VisitorType) => void;
  exitVisitorMode: () => void;
  nextTourStep: () => void;
  previousTourStep: () => void;
  skipTour: () => void;
  startTour: () => void;
  completeTour: () => void;
}

const VisitorContext = createContext<VisitorState | undefined>(undefined);

const VISITOR_STORAGE_KEY = "edupreneurs_visitor_mode";

interface VisitorProviderProps {
  children: ReactNode;
}

export const VisitorProvider = ({ children }: VisitorProviderProps) => {
  const [isVisitor, setIsVisitor] = useState(false);
  const [visitorType, setVisitorTypeState] = useState<VisitorType>(null);
  const [tourStep, setTourStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [tourActive, setTourActive] = useState(false);

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
      }
    } catch (error) {
      console.error("[VisitorContext] Error loading visitor state:", error);
    }
  }, []);

  // Persist visitor state to sessionStorage
  useEffect(() => {
    if (isVisitor) {
      const state = {
        isVisitor,
        visitorType,
        tourStep,
        tourCompleted,
        tourActive,
      };
      sessionStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(state));
    } else {
      sessionStorage.removeItem(VISITOR_STORAGE_KEY);
    }
  }, [isVisitor, visitorType, tourStep, tourCompleted, tourActive]);

  const setVisitorType = (type: VisitorType) => {
    setVisitorTypeState(type);
  };

  const startVisitorMode = (type: VisitorType) => {
    setIsVisitor(true);
    setVisitorTypeState(type);
    setTourStep(0);
    setTourCompleted(false);
    setTourActive(true);
    
    // Analytics stub - ready for future implementation
    console.log("[Visitor Analytics] visitor_mode_started", { visitorType: type });
  };

  const exitVisitorMode = () => {
    setIsVisitor(false);
    setVisitorTypeState(null);
    setTourStep(0);
    setTourCompleted(false);
    setTourActive(false);
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
        setVisitorType,
        startVisitorMode,
        exitVisitorMode,
        nextTourStep,
        previousTourStep,
        skipTour,
        startTour,
        completeTour,
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
