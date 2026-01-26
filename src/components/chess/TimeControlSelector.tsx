import { Zap, Flame, Timer, Clock, Infinity, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimeControl, TIME_CONTROL_LABELS } from '@/hooks/useChessMultiplayer';

interface TimeControlSelectorProps {
  value: TimeControl;
  onChange: (value: TimeControl) => void;
}

const TIME_CONTROLS: { value: TimeControl; Icon: LucideIcon }[] = [
  { value: 'bullet', Icon: Zap },
  { value: 'blitz', Icon: Flame },
  { value: 'rapid', Icon: Timer },
  { value: 'classic', Icon: Clock },
  { value: 'untimed', Icon: Infinity },
];

export const TimeControlSelector = ({ value, onChange }: TimeControlSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Contrôle du temps</label>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {TIME_CONTROLS.map((tc) => {
          const IconComponent = tc.Icon;
          return (
            <button
              key={tc.value}
              type="button"
              onClick={() => onChange(tc.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
                value === tc.value
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-muted bg-muted/50 text-muted-foreground hover:border-primary/30 hover:bg-muted"
              )}
            >
              <IconComponent className="h-5 w-5" />
              <span className="text-xs font-medium text-center leading-tight">
                {TIME_CONTROL_LABELS[tc.value]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
