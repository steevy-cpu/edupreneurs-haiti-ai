import { Globe, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchVisibilityToggleProps {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
}

export const MatchVisibilityToggle = ({ isPublic, onChange }: MatchVisibilityToggleProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Visibilité</label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
            "hover:scale-[1.02] active:scale-[0.98]",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
            !isPublic
              ? "border-primary bg-primary/10 text-primary"
              : "border-muted bg-muted/50 text-muted-foreground hover:border-primary/30"
          )}
        >
          <Lock className="w-4 h-4" />
          <span className="text-sm font-medium">Privée</span>
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
            "hover:scale-[1.02] active:scale-[0.98]",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
            isPublic
              ? "border-secondary bg-secondary/10 text-secondary"
              : "border-muted bg-muted/50 text-muted-foreground hover:border-secondary/30"
          )}
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">Publique</span>
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        {isPublic 
          ? 'Visible par tous les joueurs dans la liste des parties' 
          : 'Accessible uniquement avec le code d\'invitation'}
      </p>
    </div>
  );
};
