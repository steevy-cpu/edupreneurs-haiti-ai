import { Heart, MessageCircle, Share2, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVisitor } from '@/contexts/VisitorContext';
import { useNavigate } from 'react-router-dom';

export const VisitorFeedOverlay = () => {
  const { exitVisitorMode } = useVisitor();
  const navigate = useNavigate();

  const handleSignup = () => {
    exitVisitorMode();
    navigate('/auth');
  };

  const handleLogin = () => {
    exitVisitorMode();
    navigate('/auth?mode=login');
  };

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6 z-50 p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="flex justify-center gap-3 mb-2">
          <div className="p-3 rounded-full bg-primary/10">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <div className="p-3 rounded-full bg-green-500/10">
            <MessageCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold">Rejoignez la communauté !</h2>
        <p className="text-muted-foreground text-sm">
          Partagez vos réussites, posez des questions et interagissez 
          avec d'autres étudiants sur votre parcours d'apprentissage.
        </p>
        
        <ul className="text-sm text-left space-y-2.5 text-muted-foreground bg-muted/30 rounded-lg p-4">
          <li className="flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-primary shrink-0" />
            Aimez et commentez les publications
          </li>
          <li className="flex items-center gap-2.5">
            <Share2 className="w-4 h-4 text-green-500 shrink-0" />
            Partagez vos progrès avec vos amis
          </li>
          <li className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            Créez vos propres publications
          </li>
        </ul>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Button onClick={handleSignup} size="lg" className="gap-2 flex-1">
          <UserPlus className="w-5 h-5" />
          Créer un compte gratuit
        </Button>
        <Button onClick={handleLogin} variant="outline" size="lg" className="gap-2 flex-1">
          <LogIn className="w-5 h-5" />
          Se connecter
        </Button>
      </div>
    </div>
  );
};
