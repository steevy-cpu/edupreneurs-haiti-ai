import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";
import { useFirstTimeUser } from "@/contexts/FirstTimeUserContext";
import ericStudentDesk from "@/assets/eric-student-desk.png";
import SimpleTypewriter from "@/components/visitor/SimpleTypewriter";
import { useNetworkAwareAnimations } from "@/hooks/useNetworkAwareAnimations";
import { preloadImage } from "@/utils/performanceOptimization";

interface TourStep {
  path: string;
  title: string;
  description: string;
  target?: string;
}

const tourSteps: TourStep[] = [
  {
    path: "/dashboard",
    title: "Votre tableau de bord 📊",
    description: "Suivez votre progression, vos pièces d'or gagnées et vos statistiques d'apprentissage. Tout est centralisé ici!",
    target: "[data-tour='kpi-cards']",
  },
  {
    path: "/matieres",
    title: "Vos matières 📚",
    description: "Accédez aux cours de votre niveau. Chaque leçon a des résumés clairs, des exercices et des quiz interactifs!",
    target: "[data-tour='subject-grid']",
  },
  {
    path: "/feed",
    title: "Fil d'actualité 📱",
    description: "Partagez vos succès, posez des questions et connectez-vous avec d'autres étudiants de la communauté!",
    target: "[data-tour='feed-content']",
  },
  {
    path: "/leaderboard",
    title: "Classement 🏆",
    description: "Voyez les meilleurs apprenants et leur progression. Gagnez des pièces d'or en étudiant et montez dans le classement!",
    target: "[data-tour='leaderboard-list']",
  },
  {
    path: "/passion-discovery",
    title: "Découverte des passions 🎨",
    description: "Explorez la musique, les arts, les échecs et le développement personnel avec des modules interactifs!",
    target: "[data-tour='passion-categories']",
  },
  {
    path: "/community",
    title: "Messages 💬",
    description: "Discutez en privé avec d'autres étudiants et formez des groupes d'étude pour réviser ensemble!",
    target: "[data-tour='community-list']",
  },
  {
    path: "/settings",
    title: "Votre profil ⚙️",
    description: "Personnalisez votre compte, changez votre avatar et gérez vos préférences. C'est votre espace!",
    target: "[data-tour='settings-content']",
  },
];

const FirstTimeUserTour = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    tourActive, 
    tourStep, 
    tourCompleted, 
    nextTourStep, 
    previousTourStep, 
    skipTour, 
    completeTour,
    userGrade 
  } = useFirstTimeUser();
  const { shouldShowGlow } = useNetworkAwareAnimations();
  
  const [isNavigating, setIsNavigating] = useState(false);
  const [typewriterKey, setTypewriterKey] = useState(0);

  // Preload Eric image on mount
  useEffect(() => {
    preloadImage(ericStudentDesk).catch(() => {});
  }, []);

  const currentStep = tourSteps[tourStep];
  const isLastStep = tourStep === tourSteps.length - 1;
  const progress = ((tourStep + 1) / tourSteps.length) * 100;

  // Navigate to the correct page for current step
  useEffect(() => {
    if (!tourActive || tourCompleted || !currentStep) return;

    // Safety check: ensure we're in a stable state before navigating
    if (!isNavigating && location.pathname !== currentStep.path) {
      setIsNavigating(true);
      
      // Use double RAF to ensure we're in a completely stable frame
      // This allows React to complete current render cycle and prevents error #310
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          navigate(currentStep.path);
          // Increase delay to 800ms to allow pages with async loading to stabilize
          setTimeout(() => setIsNavigating(false), 800);
        });
      });
    }
  }, [tourStep, tourActive, tourCompleted, currentStep, location.pathname, navigate, isNavigating]);

  // Reset typewriter when step changes
  useEffect(() => {
    setTypewriterKey(prev => prev + 1);
  }, [tourStep]);

  if (!tourActive || tourCompleted || !currentStep) return null;

  const handleNext = () => {
    if (isLastStep) {
      completeTour();
    } else {
      nextTourStep();
    }
  };

  const handleSkip = () => {
    skipTour();
  };

  // Custom description for matieres page
  const getDescription = () => {
    if (currentStep.path === '/matieres' && userGrade) {
      return `Voici les cours disponibles pour ton niveau (${userGrade}). Chaque leçon a des résumés clairs, des exercices et des quiz interactifs!`;
    }
    return currentStep.description;
  };

  return (
    <>
      {/* Mobile overlay - dims content area while keeping bottom nav visible */}
      <div 
        className="fixed inset-0 bg-black/30 z-[1003] pointer-events-none lg:hidden"
        style={{ bottom: '72px' }}
      />
      
      {/* Tour dialog - positioned above bottom nav on mobile */}
      <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:w-96 z-[1004] animate-slide-up">
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
            {/* Jude avatar */}
            <div className="flex-shrink-0">
              <img
                src={ericStudentDesk}
                alt="Jude"
                className={`w-20 h-20 object-contain ${shouldShowGlow ? 'drop-shadow-lg' : 'drop-shadow'}`}
              />
            </div>

            {/* Text content with typewriter */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground mb-1">{currentStep.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed min-h-[3rem]">
                <SimpleTypewriter
                  key={typewriterKey}
                  text={getDescription()}
                  speed={50}
                  enableSound
                  soundVolume={0.04}
                />
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

export default FirstTimeUserTour;
