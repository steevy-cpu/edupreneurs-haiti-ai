/**
 * MCQInput - Multiple Choice Question Input
 * Renders tappable cards for MCQ options
 */

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { ContentBlocksRenderer } from '../../../rendering/ContentBlocksRenderer';
import { MathText } from '@/components/MathContent';
import type { ExerciseForRunner, RunnerState } from '../../types';

interface MCQInputProps {
  exercise: ExerciseForRunner;
  selectedAnswer: string | null;
  onSelect: (answer: string, type?: 'mcq' | 'short' | 'matching' | 'essay') => void;
  state: RunnerState;
  correctAnswer?: string | null;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function MCQInput({
  exercise,
  selectedAnswer,
  onSelect,
  state,
  correctAnswer,
}: MCQInputProps) {
  const isDisabled = state === 'checking' || state === 'correct' || state === 'incorrect' || state === 'partial' || state === 'revealed';
  const showResult = state === 'correct' || state === 'incorrect' || state === 'partial' || state === 'revealed';

  // Check for array-based options (legacy format)
  const hasOptionsArray = exercise.options && Array.isArray(exercise.options) && exercise.options.length > 0;
  // Check for object-based options (current database format: {A: "...", B: "..."})
  const hasOptionsObject = exercise.options && 
    typeof exercise.options === 'object' && 
    !Array.isArray(exercise.options) && 
    Object.keys(exercise.options as Record<string, unknown>).length > 0;
  // Check for structured options_json (with blocks)
  const hasOptionsJson = exercise.options_json && Object.keys(exercise.options_json).length > 0;

  // Priority: options_json > options (object) > options (array)
  let optionEntries: [string, { value: string; blocks: any } | string][];

  if (hasOptionsJson) {
    optionEntries = Object.entries(exercise.options_json!).sort(([a], [b]) => a.localeCompare(b));
  } else if (hasOptionsObject) {
    // Handle object format: {A: "text", B: "text", ...}
    optionEntries = Object.entries(exercise.options as Record<string, string>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => [key, { value, blocks: null }]);
  } else {
    // Handle array format: ["option1", "option2", ...]
    optionEntries = (exercise.options as string[] || []).map((opt, idx) => 
      [LETTERS[idx], { value: opt, blocks: null }] as [string, { value: string; blocks: null }]
    );
  }

  const handleSelect = (letter: string) => {
    if (isDisabled) return;
    onSelect(letter, 'mcq');
  };

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
            onClick={() => handleSelect(letter)}
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
