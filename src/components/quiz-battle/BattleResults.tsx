import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Zap, 
  Clock, 
  RefreshCw, 
  Home, 
  CheckCircle2, 
  XCircle,
  Star,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BattleResult } from '@/pages/QuizBattleSolo';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface BattleResultsProps {
  result: BattleResult;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const BattleResults = ({ result, onPlayAgain, onBackToMenu }: BattleResultsProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreMessage = () => {
    if (result.wasAbandoned) return { text: 'Quiz interrompu', color: 'text-destructive' };
    if (result.score === 100) return { text: 'Parfait! 🎉', color: 'text-success' };
    if (result.score >= 80) return { text: 'Excellent! 🌟', color: 'text-primary' };
    if (result.score >= 60) return { text: 'Bien joué! 👍', color: 'text-accent' };
    if (result.score >= 40) return { text: 'Continue! 💪', color: 'text-secondary' };
    return { text: 'Révise un peu! 📚', color: 'text-muted-foreground' };
  };

  const scoreMessage = getScoreMessage();
  const avgTimeSeconds = Math.round(result.answers.reduce((sum, a) => sum + a.timeMs, 0) / result.answers.length / 1000);

  // Group questions by mastery
  const masteredConcepts = result.questions
    .filter((_, i) => result.answers[i]?.correct)
    .map(q => q.concept);
  
  const toReviewConcepts = result.questions
    .filter((_, i) => !result.answers[i]?.correct)
    .map(q => q.concept);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Abandoned Quiz Warning */}
      {result.wasAbandoned && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 sm:p-4">
          <p className="text-destructive font-medium text-center text-sm sm:text-base">
            ⚠️ Quiz interrompu - Aucun XP ni crédit n'a été attribué
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground text-center mt-1">
            Termine un quiz pour gagner des récompenses!
          </p>
        </div>
      )}

      {/* Main Score Card */}
      <Card className="border-2 overflow-hidden">
        <div className={cn(
          "h-2",
          result.score >= 70 ? "bg-success" : result.score >= 40 ? "bg-accent" : "bg-destructive"
        )} />
        <CardContent className="pt-8 pb-6 text-center">
          <div className="relative inline-block mb-4">
            <div className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-primary/20 to-secondary/20 border-4",
              result.isPerfect ? "border-success" : "border-primary"
            )}>
              <div>
                <div className="text-4xl font-bold text-foreground">{result.score}%</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
            </div>
            {result.isPerfect && (
              <Star className="absolute -top-2 -right-2 w-10 h-10 text-yellow-500 fill-yellow-500 animate-bounce-subtle" />
            )}
          </div>

          <h2 className={cn("text-2xl font-bold mb-2", scoreMessage.color)}>
            {scoreMessage.text}
          </h2>
          <p className="text-muted-foreground">
            {result.correctAnswers} / {result.totalQuestions} bonnes réponses
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 text-center">
          <Trophy className="w-6 h-6 text-accent mx-auto mb-1" />
          <div className="text-xl font-bold text-foreground">+{result.xpEarned}</div>
          <div className="text-xs text-muted-foreground">XP gagnés</div>
        </Card>
        <Card className="p-4 text-center">
          <Target className="w-6 h-6 text-primary mx-auto mb-1" />
          <div className="text-xl font-bold text-foreground">{result.correctAnswers}</div>
          <div className="text-xs text-muted-foreground">Correct</div>
        </Card>
        <Card className="p-4 text-center">
          <Zap className="w-6 h-6 text-secondary mx-auto mb-1" />
          <div className="text-xl font-bold text-foreground">+{result.timeBonus}</div>
          <div className="text-xs text-muted-foreground">Bonus vitesse</div>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
          <div className="text-xl font-bold text-foreground">{avgTimeSeconds}s</div>
          <div className="text-xs text-muted-foreground">Temps moyen</div>
        </Card>
      </div>

      {/* Mastery Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Résumé pédagogique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {masteredConcepts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-success mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium text-sm">Notions maîtrisées</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {[...new Set(masteredConcepts)].map((concept, i) => (
                  <span 
                    key={i}
                    className="text-xs bg-success/10 text-success px-2 py-1 rounded-full"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {toReviewConcepts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-destructive mb-2">
                <XCircle className="w-4 h-4" />
                <span className="font-medium text-sm">À revoir</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {[...new Set(toReviewConcepts)].map((concept, i) => (
                  <span 
                    key={i}
                    className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Review */}
      <Accordion type="single" collapsible>
        <AccordionItem value="details">
          <AccordionTrigger className="text-sm">
            Voir les détails des questions
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {result.questions.map((question, index) => {
                const answer = result.answers[index];
                const isCorrect = answer?.correct;

                return (
                  <Card 
                    key={index}
                    className={cn(
                      "p-3 border-l-4",
                      isCorrect ? "border-l-success" : "border-l-destructive"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">
                          {question.question}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ta réponse: {question.options[answer?.selectedAnswer] || 'Temps écoulé'}
                        </p>
                        {!isCorrect && (
                          <p className="text-xs text-success mt-1">
                            Bonne réponse: {question.options[question.correct_answer]}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {Math.round((answer?.timeMs || 0) / 1000)}s
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onBackToMenu}
        >
          <Home className="w-4 h-4 mr-2" />
          Menu
        </Button>
        <Button
          className="flex-1"
          onClick={onPlayAgain}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Rejouer
        </Button>
      </div>
    </div>
  );
};
