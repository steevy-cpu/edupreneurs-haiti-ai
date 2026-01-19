import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, XCircle, Zap, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuizBattleSounds } from '@/hooks/useQuizBattleSounds';
import type { BattleQuestion, BattleResult } from '@/pages/QuizBattleSolo';

interface BattleGameplayProps {
  questions: BattleQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (result: BattleResult) => void;
}

const DIFFICULTY_TIME = {
  easy: 30,
  medium: 20,
  hard: 15,
};

export const BattleGameplay = ({ questions, difficulty, onComplete }: BattleGameplayProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_TIME[difficulty]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<BattleResult['answers']>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const hasPlayedGameStart = useRef(false);

  const {
    playCorrect,
    playIncorrect,
    playQuestionStart,
    playGameStart,
    playGameComplete,
    startTickingTimer,
    stopTicking,
    isMuted,
    toggleMute,
  } = useQuizBattleSounds();

  const currentQuestion = questions[currentIndex];
  const maxTime = DIFFICULTY_TIME[difficulty];

  // Play game start sound once
  useEffect(() => {
    if (!hasPlayedGameStart.current) {
      playGameStart();
      hasPlayedGameStart.current = true;
    }
  }, [playGameStart]);

  // Timer effect with ticking sound
  useEffect(() => {
    if (showFeedback) {
      stopTicking();
      return;
    }

    // Start/update ticking based on time left
    startTickingTimer(timeLeft, maxTime);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto-submit wrong answer
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [currentIndex, showFeedback, timeLeft, maxTime, startTickingTimer, stopTicking]);

  // Reset timer and play question start sound when question changes
  useEffect(() => {
    setTimeLeft(maxTime);
    setQuestionStartTime(Date.now());
    setSelectedAnswer(null);
    setShowFeedback(false);
    
    // Play question start sound (skip for first question since game start plays)
    if (currentIndex > 0) {
      playQuestionStart();
    }
  }, [currentIndex, maxTime, playQuestionStart]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (showFeedback) return;

    // Stop ticking immediately
    stopTicking();

    const timeMs = Date.now() - questionStartTime;
    const isCorrect = answerIndex === currentQuestion.correct_answer;

    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    // Play appropriate sound
    if (isCorrect) {
      playCorrect();
    } else {
      playIncorrect();
    }

    const newAnswer = {
      questionIndex: currentIndex,
      selectedAnswer: answerIndex,
      correct: isCorrect,
      timeMs,
    };

    setAnswers((prev) => [...prev, newAnswer]);

    // Wait for feedback, then move to next question
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Game complete
        const allAnswers = [...answers, newAnswer];
        const correctCount = allAnswers.filter((a) => a.correct).length;
        const avgTime = allAnswers.reduce((sum, a) => sum + a.timeMs, 0) / allAnswers.length;
        
        // Play game complete sound
        playGameComplete();
        
        // Calculate XP
        let xp = correctCount * 10; // Base XP per correct answer
        const timeBonus = Math.round(allAnswers.filter(a => a.correct && a.timeMs < 5000).length * 5);
        xp += timeBonus;
        
        // Perfect game bonus
        if (correctCount === questions.length) {
          xp += 20;
        }

        // First quiz of the day bonus (simplified - always add for now)
        xp += 5;

        onComplete({
          score: Math.round((correctCount / questions.length) * 100),
          totalQuestions: questions.length,
          correctAnswers: correctCount,
          xpEarned: xp,
          timeBonus,
          answers: allAnswers,
          questions,
          isPerfect: correctCount === questions.length,
        });
      }
    }, 1500);
  }, [currentIndex, currentQuestion, questions, answers, questionStartTime, showFeedback, onComplete, stopTicking, playCorrect, playIncorrect, playGameComplete]);

  const getOptionStyle = (index: number) => {
    if (!showFeedback) {
      return selectedAnswer === index 
        ? 'border-primary bg-primary/5' 
        : 'border-border hover:border-primary/50 hover:bg-muted/50';
    }

    if (index === currentQuestion.correct_answer) {
      return 'border-success bg-success/10 text-success';
    }

    if (index === selectedAnswer && index !== currentQuestion.correct_answer) {
      return 'border-destructive bg-destructive/10 text-destructive';
    }

    return 'border-border opacity-50';
  };

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const timePercent = (timeLeft / maxTime) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">
          Question {currentIndex + 1}/{questions.length}
        </span>
        <Progress value={progressPercent} className="flex-1 h-2" />
        
        {/* Mute/Unmute Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="h-8 w-8"
          title={isMuted ? "Activer le son" : "Couper le son"}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={cn(
            "w-5 h-5",
            timeLeft <= 5 ? "text-destructive animate-pulse" : "text-muted-foreground"
          )} />
          <span className={cn(
            "font-mono font-bold text-lg",
            timeLeft <= 5 ? "text-destructive" : "text-foreground"
          )}>
            {timeLeft}s
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted-foreground">
            {answers.filter(a => a.correct).length} bonnes réponses
          </span>
        </div>
      </div>

      {/* Time Progress */}
      <Progress 
        value={timePercent} 
        className={cn(
          "h-1",
          timeLeft <= 5 ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"
        )} 
      />

      {/* Question Card */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="mb-2">
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {currentQuestion.concept}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold mb-6">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showFeedback}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                  getOptionStyle(index)
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 font-medium text-sm shrink-0",
                  showFeedback && index === currentQuestion.correct_answer
                    ? "border-success bg-success text-success-foreground"
                    : showFeedback && index === selectedAnswer
                    ? "border-destructive bg-destructive text-destructive-foreground"
                    : "border-current"
                )}>
                  {showFeedback && index === currentQuestion.correct_answer ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : showFeedback && index === selectedAnswer ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            ))}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={cn(
              "mt-6 p-4 rounded-lg",
              selectedAnswer === currentQuestion.correct_answer
                ? "bg-success/10 border border-success/30"
                : "bg-destructive/10 border border-destructive/30"
            )}>
              <p className={cn(
                "font-medium mb-1",
                selectedAnswer === currentQuestion.correct_answer ? "text-success" : "text-destructive"
              )}>
                {selectedAnswer === currentQuestion.correct_answer ? '✓ Correct!' : '✗ Incorrect'}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
