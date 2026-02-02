/**
 * AnswerInput - MCQ tappable cards or short answer input
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, X, Send } from 'lucide-react';
import { ContentBlocksRenderer } from '../../rendering/ContentBlocksRenderer';
import { MathText } from '@/components/MathContent';
import type { ExerciseForRunner, RunnerState } from '../types';

interface AnswerInputProps {
  exercise: ExerciseForRunner;
  selectedAnswer: string | null;
  onSelect: (answer: string, type?: 'mcq' | 'short') => void;
  state: RunnerState;
  correctAnswer?: string | null;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function AnswerInput({
  exercise,
  selectedAnswer,
  onSelect,
  state,
  correctAnswer,
}: AnswerInputProps) {
  const [shortAnswer, setShortAnswer] = useState('');
  
  const isDisabled = state === 'checking' || state === 'correct' || state === 'incorrect' || state === 'revealed';
  const showResult = state === 'correct' || state === 'incorrect' || state === 'revealed';
  
  // Determine if we have MCQ options
  const hasOptions = exercise.options && Array.isArray(exercise.options) && exercise.options.length > 0;
  const hasOptionsJson = exercise.options_json && Object.keys(exercise.options_json).length > 0;
  const isMCQ = hasOptions || hasOptionsJson;

  // Handle MCQ selection
  const handleMCQSelect = (letter: string) => {
    if (isDisabled) return;
    onSelect(letter, 'mcq');
  };

  // Handle short answer submission
  const handleShortAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortAnswer.trim() || isDisabled) return;
    onSelect(shortAnswer.trim(), 'short');
  };

  // Render MCQ options
  if (isMCQ) {
    // Use options_json if available (structured with blocks), otherwise use options array
    const optionEntries = hasOptionsJson
      ? Object.entries(exercise.options_json!).sort(([a], [b]) => a.localeCompare(b))
      : (exercise.options || []).map((opt, idx) => [LETTERS[idx], { value: opt, blocks: null }] as const);

    return (
      <div className="space-y-2 mt-4">
        {optionEntries.map(([key, optionData]) => {
          const letter = String(key).toUpperCase();
          const optValue = typeof optionData === 'object' && optionData !== null 
            ? (optionData as any).value || String(optionData)
            : String(optionData);
          const optBlocks = typeof optionData === 'object' && optionData !== null 
            ? (optionData as any).blocks 
            : null;
          
          const isSelected = selectedAnswer === letter;
          const isCorrectAnswer = correctAnswer?.toUpperCase() === letter;
          const isWrongSelected = showResult && isSelected && !isCorrectAnswer;
          const showAsCorrect = showResult && isCorrectAnswer;

          return (
            <Card
              key={letter}
              onClick={() => handleMCQSelect(letter)}
              className={cn(
                'p-3 cursor-pointer transition-all flex items-center gap-3',
                'hover:border-primary/50 hover:bg-primary/5',
                isDisabled && 'cursor-not-allowed opacity-70',
                isSelected && !showResult && 'border-primary bg-primary/10',
                showAsCorrect && 'border-green-500 bg-green-500/10',
                isWrongSelected && 'border-red-500 bg-red-500/10'
              )}
            >
              {/* Letter badge */}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0',
                  'border-2 transition-colors',
                  isSelected && !showResult && 'border-primary bg-primary text-primary-foreground',
                  showAsCorrect && 'border-green-500 bg-green-500 text-white',
                  isWrongSelected && 'border-red-500 bg-red-500 text-white',
                  !isSelected && !showAsCorrect && 'border-muted-foreground/30 bg-muted/50'
                )}
              >
                {showAsCorrect ? <Check className="h-4 w-4" /> : isWrongSelected ? <X className="h-4 w-4" /> : letter}
              </div>
              
              {/* Option text */}
              <div className="flex-1 text-sm">
                {optBlocks && Array.isArray(optBlocks) && optBlocks.length > 0 ? (
                  <ContentBlocksRenderer blocks={optBlocks} />
                ) : (
                  <MathText text={optValue} />
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  // Render short answer input
  return (
    <form onSubmit={handleShortAnswerSubmit} className="mt-4">
      <div className="flex gap-2">
        <Input
          value={shortAnswer}
          onChange={(e) => setShortAnswer(e.target.value)}
          placeholder="Écris ta réponse..."
          disabled={isDisabled}
          className="flex-1"
        />
        <Button type="submit" disabled={!shortAnswer.trim() || isDisabled}>
          <Send className="h-4 w-4 mr-2" />
          Vérifier
        </Button>
      </div>
      {showResult && correctAnswer && (
        <p className="mt-2 text-sm text-muted-foreground">
          Réponse correcte: <strong>{correctAnswer}</strong>
        </p>
      )}
    </form>
  );
}
