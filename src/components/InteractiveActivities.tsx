import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface InteractiveActivitiesProps {
  content: string;
  isLoading: boolean;
  onRegenerate?: () => void;
}

export const InteractiveActivities = ({ content, isLoading, onRegenerate }: InteractiveActivitiesProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { playSound } = useSoundEffects();

  // Parse AI-generated content into structured questions
  const parseQuestions = (content: string): Question[] => {
    const questions: Question[] = [];
    
    // Split by exercise headers - more flexible regex
    const sections = content.split(/#{2,3}\s*✏️?\s*Exercice\s+\d+/i);
    
    sections.slice(1).forEach((section) => {
      // Extract question text - everything between difficulty marker and first option
      // More flexible to handle various formats
      const questionMatch = section.match(/\([^)]*(?:Facile|Moyen|Difficile)[^)]*\)\s*\n+\s*(.+?)(?=\n\s*[A-D][\):])/is);
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
            Les activités n'ont pas pu être chargées dans le format interactif. 
            Voici le contenu original:
          </p>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline" className="w-full">
              <ArrowRight className="w-4 h-4 mr-2" />
              Régénérer les activités
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const { toast } = useToast();

  const awardGold = async () => {
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

  const handleAnswerSelect = async (index: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(index);
    setShowFeedback(true);
    
    const isCorrect = index === currentQuestion.correctAnswer;
    playSound(isCorrect ? "correct" : "incorrect");
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      await awardGold();
      toast({
        title: "🎉 +1 Gold!",
        description: "Bonne réponse!",
        duration: 2000,
      });
    }
  };

  const handleNext = () => {
    playSound("next");
    setShowFeedback(false);
    setSelectedAnswer(null);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCompleted(true);
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
      <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-accent/20 to-primary/20 rounded-t-[20px]">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              🎯 Activités Pratiques Interactives
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
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground text-center">Génération d'exercices personnalisés...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji = percentage >= 80 ? "🎉" : percentage >= 60 ? "👏" : "💪";
    
    return (
      <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-success/30 bg-gradient-to-br from-success/10 to-primary/10">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-success/20 to-primary/20 rounded-t-[20px]">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {emoji} Activités Complétées!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-6">
          <div className="space-y-2">
            <div className="text-6xl font-bold text-primary">{percentage}%</div>
            <p className="text-xl font-semibold">
              {score} / {questions.length} bonnes réponses
            </p>
          </div>
          
          <div className="p-6 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg border-2 border-success/30">
            {percentage >= 80 ? (
              <p className="text-lg">
                <span className="font-bold text-success">Excellent!</span> Tu maîtrises le sujet!
              </p>
            ) : percentage >= 60 ? (
              <p className="text-lg">
                <span className="font-bold text-primary">Bien!</span> Continue à pratiquer.
              </p>
            ) : (
              <p className="text-lg">
                <span className="font-bold text-orange-600">Continue d'essayer!</span> Révise la leçon.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleRestart} 
              size="lg"
              variant="outline"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Recommencer
            </Button>
            {onRegenerate && (
              <Button 
                onClick={onRegenerate} 
                size="lg"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Nouvelles activités
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-accent/20 to-primary/20 rounded-t-[20px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              🎯 Activité {currentQuestionIndex + 1} sur {questions.length}
            </CardTitle>
            {onRegenerate && (
              <Button onClick={onRegenerate} variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4 mr-2" />
                Régénérer
              </Button>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Question */}
        <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/20">
          <p className="text-lg font-medium leading-relaxed">
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
                  <span className="flex-1">{option}</span>
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
              {selectedAnswer === currentQuestion.correctAnswer ? '✅ Correct!' : '📚 Explications:'}
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
              <>Voir les résultats <CheckCircle className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        )}

        {/* Original Content (collapsed) */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            Voir tous les exercices
          </summary>
          <div className="mt-4 prose prose-sm max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </details>
      </CardContent>
    </Card>
  );
};
