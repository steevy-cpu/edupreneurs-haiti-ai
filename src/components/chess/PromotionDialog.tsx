import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export type PromotionPiece = 'q' | 'r' | 'b' | 'n';

interface PromotionDialogProps {
  isOpen: boolean;
  color: 'w' | 'b';
  onSelect: (piece: PromotionPiece) => void;
  onCancel: () => void;
}

const PIECES: { key: PromotionPiece; name: string; whiteIcon: string; blackIcon: string }[] = [
  { key: 'q', name: 'Dame', whiteIcon: '♕', blackIcon: '♛' },
  { key: 'r', name: 'Tour', whiteIcon: '♖', blackIcon: '♜' },
  { key: 'b', name: 'Fou', whiteIcon: '♗', blackIcon: '♝' },
  { key: 'n', name: 'Cavalier', whiteIcon: '♘', blackIcon: '♞' },
];

export const PromotionDialog = ({ isOpen, color, onSelect, onCancel }: PromotionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-center">Promotion du pion</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground text-center mb-2">
          Choisissez une pièce
        </p>
        <div className="grid grid-cols-4 gap-2">
          {PIECES.map((piece) => (
            <Button
              key={piece.key}
              variant="outline"
              className="text-4xl h-16 hover:bg-primary/10 hover:border-primary transition-colors"
              onClick={() => onSelect(piece.key)}
              title={piece.name}
            >
              {color === 'w' ? piece.whiteIcon : piece.blackIcon}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground text-center">
          {PIECES.map((piece) => (
            <span key={piece.key}>{piece.name}</span>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
