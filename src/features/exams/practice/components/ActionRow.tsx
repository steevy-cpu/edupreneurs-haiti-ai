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
    <div className="p-3 border-t bg-muted/30 space-y-2">
      {/* Row 1: Previous + Hint */}
      <div className="flex gap-2">
        {onPrevious && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={!canGoPrevious || isLoading}
            className="flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Précédent</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onHint}
          disabled={hintDisabled}
          className="flex-1"
        >
          {isLoading && state === 'checking' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Lightbulb className="h-4 w-4 mr-2" />
          )}
          Indice
          {hintLevel > 0 && ` (${hintLevel}/3)`}
        </Button>
      </div>

      {/* Row 2: Reveal + Next (always full width, equal split) */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onReveal}
          disabled={revealDisabled}
        >
          <Eye className="h-4 w-4 mr-2" />
          Voir la réponse
        </Button>

        <Button
          size="sm"
          onClick={onNext}
          disabled={!canAdvance && !isAnswered}
        >
          Question suivante
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
