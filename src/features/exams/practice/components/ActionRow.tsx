/**
 * ActionRow - Indice, Révéler, Suivant buttons
 */

import { Button } from '@/components/ui/button';
import { Lightbulb, Eye, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import type { RunnerState } from '../types';

interface ActionRowProps {
  hintLevel: number;
  onHint: () => void;
  onReveal: () => void;
  onNext: () => void;
  onPrevious?: () => void;
  canAdvance: boolean;
  canGoPrevious?: boolean;
  isLoading: boolean;
  state: RunnerState;
}

export function ActionRow({
  hintLevel,
  onHint,
  onReveal,
  onNext,
  onPrevious,
  canAdvance,
  canGoPrevious = false,
  isLoading,
  state,
}: ActionRowProps) {
  const isAnswered = state === 'correct' || state === 'incorrect' || state === 'revealed';
  const hintDisabled = hintLevel >= 3 || isLoading || isAnswered;
  const revealDisabled = isLoading || isAnswered;

  return (
    <div className="flex flex-wrap gap-2 p-3 border-t bg-muted/30">
      {/* Previous button (optional) */}
      {onPrevious && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          disabled={!canGoPrevious || isLoading}
          className="flex-shrink-0"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Précédent
        </Button>
      )}

      {/* Hint button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onHint}
        disabled={hintDisabled}
        className="flex-1 min-w-[100px]"
      >
        {isLoading && state === 'checking' ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Lightbulb className="h-4 w-4 mr-2" />
        )}
        Indice
        {hintLevel > 0 && ` (${hintLevel}/3)`}
      </Button>

      {/* Reveal button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={onReveal}
        disabled={revealDisabled}
        className="flex-1 min-w-[100px]"
      >
        <Eye className="h-4 w-4 mr-2" />
        Révéler
      </Button>

      {/* Next button */}
      <Button
        size="sm"
        onClick={onNext}
        disabled={!canAdvance && !isAnswered}
        className="flex-1 min-w-[100px]"
      >
        Suivant
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
