import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";
import { useFirstTimeUser } from "@/contexts/FirstTimeUserContext";
import ericStudentDesk from "@/assets/eric-student-desk.png";
import SimpleTypewriter from "@/components/visitor/SimpleTypewriter";

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
  
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [typewriterKey, setTypewriterKey] = useState(0);

  const currentStep = tourSteps[tourStep];
  const isLastStep = tourStep === tourSteps.length - 1;
  const progress = ((tourStep + 1) / tourSteps.length) * 100;

  // Navigate to the correct page for current step
  useEffect(() => {
    if (!tourActive || tourCompleted || !currentStep) return;

    if (location.pathname !== currentStep.path) {
      setIsNavigating(true);
      navigate(currentStep.path);
      setTimeout(() => setIsNavigating(false), 500);
    }
  }, [tourStep, tourActive, tourCompleted, currentStep, location.pathname, navigate]);

  // Reset typewriter when step changes
  useEffect(() => {
    setTypewriterKey(prev => prev + 1);
  }, [tourStep]);

  // Highlight target element
  useEffect(() => {
    if (!tourActive || tourCompleted || !currentStep?.target || isNavigating) {
      setHighlightedElement(null);
      return;
    }

    // Wait for the page to render
    const timeout = setTimeout(() => {
      const element = document.querySelector(currentStep.target!) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [tourStep, currentStep, tourActive, tourCompleted, isNavigating, location.pathname]);

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

      {/* Tour dialog - bottom right card */}
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
            {/* Jude avatar */}
            <div className="flex-shrink-0">
              <img
                src={ericStudentDesk}
                alt="Jude"
                className="w-20 h-20 object-contain drop-shadow-lg"
              />
            </div>

            {/* Text content with typewriter */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground mb-1">{currentStep.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed min-h-[3rem]">
                <SimpleTypewriter
                  key={typewriterKey}
                  text={getDescription()}
                  speed={30}
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
