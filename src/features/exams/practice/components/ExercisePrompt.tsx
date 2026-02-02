/**
 * ExercisePrompt - Renders exercise question with KaTeX support
 */

import { ContentBlocksRenderer } from '../../rendering/ContentBlocksRenderer';
import { MathText } from '@/components/MathContent';
import type { ExerciseForRunner } from '../types';

interface ExercisePromptProps {
  exercise: ExerciseForRunner;
  className?: string;
}

export function ExercisePrompt({ exercise, className }: ExercisePromptProps) {
  return (
    <div className={`p-4 bg-muted/30 rounded-lg ${className ?? ''}`}>
      {exercise.prompt_blocks && exercise.prompt_blocks.length > 0 ? (
        <ContentBlocksRenderer blocks={exercise.prompt_blocks} />
      ) : (
        <MathText text={exercise.question_text} />
      )}
    </div>
  );
}
