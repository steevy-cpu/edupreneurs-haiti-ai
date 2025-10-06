import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import ericWaving from "@/assets/eric-waving.png";
import ericPointingLeft from "@/assets/eric-pointing-left.png";
import ericPointingUp from "@/assets/eric-pointing-up.png";
import ericThinking from "@/assets/eric-thinking-pose.png";
import ericThumbUp from "@/assets/eric-thumb-up.png";

interface OnboardingStep {
  title: string;
  description: string;
  image: string;
  highlight?: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Bienvenue sur Edupreneurs!",
    description: "Salut! Je suis Eric, ton guide personnel. Je vais te montrer comment utiliser la plateforme pour réussir tes études!",
    image: ericWaving,
  },
  {
    title: "Ton Tableau de Bord",
    description: "Ici, tu trouveras un aperçu de ta progression, tes cours récents et tes statistiques. C'est ton espace personnel!",
    image: ericPointingLeft,
    highlight: "dashboard",
  },
  {
    title: "Explore les Matières",
    description: "Découvre tous les cours disponibles: Maths, Sciences, Langues et plus! Choisis ce qui t'intéresse et commence à apprendre.",
    image: ericThinking,
    highlight: "matieres",
  },
  {
    title: "Ressources et Activités",
    description: "Accède à des vidéos, des quiz interactifs et des exercices pour pratiquer. Plus tu pratiques, plus tu progresses!",
    image: ericPointingUp,
    highlight: "ressources",
  },
  {
    title: "Communauté et Classement",
    description: "Connecte-toi avec d'autres étudiants, partage tes réussites et vois ton classement. L'apprentissage est plus fun ensemble!",
    image: ericThumbUp,
    highlight: "community",
  },
];

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed");
    if (!hasCompletedOnboarding) {
      // Small delay to let the dashboard load first
      setTimeout(() => {
        setIsOpen(true);
      }, 1000);
    }
  }, []);

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
    setIsOpen(false);
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-primary/20">
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 rounded-full hover:bg-primary/10"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Content */}
          <div className="flex flex-col md:flex-row">
            {/* Image section */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 flex items-center justify-center md:w-1/2">
              <img
                src={step.image}
                alt={step.title}
                className="w-64 h-64 object-contain animate-fade-in"
                key={currentStep}
              />
            </div>

            {/* Text section */}
            <div className="p-8 md:w-1/2 flex flex-col justify-between">
              <div>
                <div className="mb-6">
                  <span className="text-sm text-muted-foreground">
                    Étape {currentStep + 1} sur {steps.length}
                  </span>
                  <Progress value={progress} className="mt-2 h-2" />
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {step.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>

                <div className="flex gap-2">
                  {currentStep < steps.length - 1 && (
                    <Button variant="outline" onClick={handleSkip}>
                      Passer
                    </Button>
                  )}
                  <Button onClick={handleNext} className="gap-2">
                    {currentStep === steps.length - 1 ? "Commencer" : "Suivant"}
                    {currentStep < steps.length - 1 && (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
