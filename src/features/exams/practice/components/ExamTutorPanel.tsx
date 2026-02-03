/**
 * ExamTutorPanel - Main Question Runner UI
 * Replaces chat-first with quiz-first experience
 */

import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExerciseHeader } from './ExerciseHeader';
import { ExercisePrompt } from './ExercisePrompt';
import { AnswerInput } from './AnswerInput';
import { FeedbackCard } from './FeedbackCard';
import { ActionRow } from './ActionRow';
import { AskJudeDrawer } from './AskJudeDrawer';
import { useTutorAction } from '../hooks/useTutorAction';
import type { ExerciseForRunner, SessionForRunner, ReferenceText } from '../types';

interface ExamTutorPanelProps {
  exercise: ExerciseForRunner;
  session: SessionForRunner;
  referenceTexts?: ReferenceText[];
  onNext: () => void;
  onPrevious?: () => void;
  onAnswerValidated?: (isCorrect: boolean, points: number) => void;
}

export function ExamTutorPanel({
  exercise,
  session,
  referenceTexts = [],
  onNext,
  onPrevious,
  onAnswerValidated,
}: ExamTutorPanelProps) {
  const {
    state,
    feedback,
    hintLevel,
    selectedAnswer,
    checkAnswer,
    requestHint,
    revealAnswer,
    askJude,
    reset,
  } = useTutorAction({
    sessionId: session.id,
    exerciseId: exercise.id,
    exercise,
    referenceTexts,
    onAnswerValidated,
  });

  // Reset state when exercise changes
  useEffect(() => {
    reset();
  }, [exercise.id, reset]);

  const canAdvance = state === 'correct' || state === 'incorrect' || state === 'revealed';
  const canGoPrevious = session.current_exercise > 1;
  const isLoading = state === 'checking';

  // Handle next with delay for correct answers
  const handleNext = () => {
    onNext();
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border-2 border-primary/20">
      {/* Header */}
      <ExerciseHeader
        number={exercise.exercise_number}
        total={session.totalExercises}
        concept={exercise.concept}
        points={exercise.points}
      />

      {/* Scrollable content area */}
      <ScrollArea className="flex-1 p-4 min-h-0">
        <div className="space-y-4">
          {/* Question prompt */}
          <ExercisePrompt exercise={exercise} />

          {/* Answer input (MCQ or short answer) */}
          <AnswerInput
            exercise={exercise}
            selectedAnswer={selectedAnswer}
            onSelect={checkAnswer}
            state={state}
            correctAnswer={feedback?.grading?.correctAnswer || exercise.correct_answer}
          />

          {/* Feedback card (when available) */}
          {feedback && (
            <FeedbackCard feedback={feedback} state={state} />
          )}

          {/* Ask Jude drawer trigger */}
          <AskJudeDrawer exercise={exercise} sessionId={session.id} onAskJude={askJude} />
        </div>
      </ScrollArea>

      {/* Action buttons */}
      <ActionRow
        hintLevel={hintLevel}
        onHint={requestHint}
        onReveal={revealAnswer}
        onNext={handleNext}
        onPrevious={onPrevious}
        canAdvance={canAdvance}
        canGoPrevious={canGoPrevious}
        isLoading={isLoading}
        state={state}
      />
    </Card>
  );
}
