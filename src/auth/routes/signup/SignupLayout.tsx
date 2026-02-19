/**
 * SignupLayout - Progress bar + outlet for signup steps.
 * Streamlined to 2 steps: Compte (step-1) and Finalisation (step-3).
 */

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Telescope } from "lucide-react";
import { VisitorTypeSelector } from "@/components/visitor";

export default function SignupLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showVisitorSelector, setShowVisitorSelector] = useState(false);
  
  // Determine current step from URL — 2-step flow (Step 2 removed)
  const getStepFromPath = (): number => {
    if (location.pathname.includes('step-1')) return 1;
    // step-3 is now step 2 in the visual progress
    if (location.pathname.includes('step-3')) return 2;
    return 1;
  };
  
  const currentStep = getStepFromPath();
  const totalSteps = 2;

  return (
    <>
      {/* Visitor Mode Button */}
      <div className="px-5 pt-5 pb-2">
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 py-5 border-2 border-dashed border-primary/40 text-primary font-medium
                     hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg
                     transition-all duration-300 group"
          onClick={() => setShowVisitorSelector(true)}
        >
          <Telescope className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Découvrir la plateforme sans inscription</span>
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Explorez en mode visiteur, inscrivez-vous plus tard
        </p>
      </div>

      {/* Tabs */}
      <div className="auth-tabs p-3 flex justify-center">
        <div className="relative flex bg-muted/50 rounded-xl p-1 w-fit">
          <button
            className="relative z-10 flex-1 text-center py-2.5 px-5 rounded-lg font-semibold text-sm text-muted-foreground hover:text-foreground/80 hover:bg-muted transition-all duration-300 ease-out"
            onClick={() => navigate('/auth/login')}
          >
            Se connecter
          </button>
          <button
            className="relative z-10 flex-1 text-center py-2.5 px-5 rounded-lg font-semibold text-sm bg-primary text-primary-foreground shadow-md transition-all duration-300 ease-out"
          >
            Créer un compte
          </button>
        </div>
      </div>

      {/* Content with Progress */}
      <div className="auth-content p-5">
        {/* Visual Step Progress Indicator — 2 steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step ? '✓' : step}
                </div>
                {step < 2 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                    currentStep > step ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className={currentStep >= 1 ? 'text-primary font-medium' : ''}>Compte</span>
            <span className={currentStep >= 2 ? 'text-primary font-medium' : ''}>Finalisation</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content via Outlet */}
        <Outlet />
      </div>

      {/* Visitor Type Selector Modal */}
      <VisitorTypeSelector 
        open={showVisitorSelector} 
        onOpenChange={setShowVisitorSelector} 
      />
    </>
  );
}
