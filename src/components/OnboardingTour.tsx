import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";
import ericWaving from "@/assets/eric-waving.png";
import ericPointingLeft from "@/assets/eric-pointing-left.png";
import ericPointingUp from "@/assets/eric-pointing-up.png";
import ericThinking from "@/assets/eric-thinking-pose.png";
import ericThumbUp from "@/assets/eric-thumb-up.png";

interface OnboardingStep {
  title: string;
  description: string;
  image: string;
  action?: string;
  highlightSelector?: string;
  position: "left" | "right" | "bottom" | "center";
}

const steps: OnboardingStep[] = [
  {
    title: "Bienvenue sur Edupreneurs!",
    description: "Salut! Je suis Eric, ton guide personnel. Je vais te montrer comment naviguer sur la plateforme. Clique sur 'Suivant' pour commencer!",
    image: ericWaving,
    position: "center",
  },
  {
    title: "Découvre la navigation",
    description: "Clique sur le bouton menu en haut à gauche pour ouvrir la barre de navigation. C'est là que tu trouveras toutes les sections de la plateforme!",
    image: ericPointingLeft,
    position: "left",
    action: "open-sidebar",
  },
  {
    title: "Tes statistiques",
    description: "Voici tes statistiques! Tu peux voir tes golds gagnés, tes affiliations, ta progression et ton abonnement. Plus tu apprends, plus tu gagnes!",
    image: ericPointingUp,
    position: "right",
  },
  {
    title: "Explore les matières",
    description: "Maintenant, clique sur 'Matières' dans le menu pour découvrir tous les cours disponibles. C'est parti!",
    image: ericThinking,
    position: "left",
    action: "click-matieres",
  },
  {
    title: "Prêt à apprendre!",
    description: "Super! Tu sais maintenant comment naviguer. Explore les leçons, fais des quiz et gagne des golds. Bonne chance!",
    image: ericThumbUp,
    position: "center",
  },
];

export default function OnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [sidebarOpened, setSidebarOpened] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed");
    if (!hasCompletedOnboarding) {
      setTimeout(() => {
        setIsActive(true);
      }, 1500);
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const step = steps[currentStep];
    
    // Handle automatic sidebar opening for certain steps
    if (step.action === "open-sidebar" && !sidebarOpened) {
      const menuButton = document.querySelector('button') as HTMLButtonElement;
      if (menuButton) {
        const handleSidebarOpen = () => {
          setSidebarOpened(true);
          setTimeout(() => {
            if (currentStep === 1) {
              handleNext();
            }
          }, 800);
        };

        menuButton.addEventListener("click", handleSidebarOpen);
        return () => menuButton.removeEventListener("click", handleSidebarOpen);
      }
    }

    // Handle clicking on Matières
    if (step.action === "click-matieres") {
      const matieresLink = document.querySelector('a[href="/matieres"]') as HTMLAnchorElement;
      if (matieresLink) {
        const handleMatieresClick = (e: Event) => {
          e.preventDefault();
          completeOnboarding();
          window.location.href = "/matieres";
        };

        matieresLink.addEventListener("click", handleMatieresClick);
        return () => matieresLink.removeEventListener("click", handleMatieresClick);
      }
    }
  }, [currentStep, isActive, sidebarOpened]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem("onboarding_completed", "true");
    setIsActive(false);
  };

  if (!isActive) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  // Position classes based on step position
  const getPositionClasses = () => {
    switch (step.position) {
      case "left":
        return "left-4 top-1/2 -translate-y-1/2";
      case "right":
        return "right-4 top-1/2 -translate-y-1/2";
      case "bottom":
        return "bottom-8 left-1/2 -translate-x-1/2";
      case "center":
      default:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 z-[9998] animate-fade-in" />

      {/* Tour Card */}
      <div 
        className={`fixed ${getPositionClasses()} z-[9999] max-w-md w-[90%] sm:w-full animate-scale-in`}
      >
        <div className="bg-card border-2 border-primary rounded-2xl shadow-2xl overflow-hidden">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 z-10 rounded-full hover:bg-primary/10"
            onClick={completeOnboarding}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Eric Image */}
          <div className="bg-gradient-to-br from-primary/10 to-success/10 p-6 flex items-center justify-center border-b border-border">
            <img
              src={step.image}
              alt={step.title}
              className="w-48 h-48 object-contain animate-fade-in"
              key={currentStep}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <span className="text-xs text-muted-foreground">
                Étape {currentStep + 1} sur {steps.length}
              </span>
              <Progress value={progress} className="mt-2 h-1.5" />
            </div>

            <h3 className="text-xl font-bold text-foreground mb-3">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                size="sm"
              >
                Précédent
              </Button>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={completeOnboarding}
                  size="sm"
                >
                  Passer
                </Button>
                {(!step.action || step.action === "open-sidebar" && sidebarOpened) && (
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-br from-primary to-success"
                    size="sm"
                  >
                    {currentStep === steps.length - 1 ? "Terminer" : "Suivant"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Arrow pointer for specific positions */}
        {step.position === "left" && (
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[12px] border-l-primary" />
        )}
        {step.position === "right" && (
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[12px] border-r-primary" />
        )}
      </div>
    </>
  );
}
