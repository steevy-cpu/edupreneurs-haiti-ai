import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChessTimerProps {
  whiteTime: number;
  blackTime: number;
  isWhiteTurn: boolean;
  isGameOver: boolean;
}

const formatTime = (seconds: number): string => {
  if (seconds === Infinity) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const ChessTimer: React.FC<ChessTimerProps> = ({
  whiteTime,
  blackTime,
  isWhiteTurn,
  isGameOver
}) => {
  const isLowTime = (time: number) => time <= 30 && time !== Infinity;

  return (
    <div className="flex justify-between items-center gap-4 px-2">
      {/* Black timer (Eric) */}
      <div 
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
          !isWhiteTurn && !isGameOver 
            ? "bg-primary/20 border-2 border-primary animate-pulse" 
            : "bg-muted border border-border",
          isLowTime(blackTime) && !isWhiteTurn && "bg-destructive/20 border-destructive"
        )}
      >
        <Clock className={cn(
          "w-4 h-4",
          !isWhiteTurn && !isGameOver ? "text-primary" : "text-muted-foreground"
        )} />
        <span className="text-xs text-muted-foreground">Eric</span>
        <span className={cn(
          "font-mono font-bold text-lg",
          isLowTime(blackTime) && "text-destructive"
        )}>
          {formatTime(blackTime)}
        </span>
      </div>

      {/* White timer (Player) */}
      <div 
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300",
          isWhiteTurn && !isGameOver 
            ? "bg-primary/20 border-2 border-primary animate-pulse" 
            : "bg-muted border border-border",
          isLowTime(whiteTime) && isWhiteTurn && "bg-destructive/20 border-destructive"
        )}
      >
        <Clock className={cn(
          "w-4 h-4",
          isWhiteTurn && !isGameOver ? "text-primary" : "text-muted-foreground"
        )} />
        <span className="text-xs text-muted-foreground">Toi</span>
        <span className={cn(
          "font-mono font-bold text-lg",
          isLowTime(whiteTime) && "text-destructive"
        )}>
          {formatTime(whiteTime)}
        </span>
      </div>
    </div>
  );
};

export default ChessTimer;
