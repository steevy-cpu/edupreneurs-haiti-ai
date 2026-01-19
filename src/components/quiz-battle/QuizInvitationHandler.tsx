import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizInvitations, QuizInvitation } from '@/hooks/useQuizInvitations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/lib/avatarMap';
import { Swords, Clock, Loader2, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizInvitationHandlerProps {
  userId: string;
}

export const QuizInvitationHandler = ({ userId }: QuizInvitationHandlerProps) => {
  const navigate = useNavigate();
  const [activeInvitation, setActiveInvitation] = useState<QuizInvitation | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const {
    pendingInvitations,
    acceptInvitation,
    declineInvitation,
    isAccepting,
  } = useQuizInvitations({ userId, enabled: true });

  // Show dialog when new invitation arrives
  useEffect(() => {
    if (pendingInvitations.length > 0 && !activeInvitation) {
      const newest = pendingInvitations[0];
      setActiveInvitation(newest);
      setIsOpen(true);
      
      // Calculate time left
      const expiresAt = new Date(newest.expires_at).getTime();
      const now = Date.now();
      setTimeLeft(Math.max(0, Math.floor((expiresAt - now) / 1000)));
    }
  }, [pendingInvitations, activeInvitation]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !activeInvitation) return;

    const interval = setInterval(() => {
      const expiresAt = new Date(activeInvitation.expires_at).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        // Invitation expired
        setIsOpen(false);
        setActiveInvitation(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, activeInvitation]);

  const handleAccept = async () => {
    if (!activeInvitation) return;
    
    const battleId = await acceptInvitation(activeInvitation.id);
    
    if (battleId) {
      setIsOpen(false);
      setActiveInvitation(null);
      navigate(`/quiz-battle/multiplayer/${battleId}`);
    }
  };

  const handleDecline = async () => {
    if (!activeInvitation) return;
    
    await declineInvitation(activeInvitation.id);
    setIsOpen(false);
    setActiveInvitation(null);
  };

  const handleClose = () => {
    // Declining when closing without response
    if (activeInvitation) {
      declineInvitation(activeInvitation.id);
    }
    setIsOpen(false);
    setActiveInvitation(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Facile';
      case 'medium': return 'Moyen';
      case 'hard': return 'Difficile';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success';
      case 'medium': return 'text-warning';
      case 'hard': return 'text-destructive';
      default: return '';
    }
  };

  if (!activeInvitation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Swords className="w-6 h-6 text-primary animate-pulse" />
            Défi Quiz Battle!
          </DialogTitle>
          <DialogDescription>
            Tu as reçu une invitation pour un duel
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Sender Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage 
                src={activeInvitation.sender?.avatar_url 
                  ? getAvatarUrl(activeInvitation.sender.avatar_url) 
                  : undefined
                } 
              />
              <AvatarFallback className="text-lg bg-primary/20 text-primary">
                {activeInvitation.sender?.nickname?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-xl">
                {activeInvitation.sender?.nickname || 'Joueur'}
              </p>
              <p className="text-muted-foreground">te défie en duel!</p>
            </div>
          </div>

          {/* Quiz Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground">Matière</p>
              <p className="font-semibold mt-1">
                {activeInvitation.subject?.name || 'Quiz'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground">Difficulté</p>
              <p className={cn("font-semibold mt-1", getDifficultyColor(activeInvitation.difficulty))}>
                {getDifficultyLabel(activeInvitation.difficulty)}
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-lg">
            <Clock className={cn(
              "w-5 h-5",
              timeLeft <= 30 ? "text-destructive animate-pulse" : "text-muted-foreground"
            )} />
            <span className={cn(
              "font-mono font-bold",
              timeLeft <= 30 ? "text-destructive" : "text-foreground"
            )}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleDecline}
            disabled={isAccepting}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Refuser
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={isAccepting}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {isAccepting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Accepter!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
