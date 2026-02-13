/**
 * ShortInput - Short Answer Text Input
 * Small textarea for brief answers
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import type { ExerciseForRunner, RunnerState } from '../../types';

interface ShortInputProps {
  exercise: ExerciseForRunner;
  selectedAnswer: string | null;
  onSelect: (answer: string, type?: 'mcq' | 'short' | 'matching' | 'essay') => void;
  state: RunnerState;
  correctAnswer?: string | null;
}

export function ShortInput({
  exercise,
  selectedAnswer,
  onSelect,
  state,
  correctAnswer,
}: ShortInputProps) {
  const [shortAnswer, setShortAnswer] = useState('');
  
  const isDisabled = state === 'checking' || state === 'correct' || state === 'incorrect' || state === 'partial' || state === 'revealed';
  const showResult = state === 'correct' || state === 'incorrect' || state === 'partial' || state === 'revealed';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortAnswer.trim() || isDisabled) return;
    onSelect(shortAnswer.trim(), 'short');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex flex-col gap-2">
        <Textarea
          value={shortAnswer}
          onChange={(e) => setShortAnswer(e.target.value)}
          placeholder="Écris ta réponse..."
          disabled={isDisabled}
          className="flex-1 min-h-[60px] max-h-[200px] resize-none"
          rows={2}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
          }}
        />
        <Button type="submit" disabled={!shortAnswer.trim() || isDisabled} className="self-end">
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
