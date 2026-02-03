/**
 * EssayInput - Long-form Answer Input
 * Expandable textarea with word count and auto-save for essay questions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, Save, Lightbulb } from 'lucide-react';
import type { ExerciseForRunner, RunnerState } from '../../types';

interface EssayInputProps {
  exercise: ExerciseForRunner;
  selectedAnswer: string | null;
  onSelect: (answer: string, type?: 'mcq' | 'short' | 'matching' | 'essay') => void;
  state: RunnerState;
  correctAnswer?: string | null;
}

// Auto-save interval in milliseconds
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// Local storage key prefix
const DRAFT_KEY_PREFIX = 'essay_draft_';

export function EssayInput({
  exercise,
  selectedAnswer,
  onSelect,
  state,
  correctAnswer,
}: EssayInputProps) {
  const draftKey = `${DRAFT_KEY_PREFIX}${exercise.id}`;
  
  // Load draft from localStorage on mount
  const [essayText, setEssayText] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(draftKey) || '';
    }
    return '';
  });
  
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const isDisabled = state === 'checking' || state === 'correct' || state === 'incorrect' || state === 'revealed';
  const showResult = state === 'correct' || state === 'incorrect' || state === 'revealed';

  // Calculate word count
  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const charCount = essayText.length;

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    if (typeof window !== 'undefined' && essayText.trim()) {
      setIsSaving(true);
      localStorage.setItem(draftKey, essayText);
      setLastSaved(new Date());
      setTimeout(() => setIsSaving(false), 500);
    }
  }, [draftKey, essayText]);

  // Auto-save effect
  useEffect(() => {
    if (isDisabled) return;
    
    const interval = setInterval(() => {
      if (essayText.trim()) {
        saveDraft();
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [essayText, saveDraft, isDisabled]);

  // Save on blur
  const handleBlur = () => {
    if (essayText.trim()) {
      saveDraft();
    }
  };

  // Handle submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!essayText.trim() || isDisabled) return;
    
    // Clear draft on submit
    if (typeof window !== 'undefined') {
      localStorage.removeItem(draftKey);
    }
    
    onSelect(essayText.trim(), 'essay');
  };

  // Auto-resize textarea
  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(Math.max(textareaRef.current.scrollHeight, 200), 400)}px`;
    }
  };

  // Detect multi-part question (a, b, c structure)
  const hasMultipleParts = /[abc]\)\s/i.test(exercise.question_text);

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      {/* Header with word count */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Ta réponse:
        </label>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {lastSaved && (
            <span className="flex items-center gap-1">
              <Save className="h-3 w-3" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegardé'}
            </span>
          )}
          <span className="font-medium">
            {wordCount} mot{wordCount !== 1 ? 's' : ''} • {charCount} caractères
          </span>
        </div>
      </div>

      {/* Large textarea */}
      <Textarea
        ref={textareaRef}
        value={essayText}
        onChange={(e) => setEssayText(e.target.value)}
        onInput={handleInput}
        onBlur={handleBlur}
        placeholder="Écris ta réponse détaillée ici..."
        disabled={isDisabled}
        className="min-h-[200px] max-h-[400px] resize-none text-base leading-relaxed"
        rows={8}
      />

      {/* Multi-part hint */}
      {hasMultipleParts && (
        <Card className="p-3 bg-amber-500/10 border-amber-500/20">
          <div className="flex items-start gap-2 text-sm">
            <Lightbulb className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 dark:text-amber-200">
              <strong>Conseil:</strong> Cette question a plusieurs parties. Sépare tes réponses avec{' '}
              <code className="bg-amber-500/20 px-1 rounded">a)</code>,{' '}
              <code className="bg-amber-500/20 px-1 rounded">b)</code>,{' '}
              <code className="bg-amber-500/20 px-1 rounded">c)</code> pour plus de clarté.
            </p>
          </div>
        </Card>
      )}

      {/* Submit button */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!essayText.trim() || isDisabled}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Soumettre la réponse
        </Button>
      </div>

      {/* Result display */}
      {showResult && correctAnswer && (
        <Card className="p-3 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <strong>Éléments de réponse attendus:</strong>
          </p>
          <p className="mt-1 text-sm">{correctAnswer}</p>
        </Card>
      )}
    </form>
  );
}
