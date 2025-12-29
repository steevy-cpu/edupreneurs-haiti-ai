import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { cn } from "@/lib/utils";

export interface TrueFalseQuestion {
  statement: string;
  isTrue: boolean;
  explanation: string;
}

interface TrueFalseGameProps {
  question: TrueFalseQuestion;
  onAnswer: (isCorrect: boolean) => void;
  showFeedback: boolean;
  selectedAnswer: boolean | null;
  onSelectAnswer: (answer: boolean) => void;
  isLessonCompleted?: boolean;
}

export const TrueFalseGame = ({
  question,
  onAnswer,
  showFeedback,
  selectedAnswer,
  onSelectAnswer,
  isLessonCompleted = false,
}: TrueFalseGameProps) => {
  const { playSound } = useSoundEffects();

  const handleAnswer = (answer: boolean) => {
    if (showFeedback) return;
    
    onSelectAnswer(answer);
    const isCorrect = answer === question.isTrue;
    playSound(isCorrect ? "correct" : "incorrect");
    onAnswer(isCorrect);
  };

  const isCorrectAnswer = selectedAnswer === question.isTrue;

  return (
    <div className="space-y-6">
      {/* Statement */}
      <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/20">
        <p className="text-lg font-medium leading-relaxed">{question.statement}</p>
      </div>

      {/* Answer buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          size="lg"
          className={cn(
            "h-20 text-xl font-bold transition-all duration-300",
            "bg-gradient-to-br hover:scale-[1.02]",
            showFeedback && selectedAnswer === true
              ? isCorrectAnswer
                ? "from-green-500/20 to-green-600/20 border-green-500 text-green-700 dark:text-green-400"
                : "from-red-500/20 to-red-600/20 border-red-500 text-red-700 dark:text-red-400"
              : showFeedback && question.isTrue === true
                ? "from-green-500/10 to-green-600/10 border-green-500/50"
                : "from-green-500/5 to-green-600/5 hover:from-green-500/20 hover:to-green-600/20 border-green-500/30 hover:border-green-500"
          )}
          onClick={() => handleAnswer(true)}
          disabled={showFeedback}
        >
          <CheckCircle className={cn(
            "w-6 h-6 mr-2",
            showFeedback && selectedAnswer === true && !isCorrectAnswer
              ? "text-red-500"
              : "text-green-600 dark:text-green-500"
          )} />
          VRAI
        </Button>

        <Button
          variant="outline"
          size="lg"
          className={cn(
            "h-20 text-xl font-bold transition-all duration-300",
            "bg-gradient-to-br hover:scale-[1.02]",
            showFeedback && selectedAnswer === false
              ? isCorrectAnswer
                ? "from-green-500/20 to-green-600/20 border-green-500 text-green-700 dark:text-green-400"
                : "from-red-500/20 to-red-600/20 border-red-500 text-red-700 dark:text-red-400"
              : showFeedback && question.isTrue === false
                ? "from-green-500/10 to-green-600/10 border-green-500/50"
                : "from-red-500/5 to-red-600/5 hover:from-red-500/20 hover:to-red-600/20 border-red-500/30 hover:border-red-500"
          )}
          onClick={() => handleAnswer(false)}
          disabled={showFeedback}
        >
          <XCircle className={cn(
            "w-6 h-6 mr-2",
            showFeedback && selectedAnswer === false && !isCorrectAnswer
              ? "text-red-500"
              : "text-red-600 dark:text-red-500"
          )} />
          FAUX
        </Button>
      </div>

      {/* Feedback */}
      {showFeedback && (
        <Card className={cn(
          "border-2 transition-all duration-300",
          isCorrectAnswer
            ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
            : "border-red-500/50 bg-red-50/50 dark:bg-red-950/20"
        )}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              {isCorrectAnswer ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-700 dark:text-green-400">
                    Bonne réponse!
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-red-700 dark:text-red-400">
                    Mauvaise réponse
                  </span>
                </>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">
                La réponse correcte est: {question.isTrue ? "VRAI" : "FAUX"}
              </span>
            </p>
            
            <div className="pt-2 border-t border-border/50">
              <p className="text-sm font-medium mb-1">Explication:</p>
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
