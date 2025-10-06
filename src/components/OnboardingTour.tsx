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
  targetSelector?: string; // Element to highlight
  action?: "click" | "wait"; // What user needs to do
  position: "left" | "right" | "top" | "bottom" | "center";
}

const steps: OnboardingStep[] = [
  {
    title: "Bienvenue sur Edupreneurs!",
    description: "Salut! Je suis Eric, ton guide personnel. Je vais te montrer comment naviguer sur la plateforme. Clique sur 'Suivant' pour commencer!",
    image: ericWaving,
    position: "center",
    action: "wait",
  },
  {
    title: "Ouvre le menu",
    description: "Clique sur ce bouton pour ouvrir la barre de navigation latérale!",
    image: ericPointingLeft,
    targetSelector: "button[data-tour='menu-button']",
    position: "right",
    action: "click",
  },
  {
    title: "Tes statistiques",
    description: "Voici tes statistiques! Tu peux voir tes golds gagnés, tes affiliations, ta progression et ton abonnement. Super non?",
    image: ericPointingUp,
    targetSelector: "[data-tour='stats-section']",
    position: "bottom",
    action: "wait",
  },
  {
    title: "Navigation principale",
    description: "Ici tu trouveras toutes les sections: Matières, Ressources, Fil d'actualité, et plus encore!",
    image: ericThinking,
    targetSelector: "[data-tour='nav-section']",
    position: "right",
    action: "wait",
  },
  {
    title: "Prêt à apprendre!",
    description: "Tu sais maintenant comment naviguer. Explore les leçons, fais des quiz et gagne des golds. Bonne chance!",
    image: ericThumbUp,
    position: "center",
    action: "wait",
  },
];

export default function OnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

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
    
    // Find and highlight the target element
    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: "smooth", block: "center" });

        // If action is click, wait for user to click the element
        if (step.action === "click") {
          const handleClick = () => {
            setTimeout(() => {
              handleNext();
            }, 300);
          };

          element.addEventListener("click", handleClick, { once: true });
          return () => element.removeEventListener("click", handleClick);
        }
      }
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, isActive]);

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
    setHighlightedElement(null);
  };

  if (!isActive) return null;

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  // Get position for Eric and the card
  const getCardPosition = () => {
    if (!highlightedElement) {
      return "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }

    const rect = highlightedElement.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;

    switch (step.position) {
      case "right":
        if (isMobile) {
          return "fixed bottom-4 left-1/2 -translate-x-1/2";
        }
        return `fixed left-4 top-1/2 -translate-y-1/2`;
      case "left":
        if (isMobile) {
          return "fixed bottom-4 left-1/2 -translate-x-1/2";
        }
        return `fixed right-4 top-1/2 -translate-y-1/2`;
      case "bottom":
        return "fixed bottom-4 left-1/2 -translate-x-1/2";
      case "top":
        return "fixed top-20 left-1/2 -translate-x-1/2";
      default:
        return "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
  };

  const getHighlightStyle = () => {
    if (!highlightedElement) return {};
    
    const rect = highlightedElement.getBoundingClientRect();
    return {
      top: `${rect.top - 8}px`,
      left: `${rect.left - 8}px`,
      width: `${rect.width + 16}px`,
      height: `${rect.height + 16}px`,
    };
  };

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <div 
        className="fixed inset-0 z-[9998] pointer-events-none"
        style={{
          background: highlightedElement 
            ? "rgba(0, 0, 0, 0.75)"
            : "rgba(0, 0, 0, 0.7)",
        }}
      />

      {/* Spotlight highlight on target element */}
      {highlightedElement && (
        <>
          <div
            className="fixed z-[9999] rounded-lg border-4 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.75)] animate-pulse"
            style={getHighlightStyle()}
          />
          <div
            className="fixed z-[9999] rounded-lg bg-primary/10 animate-pulse"
            style={getHighlightStyle()}
          />
        </>
      )}

      {/* Eric's Tour Card */}
      <div 
        className={`${getCardPosition()} z-[10000] max-w-[90vw] sm:max-w-md w-full animate-scale-in`}
      >
        <div className="bg-card border-2 border-primary rounded-2xl shadow-2xl overflow-hidden">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 rounded-full hover:bg-primary/10 h-8 w-8"
            onClick={completeOnboarding}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Eric Image */}
          <div className="bg-gradient-to-br from-primary/10 to-success/10 p-4 sm:p-6 flex items-center justify-center border-b border-border">
            <img
              src={step.image}
              alt={step.title}
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain animate-fade-in"
              key={currentStep}
            />
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            <div className="mb-4">
              <span className="text-xs text-muted-foreground">
                Étape {currentStep + 1} sur {steps.length}
              </span>
              <Progress value={progress} className="mt-2 h-1.5" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {step.description}
            </p>

            {step.action === "click" && (
              <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-xs font-semibold text-primary flex items-center gap-2">
                  <span className="animate-pulse">👆</span> Clique sur l'élément surligné pour continuer
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                size="sm"
                className="text-xs sm:text-sm"
              >
                Précédent
              </Button>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={completeOnboarding}
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  Passer
                </Button>
                {step.action === "wait" && (
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-br from-primary to-success text-xs sm:text-sm"
                    size="sm"
                  >
                    {currentStep === steps.length - 1 ? "Terminer" : "Suivant"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Arrow pointer for desktop */}
        {highlightedElement && !window.matchMedia("(max-width: 768px)").matches && (
          <>
            {step.position === "right" && (
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[12px] border-l-primary" />
            )}
            {step.position === "left" && (
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[12px] border-r-primary" />
            )}
            {step.position === "bottom" && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-primary" />
            )}
            {step.position === "top" && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-primary" />
            )}
          </>
        )}
      </div>
    </>
  );
}
