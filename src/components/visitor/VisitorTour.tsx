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
}

const tourSteps: TourStep[] = [
  {
    path: "/dashboard",
    title: "Votre tableau de bord 📊",
    description: "Suivez votre progression, vos séries de jours d'étude et vos objectifs hebdomadaires. Tout est centralisé ici !",
  },
  {
    path: "/matieres",
    title: "Toutes les matières 📚",
    description: "Accédez aux cours de maths, français, sciences et plus. Chaque leçon a des résumés clairs et des quiz interactifs !",
  },
  {
    path: "/feed",
    title: "Fil d'actualité 📱",
    description: "Connectez-vous avec d'autres étudiants, partagez vos succès et posez des questions à la communauté.",
  },
  {
    path: "/leaderboard",
    title: "Classement en temps réel 🏆",
    description: "Voyez les meilleurs apprenants et leur progression. Gagnez des pièces d'or en étudiant !",
  },
  {
    path: "/passion-discovery",
    title: "Découverte des passions 🎨",
    description: "Explorez la musique, les arts, les échecs et la littérature avec des modules interactifs !",
  },
  {
    path: "/chess-game",
    title: "Jeux éducatifs ♟️",
    description: "Jouez aux échecs contre Jude, notre coach IA ! Améliorez votre logique et stratégie.",
  },
  {
    path: "/community",
    title: "Messages et communauté 💬",
    description: "Discutez en privé avec d'autres étudiants et formez des groupes d'étude pour réviser ensemble.",
  },
];

export const VisitorTour = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // STABILITY GUARD: Prevent null dispatcher errors during lazy load transitions
  const [isStable, setIsStable] = useState(false);
  
  const { isVisitor, tourStep, tourActive, tourCompleted, nextTourStep, previousTourStep, skipTour, completeTour } = useVisitor();
  const { trackTourStep, trackTourSkip, trackTourComplete } = useVisitorAnalytics();
  const [isNavigating, setIsNavigating] = useState(false);
  const [ericImage, setEricImage] = useState<string | null>(null);
  
  // Wait for React dispatcher to stabilize after lazy load
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsStable(true);
      });
    });
    return () => cancelAnimationFrame(timer);
  }, []);
  
  // Lazy load the Eric image for 3G optimization
  useEffect(() => {
    import("@/assets/eric-student-desk.png").then(m => setEricImage(m.default));
  }, []);

  const currentStep = tourSteps[tourStep];
  const isLastStep = tourStep === tourSteps.length - 1;
  const progress = ((tourStep + 1) / tourSteps.length) * 100;

  // Navigate to the correct page for current step
  useEffect(() => {
    if (!isStable || !isVisitor || !tourActive || tourCompleted || !currentStep) return;

    if (location.pathname !== currentStep.path) {
      setIsNavigating(true);
      navigate(currentStep.path);
      // Wait for navigation to complete
      setTimeout(() => setIsNavigating(false), 500);
    }
  }, [tourStep, isVisitor, tourActive, tourCompleted, currentStep, location.pathname, navigate, isStable]);

  // Track tour step changes
  useEffect(() => {
    if (isStable && tourActive && currentStep) {
      trackTourStep(tourStep, currentStep.title);
    }
  }, [tourStep, tourActive, currentStep, trackTourStep, isStable]);

  // Early return AFTER all hooks (prevents hook count mismatch)
  if (!isStable) return null;
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
  );
};
