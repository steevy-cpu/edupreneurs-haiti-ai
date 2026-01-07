import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, X, UserPlus } from "lucide-react";
import { useVisitor, VisitorType } from "@/contexts/VisitorContext";

const visitorTypeLabels: Record<NonNullable<VisitorType>, string> = {
  student: "Étudiant",
  parent: "Parent",
  investor: "Investisseur",
  educator: "Éducateur",
};

export const VisitorBanner = () => {
  const navigate = useNavigate();
  const { isVisitor, visitorType, exitVisitorMode } = useVisitor();

  if (!isVisitor) return null;

  const handleSignUp = () => {
    exitVisitorMode();
    navigate("/auth");
  };

  const handleExit = () => {
    exitVisitorMode();
    navigate("/auth");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[1002] bg-gradient-to-r from-primary via-accent to-success text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="font-medium text-sm hidden sm:inline">Mode Visiteur</span>
            <span className="font-medium text-sm sm:hidden">Visiteur</span>
          </div>
          {visitorType && (
            <span className="px-2 py-0.5 bg-primary-foreground/20 rounded-full text-xs font-medium">
              {visitorTypeLabels[visitorType]}
            </span>
          )}
          <span className="text-sm text-primary-foreground/80 hidden md:inline">
            • Vous explorez Edupreneurs
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            onClick={handleSignUp}
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Créer un compte</span>
            <span className="sm:hidden">S'inscrire</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={handleExit}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
