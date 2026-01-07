import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, UserPlus } from "lucide-react";
import { useVisitor } from "@/contexts/VisitorContext";

interface LockedOverlayProps {
  title?: string;
  description?: string;
  showButton?: boolean;
  className?: string;
  variant?: "full" | "minimal" | "inline";
}

export const LockedOverlay = ({
  title = "Contenu verrouillé",
  description = "Créez un compte pour accéder à cette fonctionnalité",
  showButton = true,
  className = "",
  variant = "full",
}: LockedOverlayProps) => {
  const navigate = useNavigate();
  const { exitVisitorMode } = useVisitor();

  const handleUnlock = () => {
    exitVisitorMode();
    navigate("/auth");
  };

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <Lock className="w-4 h-4" />
        <span className="text-sm">{title}</span>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div
        className={`absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-10 ${className}`}
      >
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          {showButton && (
            <Button size="sm" variant="outline" onClick={handleUnlock} className="gap-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              Débloquer
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg ${className}`}
    >
      <div className="flex flex-col items-center gap-4 p-6 text-center max-w-xs">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center animate-pulse">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {showButton && (
          <Button onClick={handleUnlock} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Créer un compte pour débloquer
          </Button>
        )}
      </div>
    </div>
  );
};
