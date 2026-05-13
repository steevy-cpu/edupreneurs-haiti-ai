import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const ericThinking = '/images/eric-thinking-pose-200w.webp';

const ComingSoonOverlay = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-center p-8 max-w-md mx-4">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center mx-auto animate-pulse">
            <Lock className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        
        <img
          src={ericThinking}
          srcSet="/images/eric-thinking-pose-200w.webp 200w, /images/eric-thinking-pose-400w.webp 400w"
          sizes="128px"
          alt="Eric thinking"
          className="w-32 h-32 object-contain mx-auto mb-4"
          loading="lazy"
          decoding="async"
        />
        
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Fonctionnalité bientôt disponible
        </h2>
        
        <p className="text-muted-foreground mb-6">
          Cette section sera disponible prochainement. Restez à l'écoute!
        </p>
        
        <Button
          onClick={() => navigate("/dashboard")}
          className="bg-gradient-to-br from-primary to-success hover:opacity-90"
        >
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  );
};

export default ComingSoonOverlay;
