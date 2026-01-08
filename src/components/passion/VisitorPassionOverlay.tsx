import { Music, Palette, Brain, BookOpen, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVisitor } from '@/contexts/VisitorContext';
import { useNavigate } from 'react-router-dom';

export const VisitorPassionOverlay = () => {
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
        <div className="flex justify-center gap-2 mb-2">
          <div className="p-2.5 rounded-full bg-violet-500/20">
            <Music className="w-6 h-6 text-violet-500" />
          </div>
          <div className="p-2.5 rounded-full bg-cyan-500/20">
            <Palette className="w-6 h-6 text-cyan-500" />
          </div>
          <div className="p-2.5 rounded-full bg-amber-500/20">
            <Brain className="w-6 h-6 text-amber-500" />
          </div>
          <div className="p-2.5 rounded-full bg-emerald-500/20">
            <BookOpen className="w-6 h-6 text-emerald-500" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold">Découvre tes passions!</h2>
        <p className="text-muted-foreground text-sm">
          Fais le quiz pour découvrir ce qui te passionne et accède à des 
          contenus personnalisés en musique, arts, échecs et littérature.
        </p>
        
        <ul className="text-sm text-left space-y-2.5 text-muted-foreground bg-muted/30 rounded-lg p-4">
          <li className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-violet-500 shrink-0" />
            Quiz de personnalité avec Jude
          </li>
          <li className="flex items-center gap-2.5">
            <Music className="w-4 h-4 text-primary shrink-0" />
            Modules interactifs par passion
          </li>
          <li className="flex items-center gap-2.5">
            <Brain className="w-4 h-4 text-amber-500 shrink-0" />
            Suivi de ta progression
          </li>
        </ul>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Button 
          onClick={handleSignup} 
          size="lg" 
          className="gap-2 flex-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 hover:opacity-90"
        >
          <UserPlus className="w-5 h-5" />
          Créer un compte
        </Button>
        <Button 
          onClick={handleLogin} 
          variant="outline" 
          size="lg" 
          className="gap-2 flex-1"
        >
          <LogIn className="w-5 h-5" />
          Se connecter
        </Button>
      </div>
    </div>
  );
};
