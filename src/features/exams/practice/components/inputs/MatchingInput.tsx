/**
 * MatchingInput - Interactive Column Matching UI
 * Two-column tap interface for matching questions
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, Link2, Send, AlertCircle } from 'lucide-react';
import { parseMatchingColumns, formatMatchingAnswer, type ParsedMatching } from '../../utils/parseMatching';
import { ShortInput } from './ShortInput';
import type { ExerciseForRunner, RunnerState } from '../../types';

interface MatchingInputProps {
  exercise: ExerciseForRunner;
  selectedAnswer: string | null;
  onSelect: (answer: string, type?: 'mcq' | 'short' | 'matching' | 'essay') => void;
  state: RunnerState;
  correctAnswer?: string | null;
}

export function MatchingInput({
  exercise,
  selectedAnswer,
  onSelect,
  state,
  correctAnswer,
}: MatchingInputProps) {
  // Parse columns from question text
  const parsed = useMemo<ParsedMatching | null>(() => {
    return parseMatchingColumns(exercise.question_text);
  }, [exercise.question_text]);

  // State for active selection and matches
  const [activeNumber, setActiveNumber] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});

  const isDisabled = state === 'checking' || state === 'correct' || state === 'incorrect' || state === 'partial' || state === 'revealed';
  const showResult = state === 'correct' || state === 'incorrect' || state === 'partial' || state === 'revealed';

  // If parsing failed, fall back to short answer input
  if (!parsed) {
    return (
      <div className="mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <AlertCircle className="h-4 w-4" />
          <span>Format de correspondance non reconnu. Écris ta réponse ci-dessous:</span>
        </div>
        <ShortInput
          exercise={exercise}
          selectedAnswer={selectedAnswer}
          onSelect={onSelect}
          state={state}
          correctAnswer={correctAnswer}
        />
      </div>
    );
  }

  const { columnA, columnB } = parsed;

  // Handle tapping a number in Column A
  const handleNumberTap = (id: string) => {
    if (isDisabled) return;
    
    if (activeNumber === id) {
      // Deselect if already active
      setActiveNumber(null);
    } else {
      setActiveNumber(id);
    }
  };

  // Handle tapping a letter in Column B
  const handleLetterTap = (id: string) => {
    if (isDisabled || !activeNumber) return;
    
    // Create the match
    setMatches(prev => ({
      ...prev,
      [activeNumber]: id,
    }));
    
    // Clear active selection
    setActiveNumber(null);
  };

  // Clear a specific match
  const handleClearMatch = (numberId: string) => {
    if (isDisabled) return;
    
    setMatches(prev => {
      const next = { ...prev };
      delete next[numberId];
      return next;
    });
  };

  // Submit all matches
  const handleSubmit = () => {
    if (Object.keys(matches).length === 0 || isDisabled) return;
    
    const formattedAnswer = formatMatchingAnswer(matches);
    onSelect(formattedAnswer, 'matching');
  };

  // Check if all Column A items are matched
  const allMatched = columnA.every(item => matches[item.id]);

  // Get the letter matched to a number (if any)
  const getMatchedLetter = (numberId: string): string | null => {
    return matches[numberId] || null;
  };

  // Check if a letter is already used
  const isLetterUsed = (letterId: string): boolean => {
    return Object.values(matches).includes(letterId);
  };

  // Get which number is using a letter
  const getNumberUsingLetter = (letterId: string): string | null => {
    const entry = Object.entries(matches).find(([_, letter]) => letter === letterId);
    return entry ? entry[0] : null;
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Instructions */}
      <p className="text-sm text-muted-foreground">
        Tape un numéro, puis tape une lettre pour créer une correspondance.
      </p>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-3">
        {/* Column A - Numbers */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Kolòn A
          </div>
          {columnA.map(item => {
            const matchedLetter = getMatchedLetter(item.id);
            const isActive = activeNumber === item.id;
            
            return (
              <Card
                key={item.id}
                onClick={() => matchedLetter ? handleClearMatch(item.id) : handleNumberTap(item.id)}
                className={cn(
                  'p-3 cursor-pointer transition-all',
                  'hover:border-primary/50',
                  isDisabled && 'cursor-not-allowed opacity-70',
                  isActive && 'border-primary bg-primary/10 ring-2 ring-primary/30',
                  matchedLetter && 'border-green-500/50 bg-green-500/5'
                )}
              >
                <div className="flex items-center gap-2">
                  {/* Number badge */}
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0',
                      'border-2 transition-colors',
                      isActive && 'border-primary bg-primary text-primary-foreground',
                      matchedLetter && 'border-green-500 bg-green-500 text-white',
                      !isActive && !matchedLetter && 'border-muted-foreground/30 bg-muted/50'
                    )}
                  >
                    {item.id}
                  </div>
                  
                  {/* Item text */}
                  <span className="text-sm flex-1 line-clamp-2">{item.text}</span>
                  
                  {/* Match indicator */}
                  {matchedLetter && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Link2 className="h-3 w-3" />
                      <span className="font-bold text-sm">{matchedLetter}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Column B - Letters */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Kolòn B
          </div>
          {columnB.map(item => {
            const usedByNumber = getNumberUsingLetter(item.id);
            const isUsed = !!usedByNumber;
            const canSelect = activeNumber && !isUsed;
            
            return (
              <Card
                key={item.id}
                onClick={() => canSelect && handleLetterTap(item.id)}
                className={cn(
                  'p-3 transition-all',
                  canSelect && 'cursor-pointer hover:border-primary/50 hover:bg-primary/5',
                  !canSelect && !isUsed && 'opacity-50',
                  isDisabled && 'cursor-not-allowed opacity-70',
                  isUsed && 'border-green-500/50 bg-green-500/5',
                  activeNumber && !isUsed && 'ring-1 ring-primary/30'
                )}
              >
                <div className="flex items-center gap-2">
                  {/* Letter badge */}
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0',
                      'border-2 transition-colors',
                      isUsed && 'border-green-500 bg-green-500 text-white',
                      !isUsed && 'border-muted-foreground/30 bg-muted/50'
                    )}
                  >
                    {isUsed ? <Check className="h-3 w-3" /> : item.id}
                  </div>
                  
                  {/* Item text */}
                  <span className="text-sm flex-1 line-clamp-2">{item.text}</span>
                  
                  {/* Match indicator */}
                  {usedByNumber && (
                    <span className="text-xs text-green-600 font-medium">
                      ← {usedByNumber}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Match summary */}
      {Object.keys(matches).length > 0 && (
        <div className="p-2 bg-muted/50 rounded-md">
          <div className="text-xs text-muted-foreground mb-1">Tes correspondances:</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(matches)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([num, letter]) => (
                <span 
                  key={num} 
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-700 rounded text-sm font-medium"
                >
                  {num} → {letter}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Submit button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={Object.keys(matches).length === 0 || isDisabled}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          {allMatched ? 'Vérifier' : `Vérifier (${Object.keys(matches).length}/${columnA.length})`}
        </Button>
      </div>

      {/* Result display */}
      {showResult && correctAnswer && (
        <p className="text-sm text-muted-foreground">
          Réponse correcte: <strong>{correctAnswer}</strong>
        </p>
      )}
    </div>
  );
}
