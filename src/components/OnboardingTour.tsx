import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import ericWaving from "@/assets/eric-waving.png";
import ericPointingLeft from "@/assets/eric-pointing-left.png";
import ericPointingUp from "@/assets/eric-pointing-up.png";
import ericThumbUp from "@/assets/eric-thumb-up.png";
import { useSoundEffects } from "@/hooks/useSoundEffects";

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
    description: "Voici ton tableau de bord! Tu peux voir tes golds gagnés, tes affiliations, ta progression et ton abonnement. Super non?",
    image: ericPointingUp,
    position: "center",
    action: "wait",
  },
  {
    title: "Navigation principale",
    description: "Ici tu trouveras toutes les sections: Matières, Ressources, Fil d'actualité, et plus encore!",
    image: ericPointingLeft,
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
  const { playSound } = useSoundEffects();

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
    
    // Play sound when step changes
    playSound("next");
    
    // Find and highlight the target element
    if (step.targetSelector) {
      const element = document.querySelector(step.targetSelector) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        
        // Special handling for navigation section - scroll sidebar down
        if (step.targetSelector === "[data-tour='nav-section']") {
          const sidebar = document.querySelector("[data-tour='sidebar-content']") as HTMLElement;
          if (sidebar) {
            sidebar.scrollTo({ top: 200, behavior: "smooth" });
          }
        }
        
        // Better scroll behavior for mobile
        element.scrollIntoView({ 
          behavior: "smooth", 
          block: window.innerWidth < 768 ? "start" : "center",
          inline: "center"
        });

        // If action is click, wait for user to click the element
        if (step.action === "click") {
          const handleClick = () => {
            playSound("correct");
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
    playSound("correct");
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
    // Always center Eric in the middle of the screen
    return { 
      top: "50%",
      left: "50%", 
      transform: "translate(-50%, -50%)" 
    };
  };

  const getSpeechBubblePosition = () => {
    // Always at the bottom on mobile for reliability
    return "fixed bottom-0 left-0 right-0 w-full";
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
  const ericSize = isMobile ? 140 : isTablet ? 180 : 200;

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
        className="fixed z-[10001] pointer-events-none transition-all duration-500 ease-out"
        style={getEricPosition()}
      >
        <div className="relative">
          <img
            src={step.image}
            alt="Eric le guide"
            className="drop-shadow-2xl transition-transform duration-500"
            style={{ width: `${ericSize}px`, height: `${ericSize}px` }}
            key={currentStep}
          />
          {/* Glow effect around Eric */}
          <div className="absolute inset-0 -z-10 rounded-full bg-primary/30 blur-xl animate-pulse" />
        </div>
      </div>

      {/* Bottom Sheet Speech Bubble */}
      <div 
        className={`${getSpeechBubblePosition()} z-[10000]`}
      >
        <div className="bg-card/98 backdrop-blur-lg border-t-2 border-primary/40 shadow-2xl rounded-t-3xl max-h-[35vh] overflow-y-auto">
          {/* Handle bar */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 bg-muted rounded-full" />
          </div>
          
          <div className="p-3 pb-safe">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive h-8 w-8 pointer-events-auto z-10"
              onClick={completeOnboarding}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Progress indicator */}
            <div className="mb-4 flex items-center gap-2 pr-10">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? "bg-primary scale-110"
                      : idx < currentStep
                      ? "bg-primary/60"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
              {step.title}
            </h3>
            <p className="text-sm sm:text-base text-foreground leading-snug mb-3">
              {step.description}
            </p>

            {step.action === "click" && (
              <div className="mb-3 p-2 bg-primary/10 rounded-xl border border-primary/30 animate-pulse">
                <p className="text-xs sm:text-sm font-semibold text-primary flex items-center gap-2">
                  <span className="text-lg">👆</span> 
                  <span>Clique sur l'élément surligné!</span>
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-2 pointer-events-auto pt-1">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                size="sm"
                className="flex-1 h-9"
              >
                Précédent
              </Button>

              <div className="flex gap-2 flex-1">
                <Button 
                  variant="outline" 
                  onClick={completeOnboarding}
                  size="sm"
                  className="flex-1 h-9"
                >
                  Passer
                </Button>
                {step.action === "wait" && (
                  <Button 
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-primary to-success h-9 gap-2"
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
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 16px);
        }
      `}</style>
    </>
  );
}
