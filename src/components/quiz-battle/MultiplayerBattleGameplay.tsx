import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, CheckCircle2, XCircle, Zap, Volume2, VolumeX, StopCircle, Loader2, Trophy, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuizBattleSounds } from '@/hooks/useQuizBattleSounds';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { BattleQuestion, BattleResult } from '@/pages/QuizBattleSolo';

interface MultiplayerBattleGameplayProps {
  battleId: string;
  questions: BattleQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  userId: string;
  opponent: { id: string; nickname: string; avatar_url: string | null };
  onComplete: (result: BattleResult) => void;
}

interface RoundAnswer {
  question_index: number;
  answers: Array<{
    user_id: string;
    answer: number;
    correct: boolean;
    answered_at: string;
  }>;
  winner_id: string | null;
}

const DIFFICULTY_TIME = {
  easy: 30,
  medium: 20,
  hard: 15,
};

export const MultiplayerBattleGameplay = ({
  battleId,
  questions,
  difficulty,
  userId,
  opponent,
  onComplete,
}: MultiplayerBattleGameplayProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_TIME[difficulty]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<BattleResult['answers']>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [myRoundsWon, setMyRoundsWon] = useState(0);
  const [opponentRoundsWon, setOpponentRoundsWon] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [opponentAbandoned, setOpponentAbandoned] = useState(false);
  const hasPlayedGameStart = useRef(false);
  const processedRound = useRef<number>(-1);
  const gameEnded = useRef(false);
  
  // Refs for fresh state access in realtime callbacks
  const answersRef = useRef(answers);
  const myRoundsWonRef = useRef(myRoundsWon);
  const opponentRoundsWonRef = useRef(opponentRoundsWon);
  
  // Keep refs updated
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { myRoundsWonRef.current = myRoundsWon; }, [myRoundsWon]);
  useEffect(() => { opponentRoundsWonRef.current = opponentRoundsWon; }, [opponentRoundsWon]);

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

  // Subscribe to battle updates for synchronized question advancement AND opponent abandonment
  useRealtimeSubscription({
    table: 'quiz_battles',
    event: 'UPDATE',
    filter: `id=eq.${battleId}`,
    callback: async (payload) => {
      const battle = payload.new as any;
      
      // Check if battle was cancelled (opponent abandoned)
      if (battle.status === 'cancelled' && !gameEnded.current) {
        // Verify this isn't a false positive by checking the database directly
        const { data: verifyBattle } = await supabase
          .from('quiz_battles')
          .select('status')
          .eq('id', battleId)
          .single();
        
        if (verifyBattle?.status !== 'cancelled') {
          console.log('[MultiplayerGameplay] False positive cancelled event, ignoring');
          return;
        }
        
        console.log('[MultiplayerGameplay] Battle cancelled verified - opponent abandoned');
        gameEnded.current = true;
        setOpponentAbandoned(true);
        stopTicking();
        
        // Delay to show overlay, then complete game with current progress
        setTimeout(() => {
          const currentAnswers = answersRef.current;
          const correctCount = currentAnswers.filter((a) => a.correct).length;
          let xp = correctCount * 10;
          xp += Math.round(currentAnswers.filter(a => a.correct && a.timeMs < 5000).length * 5);
          xp += 5; // Participation bonus
          
          onComplete({
            score: currentAnswers.length > 0 ? Math.round((correctCount / currentAnswers.length) * 100) : 0,
            totalQuestions: questions.length,
            correctAnswers: correctCount,
            xpEarned: xp,
            timeBonus: 0,
            answers: currentAnswers,
            questions,
            isPerfect: false,
            roundsWon: myRoundsWonRef.current,
            opponentRoundsWon: opponentRoundsWonRef.current,
            opponentAbandoned: true,
          });
        }, 2500);
        return;
      }
      
      const newIndex = battle.current_question_index;
      
      // Only process if we haven't already and round advanced
      if (newIndex > processedRound.current && newIndex > currentIndex) {
        console.log('[MultiplayerGameplay] Realtime: advancing to question', newIndex);
        processedRound.current = newIndex;
        
        // Parse round_answers to update scores
        const roundAnswers: RoundAnswer[] = battle.round_answers || [];
        const lastRound = roundAnswers[currentIndex];
        
        if (lastRound && lastRound.winner_id) {
          if (lastRound.winner_id === opponent.id) {
            setOpponentRoundsWon((prev) => prev + 1);
          }
          // My rounds are already handled in handleAnswer callback
        }
        
        // Move to next question
        if (newIndex < questions.length) {
          moveToNextQuestion(newIndex);
        } else {
          // Game complete
          finishGame();
        }
      }
    },
    enabled: !!battleId,
  });

  // Play game start sound once
  useEffect(() => {
    if (!hasPlayedGameStart.current) {
      playGameStart();
      hasPlayedGameStart.current = true;
    }
  }, [playGameStart]);

  // Timer effect with ticking sound
  useEffect(() => {
    if (showFeedback || waitingForOpponent) {
      stopTicking();
      return;
    }

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
  }, [currentIndex, showFeedback, waitingForOpponent, timeLeft, maxTime, startTickingTimer, stopTicking]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(maxTime);
    setQuestionStartTime(Date.now());
    setSelectedAnswer(null);
    setShowFeedback(false);
    setWaitingForOpponent(false);
    setRoundWinner(null);

    if (currentIndex > 0) {
      playQuestionStart();
    }
  }, [currentIndex, maxTime, playQuestionStart]);

  const moveToNextQuestion = useCallback((nextIndex: number) => {
    setCurrentIndex(nextIndex);
    setTimeLeft(maxTime);
    setQuestionStartTime(Date.now());
    setSelectedAnswer(null);
    setShowFeedback(false);
    setWaitingForOpponent(false);
    setRoundWinner(null);
    playQuestionStart();
  }, [maxTime, playQuestionStart]);

  const finishGame = useCallback(async () => {
    const correctCount = answers.filter((a) => a.correct).length;
    
    playGameComplete();
    
    // Fetch authoritative round_answers from database
    const { data: battle } = await supabase
      .from('quiz_battles')
      .select('round_answers')
      .eq('id', battleId)
      .single();
    
    // Compute actual rounds won from server data
    let serverMyRoundsWon = 0;
    let serverOpponentRoundsWon = 0;
    
    if (battle?.round_answers && Array.isArray(battle.round_answers)) {
      const roundAnswers = battle.round_answers as unknown as RoundAnswer[];
      for (const round of roundAnswers) {
        if (round && round.winner_id === userId) {
          serverMyRoundsWon++;
        } else if (round && round.winner_id === opponent.id) {
          serverOpponentRoundsWon++;
        }
      }
    }
    
    console.log('[MultiplayerGameplay] Final scores from server:', {
      myRounds: serverMyRoundsWon,
      opponentRounds: serverOpponentRoundsWon,
      localMyRounds: myRoundsWon,
      localOpponentRounds: opponentRoundsWon
    });
    
    let xp = correctCount * 10;
    const timeBonus = Math.round(answers.filter(a => a.correct && a.timeMs < 5000).length * 5);
    xp += timeBonus;
    
    if (correctCount === questions.length) {
      xp += 20;
    }
    xp += 5;

    onComplete({
      score: Math.round((correctCount / questions.length) * 100),
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      xpEarned: xp,
      timeBonus,
      answers,
      questions,
      isPerfect: correctCount === questions.length,
      roundsWon: serverMyRoundsWon,
      opponentRoundsWon: serverOpponentRoundsWon,
    });
  }, [answers, questions, battleId, userId, opponent.id, myRoundsWon, opponentRoundsWon, onComplete, playGameComplete]);

  const handleAnswer = useCallback(async (answerIndex: number) => {
    if (showFeedback || waitingForOpponent || submitting) return;

    stopTicking();
    setSubmitting(true);

    const timeMs = Date.now() - questionStartTime;
    const isCorrect = answerIndex === currentQuestion.correct_answer;

    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

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

    try {
      // Call atomic answer submission RPC
      const { data, error } = await supabase.rpc('submit_multiplayer_answer', {
        p_battle_id: battleId,
        p_user_id: userId,
        p_question_index: currentIndex,
        p_answer: answerIndex,
        p_is_correct: isCorrect,
      });

      if (error) {
        console.error('[MultiplayerGameplay] RPC error:', error);
        setSubmitting(false);
        return;
      }

      // Type assertion for the RPC result
      const result = data as {
        status: string;
        round_winner: string | null;
        should_advance: boolean;
        new_question_index: number;
        my_answer_correct: boolean;
        current_index?: number;
      };

      console.log('[MultiplayerGameplay] Answer result:', result);

      if (result.status === 'round_complete') {
        // Round finished - show who won
        setRoundWinner(result.round_winner);
        
        if (result.round_winner === userId) {
          setMyRoundsWon((prev) => prev + 1);
        } else if (result.round_winner === opponent.id) {
          setOpponentRoundsWon((prev) => prev + 1);
        }
        
        processedRound.current = result.new_question_index;
        
        // Wait for feedback display, then advance
        setTimeout(() => {
          if (result.new_question_index < questions.length) {
            moveToNextQuestion(result.new_question_index);
          } else {
            finishGame();
          }
          setSubmitting(false);
        }, 2000);
      } else if (result.status === 'waiting_opponent') {
        // I answered wrong first, waiting for opponent
        setWaitingForOpponent(true);
        setSubmitting(false);
      } else if (result.status === 'already_advanced') {
        // Question already completed, move on
        const currentIdx = result.current_index ?? result.new_question_index;
        if (currentIdx < questions.length) {
          moveToNextQuestion(currentIdx);
        } else {
          finishGame();
        }
        setSubmitting(false);
      } else {
        setSubmitting(false);
      }
    } catch (err) {
      console.error('[MultiplayerGameplay] Error submitting answer:', err);
      setSubmitting(false);
    }
  }, [
    currentIndex, currentQuestion, battleId, userId, opponent.id, questions,
    showFeedback, waitingForOpponent, submitting, questionStartTime,
    stopTicking, playCorrect, playIncorrect, moveToNextQuestion, finishGame
  ]);

  const handleStop = () => {
    stopTicking();
    setShowStopDialog(true);
  };

  const confirmStop = () => {
    const correctCount = answers.filter((a) => a.correct).length;
    onComplete({
      score: answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      xpEarned: 0,
      timeBonus: 0,
      answers,
      questions,
      isPerfect: false,
      wasAbandoned: true,
      roundsWon: myRoundsWon,
      opponentRoundsWon: opponentRoundsWon,
    });
  };

  const cancelStop = () => {
    setShowStopDialog(false);
    startTickingTimer(timeLeft, maxTime);
  };

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
    <div className="space-y-3 sm:space-y-4">
      {/* Live Score Header */}
      <Card className="border-2 border-accent/30 bg-accent/5">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">Toi: {myRoundsWon}</span>
            </div>
            <Swords className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{opponentRoundsWon} :{opponent.nickname}</span>
              <Avatar className="h-6 w-6">
                <AvatarImage src={opponent.avatar_url || undefined} />
                <AvatarFallback className="text-xs">{opponent.nickname?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
          {currentIndex + 1}/{questions.length}
        </span>
        <Progress value={progressPercent} className="flex-1 h-1.5 sm:h-2" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleStop}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Arrêter le quiz"
        >
          <StopCircle className="w-4 h-4" />
        </Button>
        
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Clock className={cn(
            "w-4 h-4 sm:w-5 sm:h-5",
            timeLeft <= 5 ? "text-destructive animate-pulse" : "text-muted-foreground"
          )} />
          <span className={cn(
            "font-mono font-bold text-base sm:text-lg",
            timeLeft <= 5 ? "text-destructive" : "text-foreground"
          )}>
            {timeLeft}s
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
          <span className="text-xs sm:text-sm text-muted-foreground">
            {answers.filter(a => a.correct).length} correct
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
        <CardContent className="p-4 sm:p-6">
          <div className="mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs text-muted-foreground bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              {currentQuestion.concept}
            </span>
          </div>
          
          <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-4 sm:mb-6 leading-snug">
            {currentQuestion.question}
          </h2>

          <div className="space-y-2 sm:space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showFeedback || waitingForOpponent || submitting}
                className={cn(
                  "w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 text-left transition-all",
                  "flex items-center gap-2 sm:gap-3 min-h-[48px]",
                  getOptionStyle(index),
                  (waitingForOpponent || submitting) && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 font-medium text-xs sm:text-sm shrink-0",
                  showFeedback && index === currentQuestion.correct_answer
                    ? "border-success bg-success text-success-foreground"
                    : showFeedback && index === selectedAnswer
                    ? "border-destructive bg-destructive text-destructive-foreground"
                    : "border-current"
                )}>
                  {showFeedback && index === currentQuestion.correct_answer ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : showFeedback && index === selectedAnswer ? (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </span>
                <span className="flex-1 text-sm sm:text-base">{option}</span>
              </button>
            ))}
          </div>

          {/* Waiting for opponent feedback */}
          {waitingForOpponent && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">En attente de {opponent.nickname}...</p>
                  <p className="text-xs text-muted-foreground">Peut encore gagner cette manche!</p>
                </div>
              </div>
            </div>
          )}

          {/* Round winner feedback */}
          {showFeedback && roundWinner && !waitingForOpponent && (
            <div className={cn(
              "mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg",
              roundWinner === userId
                ? "bg-success/10 border border-success/30"
                : "bg-destructive/10 border border-destructive/30"
            )}>
              <p className={cn(
                "font-medium text-sm sm:text-base",
                roundWinner === userId ? "text-success" : "text-destructive"
              )}>
                {roundWinner === userId ? '🎉 Tu as gagné cette manche!' : `❌ ${opponent.nickname} a gagné cette manche`}
              </p>
              {currentQuestion.explanation && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {currentQuestion.explanation}
                </p>
              )}
            </div>
          )}

          {/* No winner feedback (both wrong) */}
          {showFeedback && !roundWinner && !waitingForOpponent && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-muted border border-border">
              <p className="font-medium text-sm sm:text-base text-muted-foreground">
                🤷 Aucun gagnant pour cette manche
              </p>
              {currentQuestion.explanation && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {currentQuestion.explanation}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opponent Abandoned Overlay */}
      {opponentAbandoned && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Card className="max-w-sm mx-4 border-2 border-success">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Victoire par abandon!</h3>
              <p className="text-muted-foreground">
                {opponent.nickname} a quitté la partie. Tu gagnes automatiquement!
              </p>
              <Loader2 className="w-6 h-6 animate-spin mx-auto mt-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stop Confirmation Dialog */}
      <AlertDialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Arrêter le quiz?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Tu as répondu à {answers.length} question(s) sur {questions.length}.
              </span>
              <span className="block font-medium text-destructive">
                ⚠️ Si tu arrêtes maintenant, tu ne gagneras aucun XP ni crédit.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={cancelStop} className="w-full sm:w-auto">
              Continuer le quiz
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmStop} 
              className="w-full sm:w-auto bg-destructive hover:bg-destructive/90"
            >
              Oui, arrêter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
