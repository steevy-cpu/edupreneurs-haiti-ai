import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Crown, Users } from 'lucide-react';
import { getAvatarUrl } from '@/lib/avatarMap';
import { cn } from '@/lib/utils';

interface ChessModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSolo: () => void;
  onSelectMultiplayer: () => void;
}

const ChessModeSelector = ({
  isOpen,
  onClose,
  onSelectSolo,
  onSelectMultiplayer,
}: ChessModeSelectorProps) => {
  const judeAvatar = getAvatarUrl('jude', 64);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-xl">Jouer aux Échecs</DialogTitle>
          <DialogDescription>Comment veux-tu jouer ?</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
          {/* Solo AI Option */}
          <button
            onClick={onSelectSolo}
            className={cn(
              "flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-transparent",
              "bg-muted/50 hover:bg-primary/10 hover:border-primary/30",
              "transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
          >
            <div className="relative">
              {judeAvatar ? (
                <img
                  src={judeAvatar}
                  alt="Jude"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Crown className="w-7 h-7 text-white" />
                </div>
              )}
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-foreground text-sm sm:text-base">
                Jouer avec Jude
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Partie contre l'IA coach
              </p>
            </div>
          </button>

          {/* Multiplayer Option */}
          <button
            onClick={onSelectMultiplayer}
            className={cn(
              "flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-transparent",
              "bg-muted/50 hover:bg-secondary/10 hover:border-secondary/30",
              "transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
            )}
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center ring-2 ring-secondary/20 group-hover:ring-secondary/50 transition-all">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-foreground text-sm sm:text-base">
                Défier un ami
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Invite ou trouve un adversaire
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChessModeSelector;
