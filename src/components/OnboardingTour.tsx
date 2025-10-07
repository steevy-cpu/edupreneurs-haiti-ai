import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
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
        // Better scroll behavior for mobile
        element.scrollIntoView({ 
          behavior: "smooth", 
          block: window.innerWidth < 768 ? "start" : "center",
          inline: "center"
        });

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

  // Get position for Eric - he should be visible and prominent
  const getEricPosition = () => {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    if (!highlightedElement) {
      // Center Eric above the speech bubble when no element is highlighted
      return { 
        top: "35%", 
        left: "50%", 
        transform: "translate(-50%, -50%)" 
      };
    }

    const rect = highlightedElement.getBoundingClientRect();
    const ericSize = isMobile ? 80 : isTablet ? 100 : 130;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Calculate safe positions that keep Eric visible
    switch (step.position) {
      case "right":
        if (isMobile || isTablet) {
          // On mobile, put Eric above the highlighted element
          return { 
            top: `${Math.max(rect.top - ericSize - 20, 80)}px`, 
            left: "50%",
            transform: "translateX(-50%)"
          };
        }
        // Desktop: Eric on the right side
        return { 
          top: `${Math.max(Math.min(rect.top + rect.height / 2, viewportHeight - ericSize - 20), 80)}px`, 
          left: `${Math.min(rect.right + 40, viewportWidth - ericSize - 20)}px`,
          transform: "translateY(-50%)"
        };
      case "left":
        if (isMobile || isTablet) {
          return { 
            top: `${Math.max(rect.top - ericSize - 20, 80)}px`, 
            left: "50%",
            transform: "translateX(-50%)"
          };
        }
        return { 
          top: `${Math.max(Math.min(rect.top + rect.height / 2, viewportHeight - ericSize - 20), 80)}px`, 
          left: `${Math.max(rect.left - ericSize - 40, 20)}px`,
          transform: "translateY(-50%)"
        };
      case "bottom":
        return { 
          top: `${Math.max(rect.top - ericSize - 20, 80)}px`, 
          left: "50%",
          transform: "translateX(-50%)"
        };
      case "top":
        return { 
          top: `${Math.max(rect.top - ericSize - 20, 80)}px`, 
          left: "50%",
          transform: "translateX(-50%)"
        };
      default:
        return { top: "35%", left: "50%", transform: "translate(-50%, -50%)" };
    }
  };

  const getSpeechBubblePosition = () => {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    if (!highlightedElement) {
      // Center below Eric when no element is highlighted
      return "fixed top-[50%] left-1/2 -translate-x-1/2 w-[85vw] sm:max-w-md";
    }

    // Speech bubble should be at the bottom on mobile/tablet for better visibility
    if (isMobile || isTablet) {
      return "fixed bottom-4 left-1/2 -translate-x-1/2 w-[85vw] sm:max-w-md";
    }

    // On desktop, position speech bubble away from Eric
    switch (step.position) {
      case "right":
        return "fixed left-6 top-1/2 -translate-y-1/2 w-full max-w-md";
      case "left":
        return "fixed right-6 top-1/2 -translate-y-1/2 w-full max-w-md";
      case "bottom":
      case "top":
        return "fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md";
      default:
        return "fixed top-[50%] left-1/2 -translate-x-1/2 w-full max-w-md";
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

  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const ericSize = isMobile ? 80 : isTablet ? 100 : 130;

  return (
    <>
      {/* Semi-transparent overlay */}
      <div 
        className="fixed inset-0 z-[9998] pointer-events-none bg-black/60"
      />

      {/* Spotlight highlight on target element */}
      {highlightedElement && (
        <>
          <div
            className="fixed z-[9999] rounded-lg border-4 border-primary shadow-[0_0_40px_rgba(var(--primary),0.6)] animate-pulse pointer-events-none"
            style={getHighlightStyle()}
          />
          <div
            className="fixed z-[9999] rounded-lg bg-primary/5 pointer-events-none"
            style={getHighlightStyle()}
          />
        </>
      )}

      {/* Floating Eric Character - Always visible and prominent */}
      <div 
        className="fixed z-[10001] pointer-events-none animate-[float_3s_ease-in-out_infinite]"
        style={getEricPosition()}
      >
        <div className="relative">
          <img
            src={step.image}
            alt="Eric le guide"
            className="drop-shadow-2xl transition-all duration-300"
            style={{ width: `${ericSize}px`, height: `${ericSize}px` }}
            key={currentStep}
          />
          {/* Glow effect around Eric */}
          <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-2xl animate-pulse" />
        </div>
      </div>

      {/* Floating Speech Bubble */}
      <div 
        className={`${getSpeechBubblePosition()} z-[10000] animate-[float_3s_ease-in-out_infinite] animate-fade-in`}
        style={{ animationDelay: "0.5s" }}
      >
        <div className="relative">
          {/* Speech bubble tail pointing toward Eric */}
          <div className="absolute -top-2 left-8 w-5 h-5 bg-card rotate-45 border-l border-t border-primary/30" />
          
          {/* Speech bubble content */}
          <div className="relative bg-card/95 border-2 border-primary/40 rounded-2xl shadow-2xl backdrop-blur-md p-4 sm:p-5">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground h-8 w-8 shadow-lg pointer-events-auto touch-manipulation"
              onClick={completeOnboarding}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Progress indicator */}
            <div className="mb-3 flex items-center gap-1.5 sm:gap-2 pr-6">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    idx === currentStep
                      ? "bg-primary scale-110"
                      : idx < currentStep
                      ? "bg-primary/60"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <h3 className="text-sm sm:text-lg font-bold text-foreground mb-2 pr-8 break-words">
              {step.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3 sm:mb-4 break-words">
              {step.description}
            </p>

            {step.action === "click" && (
              <div className="mb-3 p-2 sm:p-2.5 bg-primary/10 rounded-xl border border-primary/30 animate-pulse">
                <p className="text-xs font-semibold text-primary flex items-center gap-2">
                  <span className="text-base">👆</span> 
                  <span>Clique sur l'élément surligné!</span>
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-2 pointer-events-auto flex-wrap">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                size="sm"
                className="text-xs h-9 px-3 touch-manipulation whitespace-nowrap"
              >
                Précédent
              </Button>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={completeOnboarding}
                  size="sm"
                  className="text-xs h-9 px-3 touch-manipulation whitespace-nowrap"
                >
                  Passer
                </Button>
                {step.action === "wait" && (
                  <Button 
                    onClick={handleNext}
                    className="bg-gradient-to-r from-primary to-success text-xs h-9 gap-1 px-3 touch-manipulation whitespace-nowrap"
                    size="sm"
                  >
                    {currentStep === steps.length - 1 ? "Terminer" : "Suivant"}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
}
