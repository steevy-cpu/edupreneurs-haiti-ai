import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, ArrowRight, Trophy, Loader2, RefreshCw } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface InteractiveQuizProps {
  content: string;
  isLoading: boolean;
  onRegenerate?: () => void;
  lessonGoldReward?: number;
}

export const InteractiveQuiz = ({ content, isLoading, onRegenerate, lessonGoldReward = 100 }: InteractiveQuizProps) => {
  const { topicId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const { playSound } = useSoundEffects();
  const { toast } = useToast();

  // Check if lesson is already completed
  useEffect(() => {
    const checkCompletion = async () => {
      if (!topicId) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('lesson_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_slug', topicId)
        .eq('subject', 'mathematiques')
        .maybeSingle();

      if (data) {
        setIsLessonCompleted(true);
      }
    };

    checkCompletion();
  }, [topicId]);

  const awardGold = async () => {
    // Don't award gold if lesson is already completed
    if (isLessonCompleted) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch current gold
      const { data: profile } = await supabase
        .from('profiles')
        .select('gold_earned')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ gold_earned: (profile.gold_earned || 0) + 1 })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error awarding gold:', error);
    }
  };

  const parseQuestions = (content: string): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    
    // Split by question headers - more flexible regex
    const sections = content.split(/#{2,3}\s*✅?\s*Question\s+\d+/i);
    
    sections.slice(1).forEach((section) => {
      // Extract question text - everything before first option, more flexible
      const questionMatch = section.match(/^\s*(.+?)(?=\n\s*[A-D][\):])/is);
      if (!questionMatch) return;
      
      const questionText = questionMatch[1].trim().replace(/\*\*/g, '');
      
      // Extract options - handle both A) and A: formats
      const optionMatches = section.matchAll(/([A-D])[\):]\s*(.+?)(?=\n\s*[A-D][\):]|\n\s*#{2,3}|\n\n|$)/gis);
      const options: string[] = [];
      Array.from(optionMatches).forEach(match => {
        const optionText = match[2].trim().replace(/\*\*/g, '');
        if (optionText) {
          options.push(optionText);
        }
      });
      
      // Extract correct answer - more flexible
      const correctMatch = section.match(/#{2,3}\s*Réponse\s+correcte\s*:?\s*([A-D])/i);
      if (!correctMatch || options.length !== 4) return;
      
      const correctLetter = correctMatch[1].toUpperCase();
      const correctIndex = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
      
      // Extract explanation - handle various formats
      const explanationMatch = section.match(/#{2,3}\s*Explication\s*:?\s*\n?\s*(.+?)(?=#{2,3}|$)/is);
      const explanation = explanationMatch ? explanationMatch[1].trim().replace(/\*\*/g, '') : "";
      
      // Only add if we have complete valid data
      if (questionText && options.length === 4 && correctIndex >= 0 && correctIndex < 4 && explanation) {
        questions.push({
          question: questionText,
          options,
          correctAnswer: correctIndex,
          explanation
        });
      }
    });
    
    return questions;
  };

  const questions = parseQuestions(content);
  
  // Show error if no questions were parsed
  if (!isLoading && questions.length === 0 && content) {
    return (
      <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-900/40 dark:to-red-900/40 rounded-t-[20px]">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            ⚠️ Problème de format
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Le quiz n'a pas pu être chargé dans le format interactif. 
            Voici le contenu original:
          </p>
          <div className="prose prose-sm max-w-none dark:prose-invert overflow-x-hidden">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline" className="w-full">
              <ArrowRight className="w-4 h-4 mr-2" />
              Régénérer le quiz
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Check if we have valid questions
  if (questions.length === 0) {
    return (
      <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/30">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-amber-100/50 to-orange-100/50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-t-[20px]">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              ⚠️ Quiz non disponible
            </CardTitle>
            {onRegenerate && (
              <Button onClick={onRegenerate} variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4 mr-2" />
                Régénérer
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
            <p className="text-muted-foreground">
              Le quiz n'a pas pu être généré. Veuillez cliquer sur "Régénérer" pour réessayer.
            </p>
            {onRegenerate && (
              <Button onClick={onRegenerate} size="lg" className="mt-4">
                <ArrowRight className="w-4 h-4 mr-2" />
                Régénérer le Quiz
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Safety check for currentQuestion
  if (!currentQuestion) {
    return (
      <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-red-500/30">
        <CardContent className="p-4 sm:p-6">
          <p className="text-center text-muted-foreground">Erreur: Question introuvable</p>
        </CardContent>
      </Card>
    );
  }

  const handleAnswerSelect = async (index: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(index);
    setShowFeedback(true);
    
    const isCorrect = index === currentQuestion.correctAnswer;
    playSound(isCorrect ? "correct" : "incorrect");
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      
      if (!isLessonCompleted) {
        await awardGold();
        toast({
          title: "🎉 +1 Gold!",
          description: "Bonne réponse!",
          duration: 2000,
        });
      } else {
        toast({
          title: "✅ Bonne réponse!",
          description: "Leçon déjà complétée - pas de points supplémentaires",
          duration: 2000,
        });
      }
    }
  };

  const markLessonComplete = async (finalScore: number, totalQuestions: number) => {
    if (!topicId || isLessonCompleted) return;
    
    const percentage = Math.round((finalScore / totalQuestions) * 100);
    
    // Only mark as complete if 80% or higher
    if (percentage < 80) return;
    
    setIsMarkingComplete(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark lesson as complete
      await supabase
        .from('lesson_completions')
        .upsert({
          user_id: user.id,
          lesson_slug: topicId,
          subject: 'mathematiques',
          score: percentage,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_slug'
        });

      setIsLessonCompleted(true);

      // Award completion gold only if not already completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('gold_earned')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ gold_earned: (profile.gold_earned || 0) + lessonGoldReward })
          .eq('user_id', user.id);

        toast({
          title: "🎉 Leçon complétée!",
          description: `Tu as gagné ${lessonGoldReward} gold!`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handleNext = async () => {
    playSound("next");
    setShowFeedback(false);
    setSelectedAnswer(null);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCompleted(true);
      // Mark lesson complete when quiz is finished
      await markLessonComplete(score, questions.length);
    }
  };

  const handleRestart = () => {
    playSound("next");
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setCompleted(false);
  };

  if (isLoading) {
    return (
      <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-success/5">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/20 to-success/20 rounded-t-[20px]">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              🏆 Quiz d'Évaluation Final
            </CardTitle>
            {onRegenerate && (
              <Button 
                onClick={onRegenerate} 
                variant="outline" 
                size="sm"
                className="gap-2 bg-gradient-to-r from-accent/10 to-primary/10 hover:from-accent/20 hover:to-primary/20 border-accent/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Régénérer</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-6">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground text-center">Génération du quiz d'évaluation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    const passGrade = percentage >= 80;
    
    return (
      <Card className={`
        lesson-card border-none rounded-[20px] shadow-lg border-2
        ${passGrade 
          ? 'border-success/40 bg-gradient-to-br from-success/20 to-primary/20' 
          : 'border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30'
        }
      `}>
        <CardHeader className={`
          p-4 sm:p-6 rounded-t-[20px]
          ${passGrade 
            ? 'bg-gradient-to-r from-success/30 to-primary/30' 
            : 'bg-gradient-to-r from-orange-200 to-yellow-200 dark:from-orange-900/40 dark:to-yellow-900/40'
          }
        `}>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {passGrade ? '🎉' : '📚'} Quiz Complété!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-6">
          <div className="relative">
            <Trophy className={`
              w-24 h-24 mx-auto mb-4
              ${passGrade ? 'text-success animate-bounce' : 'text-orange-500'}
            `} />
            <div className="text-6xl font-bold text-primary mb-2">{percentage}%</div>
            <p className="text-xl font-semibold">
              {score} / {questions.length} bonnes réponses
            </p>
            {isLessonCompleted && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                ✅ Cette leçon est déjà complétée
              </p>
            )}
          </div>
          
          <div className={`
            p-6 rounded-lg border-2
            ${passGrade 
              ? 'bg-gradient-to-r from-success/20 to-primary/20 border-success/40' 
              : 'bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 border-orange-300 dark:border-orange-700'
            }
          `}>
            {passGrade ? (
              <>
                <p className="text-xl font-bold text-success mb-2">
                  🌟 Félicitations! Tu as réussi l'examen!
                </p>
                <p className="mt-3 text-sm">
                  Leçon marquée comme complétée! +{lessonGoldReward} gold
                </p>
                {isMarkingComplete && (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mt-2" />
                )}
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-orange-700 dark:text-orange-400 mb-2">
                  💪 Ne te décourage pas! Révise et réessaie!
                </p>
                <p className="mt-3 text-sm">
                  Tu as besoin d'au moins 80% pour passer et compléter la leçon.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleRestart} 
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Recommencer
            </Button>
            {onRegenerate && (
              <Button 
                onClick={onRegenerate} 
                variant="outline"
                size="lg"
                className="gap-2 bg-gradient-to-r from-accent/10 to-primary/10 hover:from-accent/20 hover:to-primary/20 border-accent/30"
              >
                <RefreshCw className="w-4 h-4" />
                Régénérer le quiz
              </Button>
            )}
            {passGrade && (
              <Button 
                size="lg"
                onClick={() => window.location.href = '/math-course'}
                className="gap-2 bg-gradient-to-r from-success to-primary hover:from-success/90 hover:to-primary/90"
              >
                <Trophy className="w-4 h-4" />
                Retour aux leçons
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-success/5">
      <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/20 to-success/20 rounded-t-[20px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <span>🏆 Quiz Final — Question {currentQuestionIndex + 1}/{questions.length}</span>
              <Trophy className="text-primary w-6 h-6" />
            </CardTitle>
            {onRegenerate && (
              <Button 
                onClick={onRegenerate} 
                variant="outline" 
                size="sm"
                className="gap-2 bg-gradient-to-r from-accent/10 to-primary/10 hover:from-accent/20 hover:to-primary/20 border-accent/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Régénérer</span>
              </Button>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Question */}
        <div className="p-6 bg-gradient-to-r from-primary/10 to-success/10 rounded-lg border-2 border-primary/30">
          <p className="text-lg font-medium leading-relaxed break-words">
            {currentQuestion.question}
          </p>
        </div>

        {/* Options */}
        <div className="grid gap-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showCorrect = showFeedback && isCorrect;
            const showIncorrect = showFeedback && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
                className={`
                  p-4 rounded-xl border-2 text-left transition-all duration-300
                  ${!showFeedback ? 'hover:border-primary hover:bg-primary/5 hover:scale-[1.02]' : ''}
                  ${isSelected && !showFeedback ? 'border-primary bg-primary/10' : 'border-muted'}
                  ${showCorrect ? 'border-success bg-success/10 animate-scale-in' : ''}
                  ${showIncorrect ? 'border-destructive bg-destructive/10 animate-scale-in' : ''}
                  ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold
                    ${showCorrect ? 'bg-success text-success-foreground' : ''}
                    ${showIncorrect ? 'bg-destructive text-destructive-foreground' : ''}
                    ${!showFeedback ? 'bg-muted' : ''}
                  `}>
                    {showCorrect && <CheckCircle className="w-5 h-5" />}
                    {showIncorrect && <XCircle className="w-5 h-5" />}
                    {!showFeedback && String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 break-words">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`
            p-6 rounded-lg border-2 animate-fade-in
            ${selectedAnswer === currentQuestion.correctAnswer 
              ? 'bg-success/10 border-success' 
              : 'bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-700'
            }
          `}>
            <p className="font-semibold mb-2">
              {selectedAnswer === currentQuestion.correctAnswer ? '✅ Excellent!' : '❌ Incorrect'}
            </p>
            <p className="text-sm leading-relaxed">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Next Button */}
        {showFeedback && (
          <Button 
            onClick={handleNext}
            size="lg"
            className="w-full animate-fade-in"
          >
            {currentQuestionIndex < questions.length - 1 ? (
              <>Question suivante <ArrowRight className="w-4 h-4 ml-2" /></>
            ) : (
              <>Terminer le quiz <CheckCircle className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        )}

        {/* Original Content (collapsed) */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            Voir le contenu complet
          </summary>
          <div className="mt-4 prose prose-sm max-w-none dark:prose-invert overflow-x-hidden">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </details>
      </CardContent>
    </Card>
  );
};
