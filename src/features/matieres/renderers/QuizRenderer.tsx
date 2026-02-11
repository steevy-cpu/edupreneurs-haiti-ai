import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, RotateCcw, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JudeCompletionScreen } from '@/components/jude/JudeCompletionScreen';
import { JudeFeedback } from '@/components/jude/JudeFeedback';
import type { QuizPayload, QuizQuestionMCQ } from '../validation/quiz.schema';

interface QuizRendererProps {
  payload: QuizPayload;
  onComplete?: (score: number, total: number) => void;
  className?: string;
}

interface QuestionState {
  selectedAnswer: number | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
}

export function QuizRenderer({ payload, onComplete, className }: QuizRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    payload.questions.map(() => ({
      selectedAnswer: null,
      isSubmitted: false,
      isCorrect: null,
    }))
  );
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = payload.questions[currentIndex];
  const currentState = questionStates[currentIndex];

  const handleSelectAnswer = useCallback((answerIndex: number) => {
    if (currentState.isSubmitted) return;
    
    setQuestionStates(prev => {
      const newStates = [...prev];
      newStates[currentIndex] = {
        ...newStates[currentIndex],
        selectedAnswer: answerIndex,
      };
      return newStates;
    });
  }, [currentIndex, currentState.isSubmitted]);

  const handleSubmitAnswer = useCallback(() => {
    if (currentState.selectedAnswer === null) return;
    
    const isCorrect = currentState.selectedAnswer === currentQuestion.answerIndex;
    
    setQuestionStates(prev => {
      const newStates = [...prev];
      newStates[currentIndex] = {
        ...newStates[currentIndex],
        isSubmitted: true,
        isCorrect,
      };
      return newStates;
    });
  }, [currentIndex, currentState.selectedAnswer, currentQuestion.answerIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < payload.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
      const correctCount = questionStates.filter(s => s.isCorrect).length;
      onComplete?.(correctCount, payload.questions.length);
    }
  }, [currentIndex, payload.questions.length, questionStates, onComplete]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setQuestionStates(payload.questions.map(() => ({
      selectedAnswer: null,
      isSubmitted: false,
      isCorrect: null,
    })));
    setIsComplete(false);
  }, [payload.questions.length]);

  const correctCount = questionStates.filter(s => s.isCorrect).length;
  const progress = ((currentIndex + 1) / payload.questions.length) * 100;

  if (isComplete) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="pt-6">
          <JudeCompletionScreen score={correctCount} total={payload.questions.length} />
          <div className="flex gap-2 justify-center mt-6">
            <Button onClick={handleRestart} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Recommencer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">
            Question {currentIndex + 1}/{payload.questions.length}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {correctCount} correct{correctCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-lg mb-4">
          {currentQuestion.prompt}
        </CardTitle>
        
        <div className="space-y-2 mb-4">
          {currentQuestion.choices.map((choice, index) => {
            const isSelected = currentState.selectedAnswer === index;
            const isCorrectAnswer = index === currentQuestion.answerIndex;
            const showResult = currentState.isSubmitted;
            
            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={currentState.isSubmitted}
                className={cn(
                  'w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3',
                  !showResult && isSelected && 'border-primary bg-primary/10',
                  !showResult && !isSelected && 'border-border hover:border-primary/50',
                showResult && isCorrectAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100',
                showResult && isSelected && !isCorrectAnswer && 'border-destructive bg-destructive/10 text-destructive',
                  currentState.isSubmitted && 'cursor-default'
                )}
              >
                <span className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium shrink-0',
                  !showResult && isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary',
                  showResult && isCorrectAnswer && 'bg-emerald-500 text-white',
                  showResult && isSelected && !isCorrectAnswer && 'bg-destructive text-destructive-foreground'
                )}>
                  {showResult && isCorrectAnswer ? (
                    <Check className="w-4 h-4" />
                  ) : showResult && isSelected && !isCorrectAnswer ? (
                    <X className="w-4 h-4" />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </span>
                <span className="flex-1">{choice}</span>
              </button>
            );
          })}
        </div>

        {currentState.isSubmitted && (
          <JudeFeedback
            isCorrect={!!currentState.isCorrect}
            explanation={currentQuestion.explanation}
          />
        )}

        <div className="flex justify-end gap-2">
          {!currentState.isSubmitted ? (
            <Button 
              onClick={handleSubmitAnswer}
              disabled={currentState.selectedAnswer === null}
            >
              Valider
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {currentIndex < payload.questions.length - 1 ? (
                <>
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                'Voir les résultats'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
