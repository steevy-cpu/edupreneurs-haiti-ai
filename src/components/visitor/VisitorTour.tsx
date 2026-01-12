import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";
import { useVisitor } from "@/contexts/VisitorContext";
import { useVisitorAnalytics } from "@/hooks/useVisitorAnalytics";

interface TourStep {
  path: string;
  title: string;
  description: string;
  target?: string;
  position?: "bottom" | "top" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    path: "/dashboard",
    title: "Votre tableau de bord 📊",
    description: "Suivez votre progression, vos séries de jours d'étude et vos objectifs hebdomadaires. Tout est centralisé ici !",
    target: "[data-tour='dashboard-stats']",
  },
  {
    path: "/matieres",
    title: "Toutes les matières 📚",
    description: "Accédez aux cours de maths, français, sciences et plus. Chaque leçon a des résumés clairs et des quiz interactifs !",
    target: "[data-tour='subject-grid']",
  },
  {
    path: "/feed",
    title: "Fil d'actualité 📱",
    description: "Connectez-vous avec d'autres étudiants, partagez vos succès et posez des questions à la communauté.",
    target: "[data-tour='feed-content']",
  },
  {
    path: "/leaderboard",
    title: "Classement en temps réel 🏆",
    description: "Voyez les meilleurs apprenants et leur progression. Gagnez des pièces d'or en étudiant !",
    target: "[data-tour='leaderboard-list']",
  },
  {
    path: "/passion-discovery",
    title: "Découverte des passions 🎨",
    description: "Explorez la musique, les arts, les échecs et la littérature avec des modules interactifs !",
    target: "[data-tour='passion-categories']",
  },
  {
    path: "/chess-game",
    title: "Jeux éducatifs ♟️",
    description: "Jouez aux échecs contre Jude, notre coach IA ! Améliorez votre logique et stratégie.",
    target: "[data-tour='chess-board']",
  },
  {
    path: "/community",
    title: "Messages et communauté 💬",
    description: "Discutez en privé avec d'autres étudiants et formez des groupes d'étude pour réviser ensemble.",
    target: "[data-tour='community-list']",
  },
];

export const VisitorTour = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isVisitor, tourStep, tourActive, tourCompleted, nextTourStep, previousTourStep, skipTour, completeTour } = useVisitor();
  const { trackTourStep, trackTourSkip, trackTourComplete } = useVisitorAnalytics();
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [ericImage, setEricImage] = useState<string | null>(null);
  
  // Lazy load the Eric image for 3G optimization
  useEffect(() => {
    import("@/assets/eric-student-desk.png").then(m => setEricImage(m.default));
  }, []);

  const currentStep = tourSteps[tourStep];
  const isLastStep = tourStep === tourSteps.length - 1;
  const progress = ((tourStep + 1) / tourSteps.length) * 100;

  // Navigate to the correct page for current step
  useEffect(() => {
    if (!isVisitor || !tourActive || tourCompleted || !currentStep) return;

    if (location.pathname !== currentStep.path) {
      setIsNavigating(true);
      navigate(currentStep.path);
      // Wait for navigation to complete
      setTimeout(() => setIsNavigating(false), 500);
    }
  }, [tourStep, isVisitor, tourActive, tourCompleted, currentStep, location.pathname, navigate]);

  // Highlight target element
  useEffect(() => {
    if (!isVisitor || !tourActive || tourCompleted || !currentStep?.target || isNavigating) {
      setHighlightedElement(null);
      return;
    }

    // Wait a bit for the page to render
    const timeout = setTimeout(() => {
      const element = document.querySelector(currentStep.target!) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [tourStep, currentStep, isVisitor, tourActive, tourCompleted, isNavigating, location.pathname]);

  // Track tour step changes
  useEffect(() => {
    if (tourActive && currentStep) {
      trackTourStep(tourStep, currentStep.title);
    }
  }, [tourStep, tourActive, currentStep, trackTourStep]);

  if (!isVisitor || !tourActive || tourCompleted || !currentStep) return null;

  const handleNext = () => {
    if (isLastStep) {
      trackTourComplete();
      completeTour();
    } else {
      nextTourStep();
    }
  };

  const handleSkip = () => {
    trackTourSkip(tourStep);
    skipTour();
  };

  return (
    <>
      {/* Spotlight overlay */}
      {highlightedElement && (
        <div className="fixed inset-0 z-[1003] pointer-events-none">
          <div
            className="absolute bg-black/50 transition-all duration-500"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              clipPath: `polygon(
                0% 0%, 
                0% 100%, 
                ${highlightedElement.getBoundingClientRect().left - 10}px 100%, 
                ${highlightedElement.getBoundingClientRect().left - 10}px ${highlightedElement.getBoundingClientRect().top - 10}px, 
                ${highlightedElement.getBoundingClientRect().right + 10}px ${highlightedElement.getBoundingClientRect().top - 10}px, 
                ${highlightedElement.getBoundingClientRect().right + 10}px ${highlightedElement.getBoundingClientRect().bottom + 10}px, 
                ${highlightedElement.getBoundingClientRect().left - 10}px ${highlightedElement.getBoundingClientRect().bottom + 10}px, 
                ${highlightedElement.getBoundingClientRect().left - 10}px 100%, 
                100% 100%, 
                100% 0%
              )`,
            }}
          />
          {/* Highlight border */}
          <div
            className="absolute border-2 border-primary rounded-lg shadow-lg shadow-primary/30 animate-pulse pointer-events-none"
            style={{
              top: highlightedElement.getBoundingClientRect().top - 10,
              left: highlightedElement.getBoundingClientRect().left - 10,
              width: highlightedElement.getBoundingClientRect().width + 20,
              height: highlightedElement.getBoundingClientRect().height + 20,
            }}
          />
        </div>
      )}

      {/* Tour dialog */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:w-96 z-[1004] animate-slide-up">
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="px-4 pt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Étape {tourStep + 1} sur {tourSteps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Content */}
          <div className="p-4 flex gap-4">
            {/* Jude avatar - floating style */}
            <div className="flex-shrink-0">
              {ericImage ? (
                <img
                  src={ericImage}
                  alt="Jude"
                  className="w-20 h-20 object-contain drop-shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
              )}
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground mb-1">{currentStep.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 pb-4 flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
              <X className="w-4 h-4 mr-1" />
              Passer
            </Button>

            <div className="flex items-center gap-2">
              {tourStep > 0 && (
                <Button variant="outline" size="sm" onClick={previousTourStep}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              <Button size="sm" onClick={handleNext} className="gap-1">
                {isLastStep ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Terminer
                  </>
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
