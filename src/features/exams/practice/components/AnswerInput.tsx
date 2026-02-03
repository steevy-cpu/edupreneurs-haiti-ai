/**
 * AnswerInput - Orchestrator Component
 * Detects question type and routes to appropriate input component
 */

import { detectQuestionType } from '../utils/detectQuestionType';
import { MCQInput, ShortInput, MatchingInput, EssayInput } from './inputs';
import type { ExerciseForRunner, RunnerState } from '../types';

interface AnswerInputProps {
  exercise: ExerciseForRunner;
  selectedAnswer: string | null;
  onSelect: (answer: string, type?: 'mcq' | 'short' | 'matching' | 'essay') => void;
  state: RunnerState;
  correctAnswer?: string | null;
}

export function AnswerInput(props: AnswerInputProps) {
  const questionType = detectQuestionType(props.exercise);

  switch (questionType) {
    case 'mcq':
      return <MCQInput {...props} />;
    case 'matching':
      return <MatchingInput {...props} />;
    case 'essay':
      return <EssayInput {...props} />;
    case 'short':
    default:
      return <ShortInput {...props} />;
  }
}
