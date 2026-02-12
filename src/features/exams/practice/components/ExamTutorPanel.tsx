/**
 * ExamTutorPanel - Main Question Runner UI
 * Replaces chat-first with quiz-first experience
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Info } from 'lucide-react';
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

  // Dismissible info banner
  const bannerKey = `exam-info-dismissed-${session.id}`;
  const [showInfoBanner, setShowInfoBanner] = useState(
    () => !sessionStorage.getItem(bannerKey)
  );

  const dismissBanner = () => {
    setShowInfoBanner(false);
    sessionStorage.setItem(bannerKey, '1');
  };

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
          {/* Contextual info banner */}
          {showInfoBanner && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/50 border border-accent text-sm">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
              <p className="flex-1 text-muted-foreground">
                Ces questions sont extraites de l'examen. Réponds à chacune et je te guiderai ! Utilise le bouton <strong>"Demander à Jude"</strong> si tu bloques.
              </p>
              <button onClick={dismissBanner} className="p-0.5 rounded hover:bg-muted flex-shrink-0">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          )}

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
