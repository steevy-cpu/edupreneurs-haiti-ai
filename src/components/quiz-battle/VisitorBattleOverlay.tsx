import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Swords, Sparkles, ArrowRight } from 'lucide-react';

export const VisitorBattleOverlay = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-6 mb-6 border border-primary/20">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="p-3 rounded-full bg-primary/20">
          <Swords className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Mode Visiteur
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Créez un compte gratuit pour jouer au Quiz Battle, gagner des XP et défier vos amis!
          </p>
        </div>
        <Button 
          onClick={() => navigate('/auth/signup/step-1')}
          className="bg-primary hover:bg-primary/90 whitespace-nowrap"
        >
          Créer un compte
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
