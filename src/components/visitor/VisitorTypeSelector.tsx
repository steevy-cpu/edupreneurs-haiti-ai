import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Briefcase, BookOpen, ArrowRight, Eye } from "lucide-react";
import { useVisitor, VisitorType } from "@/contexts/VisitorContext";

interface VisitorTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const visitorTypeOptions: { type: VisitorType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    type: "student",
    label: "Étudiant",
    description: "Je suis un élève qui veut découvrir la plateforme",
    icon: <GraduationCap className="w-6 h-6" />,
  },
  {
    type: "parent",
    label: "Parent",
    description: "Je suis un parent intéressé pour mon enfant",
    icon: <Users className="w-6 h-6" />,
  },
  {
    type: "investor",
    label: "Investisseur / Partenaire",
    description: "Je suis intéressé par un partenariat",
    icon: <Briefcase className="w-6 h-6" />,
  },
  {
    type: "educator",
    label: "Éducateur",
    description: "Je suis enseignant ou dans le secteur éducatif",
    icon: <BookOpen className="w-6 h-6" />,
  },
];

export const VisitorTypeSelector = ({ open, onOpenChange }: VisitorTypeSelectorProps) => {
  const navigate = useNavigate();
  const { startVisitorMode } = useVisitor();
  const [selectedType, setSelectedType] = useState<VisitorType>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Debug: Log when component renders with open prop
  console.log('[VisitorTypeSelector] Rendering with open:', open);

  const handleStart = async () => {
    if (!selectedType) return;
    
    setIsStarting(true);
    
    // Start visitor mode with selected type
    startVisitorMode(selectedType);
    
    // Close dialog
    onOpenChange(false);
    
    // Navigate to dashboard to start the tour
    navigate("/dashboard");
    
    setIsStarting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl">Découvrir la plateforme</DialogTitle>
          </div>
          <DialogDescription>
            Qui êtes-vous ? Cette information nous aide à personnaliser votre visite.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {visitorTypeOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => setSelectedType(option.type)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedType === option.type
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  selectedType === option.type
                    ? "bg-gradient-to-br from-primary to-success text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {option.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </div>
              {selectedType === option.type && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            className="flex-1 gap-2"
            disabled={!selectedType || isStarting}
            onClick={handleStart}
          >
            {isStarting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                Commencer la visite
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
