import React from 'react';
import { Lock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVisitor } from '@/contexts/VisitorContext';
import { useNavigate } from 'react-router-dom';

interface VisitorChessOverlayProps {
  title?: string;
  description?: string;
  variant?: 'widget' | 'section';
}

export const VisitorChessOverlay: React.FC<VisitorChessOverlayProps> = ({
  title = "Réservé aux membres",
  description,
  variant = 'widget'
}) => {
  const { exitVisitorMode } = useVisitor();
  const navigate = useNavigate();

  const handleSignup = () => {
    exitVisitorMode();
    navigate('/auth/signup/step-1');
  };

  if (variant === 'widget') {
    return (
      <div className="absolute inset-0 bg-background/70 backdrop-blur-[3px] 
                      flex items-center justify-center rounded-lg 
                      opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <Button size="sm" variant="ghost" onClick={handleSignup}>
            S'inscrire
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm 
                    flex flex-col items-center justify-center gap-4 rounded-lg z-20">
      <div className="text-center space-y-2">
        <Lock className="w-8 h-8 text-primary mx-auto" />
        <h3 className="font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
      </div>
      <Button onClick={handleSignup} className="gap-1.5">
        <UserPlus className="w-4 h-4" />
        Créer un compte
      </Button>
    </div>
  );
};

export default VisitorChessOverlay;
