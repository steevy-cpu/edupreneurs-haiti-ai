import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, X, UserPlus, Moon, Sun } from "lucide-react";
import { useVisitor, VisitorType } from "@/contexts/VisitorContext";
import { useTheme } from "next-themes";

const visitorTypeLabels: Record<NonNullable<VisitorType>, string> = {
  student: "Étudiant",
  parent: "Parent",
  investor: "Investisseur",
  educator: "Éducateur",
};

export const VisitorBanner = () => {
  const navigate = useNavigate();
  const { isVisitor, visitorType, exitVisitorMode } = useVisitor();
  const { theme, setTheme } = useTheme();

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
    <div className="sticky top-0 z-[1002] bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-xl">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white">
            <div className="p-1.5 bg-primary/20 rounded-full">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-sm hidden sm:inline">Mode Visiteur</span>
            <span className="font-semibold text-sm sm:hidden">Visiteur</span>
          </div>
          {visitorType && (
            <span className="px-2.5 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold border border-primary/30">
              {visitorTypeLabels[visitorType]}
            </span>
          )}
          <span className="text-sm text-slate-400 hidden md:inline">
            • Vous explorez Edupreneurs
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Button
            size="sm"
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25"
            onClick={handleSignUp}
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Créer un compte</span>
            <span className="sm:hidden">S'inscrire</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50"
            onClick={handleExit}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
