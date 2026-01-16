import { useNavigate } from "react-router-dom";
import { BookOpen, BookMarked, MessageSquare, TrendingUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVisitor } from "@/contexts/VisitorContext";

export function VisitorLibraryOverlay() {
  const navigate = useNavigate();
  const { exitVisitorMode } = useVisitor();

  const handleSignUp = () => {
    exitVisitorMode();
    navigate('/auth?mode=signup');
  };

  const handleLogin = () => {
    exitVisitorMode();
    navigate('/auth?mode=login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>

        {/* Title */}
        <h2 className="text-center text-2xl font-bold text-foreground">
          Bibliothèque Numérique
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Créez un compte gratuit pour accéder à notre collection de livres
        </p>

        {/* Benefits */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <BookMarked className="h-5 w-5 text-primary" />
            <span className="text-sm">Lisez des livres en français et anglais</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm">Suivez votre progression de lecture</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="text-sm">Posez des questions à Jude sur le vocabulaire</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-6 space-y-3">
          <Button onClick={handleSignUp} className="w-full" size="lg">
            <Lock className="mr-2 h-4 w-4" />
            Créer un compte gratuit
          </Button>
          <Button onClick={handleLogin} variant="outline" className="w-full" size="lg">
            Se connecter
          </Button>
        </div>
      </div>
    </div>
  );
}
