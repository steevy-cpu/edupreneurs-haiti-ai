import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AvatarSelector } from "@/components/AvatarSelector";
import ericWelcome from "@/assets/eric-welcome.png";
import ericThumbUp from "@/assets/eric-thumb-up.png";
import ericPointingUp from "@/assets/eric-pointing-up.png";
import ericTeaching from "@/assets/eric-teaching.png";
import ericPointingLeft from "@/assets/eric-pointing-left.png";
import ericThinkingPose from "@/assets/eric-thinking-pose.png";
import ericCelebrating from "@/assets/eric-celebrating.png";
import ericRightPointing from "@/assets/eric-right-pointing.png";

interface OnboardingStep {
  title: string;
  description: string;
  image: string;
  target: string;
  action?: "click" | "none";
  ericPosition?: "left" | "right" | "above" | "below";
}

const steps: OnboardingStep[] = [
  {
    title: "Bienvenue sur Edupreneurs! 👋",
    description: "Salut! Moi c'est Eric, ton assistant d'apprentissage. Je vais te guider à travers cette plateforme pour que tu puisses tirer le meilleur parti de ton expérience.",
    image: ericWelcome,
    target: "",
    action: "none",
    ericPosition: "right",
  },
  {
    title: "Choisis ton avatar! 🎭",
    description: "Commence par choisir un avatar qui te représente. Tu pourras le changer plus tard dans les paramètres.",
    image: ericThumbUp,
    target: "",
    action: "none",
    ericPosition: "right",
  },
  {
    title: "Ta zone de bienvenue 🌟",
    description: "Ici tu vois ton nom et un message personnalisé. C'est ton espace!",
    image: ericPointingUp,
    target: '[data-tour="welcome-header"]',
    action: "none",
    ericPosition: "below",
  },
  {
    title: "Tes statistiques d'apprentissage 📈",
    description: "Ces widgets te montrent ta série d'apprentissage, tes objectifs hebdomadaires et ton temps d'étude.",
    image: ericTeaching,
    target: '[data-tour="analytics-widgets"]',
    action: "none",
    ericPosition: "below",
  },
  {
    title: "Ton tableau de bord 💰",
    description: "Ici, tu peux voir ton or gagné, tes leçons complétées, ton score moyen et ton temps d'étude total.",
    image: ericPointingLeft,
    target: '[data-tour="kpi-cards"]',
    action: "none",
    ericPosition: "below",
  },
  {
    title: "Tes graphiques de progrès 📊",
    description: "Visualise ton activité hebdomadaire et tes progrès par matière avec ces graphiques interactifs.",
    image: ericThinkingPose,
    target: '[data-tour="charts-section"]',
    action: "none",
    ericPosition: "above",
  },
  {
    title: "Le classement 🏆",
    description: "Compare tes performances avec les autres étudiants et vise le sommet!",
    image: ericCelebrating,
    target: '[data-tour="leaderboard-section"]',
    action: "none",
    ericPosition: "left",
  },
  {
    title: "Ouvre le menu 📱",
    description: "Clique sur ce bouton pour voir toutes les options de navigation.",
    image: ericPointingLeft,
    target: '[data-tour="menu-button"]',
    action: "click",
    ericPosition: "right",
  },
  {
    title: "Navigation complète 🧭",
    description: "Tu trouveras ici toutes les sections : Matières, Ressources, Communauté, Profil et plus encore!",
    image: ericPointingUp,
    target: '[data-tour="nav-section"]',
    action: "none",
    ericPosition: "right",
  },
  {
    title: "Choisis ton parcours 🎯",
    description: "Tu peux choisir entre le programme complet ou les révisions selon tes besoins.",
    image: ericTeaching,
    target: '[data-tour="parcours-section"]',
    action: "none",
    ericPosition: "above",
  },
  {
    title: "Eric t'accompagne toujours! 💬",
    description: "N'oublie pas, je suis toujours là en bas à droite pour répondre à toutes tes questions!",
    image: ericRightPointing,
    target: '[data-tour="eric-chatbot"]',
    action: "none",
    ericPosition: "left",
  },
  {
    title: "Prêt à apprendre! 🚀",
    description: "C'est tout! Tu es maintenant prêt à explorer. Si tu as besoin d'aide, n'hésite pas à me contacter. Bonne chance!",
    image: ericThumbUp,
    target: "",
    action: "none",
    ericPosition: "right",
  },
];

