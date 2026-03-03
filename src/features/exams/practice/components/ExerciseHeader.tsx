/**
 * ExerciseHeader - Displays Q#/total, concept/timer, and points.
 * In timed mode, the center shows a countdown badge instead of concept name.
 */

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Trophy, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import judeProfile from '@/assets/jude-profile.jpeg';

interface ExerciseHeaderProps {
  number: number;
  total: number;
  concept: string;
  points: number;
  /** When true, show countdown timer in center instead of concept */
  timedMode?: boolean;
  /** Formatted countdown string (MM:SS or H:MM:SS) */
  formattedTime?: string;
  /** Less than 5 minutes — yellow warning */
  isTimeWarning?: boolean;
  /** Less than 1 minute — red pulse */
  isTimeCritical?: boolean;
}

export function ExerciseHeader({
  number,
  total,
  concept,
  points,
  timedMode,
  formattedTime,
  isTimeWarning,
  isTimeCritical,
}: ExerciseHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
      {/* Left: Jude avatar + Q counter — concept shown as tooltip in timed mode */}
      <div className="flex items-center gap-1.5">
        <img src={judeProfile} alt="Jude" className="h-5 w-5 rounded-full object-cover" loading="lazy" decoding="async" />
        {timedMode ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="font-semibold cursor-help">
                Q{number}/{total}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom">{concept}</TooltipContent>
          </Tooltip>
        ) : (
          <Badge variant="outline" className="font-semibold">
            Q{number}/{total}
          </Badge>
        )}
      </div>

      {/* Center: countdown timer OR concept name */}
      {timedMode && formattedTime ? (
        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold transition-colors',
            isTimeCritical
              ? 'bg-destructive/20 text-destructive animate-pulse'
              : isTimeWarning
                ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                : 'bg-card/60 text-foreground'
          )}
        >
          <Timer className="w-3.5 h-3.5" />
          {formattedTime}
        </div>
      ) : (
        <span className="text-sm font-medium text-muted-foreground truncate mx-2 flex-1 text-center">
          {concept}
        </span>
      )}

      <Badge variant="secondary" className="flex items-center gap-1">
        <Trophy className="h-3 w-3" />
        {points} pts
      </Badge>
    </div>
  );
}