export const OnboardingTour = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [elementPosition, setElementPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed");
    const forceRestart = sessionStorage.getItem("restart_onboarding");
    
    if (!hasCompletedOnboarding || forceRestart) {
      setIsActive(true);
      sessionStorage.removeItem("restart_onboarding");
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const step = steps[currentStep];
    if (!step.target) {
      setHighlightedElement(null);
      return;
    }

    const findAndHighlightElement = () => {
      try {
        const element = document.querySelector(step.target) as HTMLElement;
        if (element) {
          setHighlightedElement(element);
          const rect = element.getBoundingClientRect();
          setElementPosition({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height,
          });
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
      } catch (error) {
        console.error("Error finding element:", error);
      }
    };

    findAndHighlightElement();
    const timeoutId = setTimeout(findAndHighlightElement, 500);

    return () => clearTimeout(timeoutId);
  }, [currentStep, isActive]);

  const handleNext = async () => {
    if (currentStep === 1 && selectedAvatar) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ avatar_url: selectedAvatar })
          .eq("user_id", user.id);
      }
    }

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

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };

  const completeOnboarding = async () => {
    if (selectedAvatar) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({ avatar_url: selectedAvatar })
            .eq("user_id", user.id);
        }
      } catch (error) {
        console.error("Error updating avatar:", error);
      }
    }

    localStorage.setItem("onboarding_completed", "true");
    sessionStorage.removeItem("restart_onboarding");
    setIsActive(false);
  };

  const getEricPositionStyle = () => {
    const step = steps[currentStep];
    if (!step.target || !highlightedElement) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }

    const ericSize = isMobile ? 120 : 180;
    const spacing = 20;

    switch (step.ericPosition) {
      case "left":
        return {
          top: `${elementPosition.top + elementPosition.height / 2}px`,
          left: `${Math.max(spacing, elementPosition.left - ericSize - spacing)}px`,
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          top: `${elementPosition.top + elementPosition.height / 2}px`,
          left: `${elementPosition.left + elementPosition.width + spacing}px`,
          transform: "translateY(-50%)",
        };
      case "above":
        return {
          top: `${Math.max(spacing, elementPosition.top - ericSize - spacing)}px`,
          left: `${elementPosition.left + elementPosition.width / 2}px`,
          transform: "translateX(-50%)",
        };
      case "below":
        return {
          top: `${elementPosition.top + elementPosition.height + spacing}px`,
          left: `${elementPosition.left + elementPosition.width / 2}px`,
          transform: "translateX(-50%)",
        };
      default:
        return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
  };

  if (!isActive) return null;

  return (
    <div>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 z-[9998]" onClick={(e) => e.stopPropagation()} />

      {/* Spotlight on highlighted element */}
      {highlightedElement && (
        <div
          className="fixed z-[9999] pointer-events-none animate-pulse"
          style={{
            top: `${elementPosition.top}px`,
            left: `${elementPosition.left}px`,
            width: `${elementPosition.width}px`,
            height: `${elementPosition.height}px`,
            boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.6), 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 40px 10px rgba(59, 130, 246, 0.4)",
            borderRadius: "12px",
          }}
        />
      )}

      {/* Progress bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10001] bg-background/90 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg border border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {currentStep + 1} / {steps.length}
          </span>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Floating Eric character */}
      <div
        className="fixed z-[10000] pointer-events-none transition-all duration-700 ease-out"
        style={getEricPositionStyle()}
      >
        <div className="animate-float">
          <img
            src={steps[currentStep].image}
            alt="Eric"
            className={`${
              isMobile ? "w-28 h-28 sm:w-32 sm:h-32" : "w-44 h-44 lg:w-52 lg:h-52"
            } object-contain drop-shadow-2xl`}
          />
        </div>
      </div>

      {/* Speech bubble - Bottom sheet style */}
      <div
        className={`fixed z-[10000] transition-all duration-500 ${
          isMobile
            ? "bottom-0 left-0 right-0 rounded-t-3xl max-h-[60vh] overflow-y-auto"
            : "bottom-8 left-1/2 -translate-x-1/2 rounded-2xl max-w-2xl w-full mx-4"
        } bg-background/95 backdrop-blur-lg shadow-2xl border-2 border-primary/20`}
      >
        <div className={`p-6 ${isMobile ? "pb-safe" : ""}`}>
          {currentStep === 1 ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {steps[currentStep].title}
                </h3>
                <p className="text-muted-foreground">
                  {steps[currentStep].description}
                </p>
              </div>
              
              <AvatarSelector
                selectedAvatar={selectedAvatar}
                onSelect={handleAvatarSelect}
              />

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <button
                  onClick={handlePrevious}
                  className="px-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Retour
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedAvatar}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  Continuer →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {steps[currentStep].title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {steps[currentStep].description}
                </p>
              </div>

              {steps[currentStep].action === "click" && (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/30 animate-pulse">
                  <p className="text-sm font-semibold text-primary text-center">
                    👆 Clique sur l'élément surligné pour continuer!
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-border">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="px-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Retour
                  </button>
                )}
                
                <div className="ml-auto">
                  {currentStep === steps.length - 1 ? (
                    <button
                      onClick={completeOnboarding}
                      className="px-8 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-bold hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      Terminer 🎉
                    </button>
                  ) : steps[currentStep].action !== "click" && (
                    <button
                      onClick={handleNext}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                    >
                      Suivant →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
