import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface InteractiveActivitiesProps {
  content: string;
  isLoading: boolean;
}

export const InteractiveActivities = ({ content, isLoading }: InteractiveActivitiesProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { playSound } = useSoundEffects();

  // Parse AI-generated content into structured questions
  const parseQuestions = (content: string): Question[] => {
    const questions: Question[] = [];
    
    // Split by exercise headers
    const sections = content.split(/##\s+✏️\s+Exercice\s+\d+/i);
    
    sections.slice(1).forEach((section) => {
      // Extract question text - everything between difficulty and first option
      const questionMatch = section.match(/\([^)]*(?:Facile|Moyen|Difficile)[^)]*\)\s*\n\s*(.+?)(?=\n[A-D]\))/is);
      if (!questionMatch) return;
      
      const questionText = questionMatch[1].trim();
      
      // Extract options (A, B, C, D format)
      const optionMatches = section.matchAll(/([A-D])\)\s*(.+?)(?=\n[A-D]\)|\n###|\n\n|$)/gis);
      const options: string[] = [];
      Array.from(optionMatches).forEach(match => {
        options.push(match[2].trim());
      });
      
      // Extract correct answer
      const correctMatch = section.match(/###\s+Réponse correcte\s*:\s*([A-D])/i);
      if (!correctMatch) return;
      
      const correctLetter = correctMatch[1].toUpperCase();
      const correctIndex = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
      
      // Extract explanation
      const explanationMatch = section.match(/###\s+Explication\s*:\s*(.+?)(?=##|$)/is);
      const explanation = explanationMatch ? explanationMatch[1].trim() : "";
      
      // Only add if we have valid data
      if (questionText && options.length === 4 && correctIndex >= 0 && correctIndex < 4) {
        questions.push({
          question: questionText,
          options,
          correctAnswer: correctIndex,
          explanation
        });
      }
    });
    
    // If parsing failed, return empty array to show loading message
    return questions;
  };

  const questions = parseQuestions(content);
  
  // Show error if no questions were parsed
  if (!isLoading && questions.length === 0 && content) {
    return (
      <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-900/40 dark:to-red-900/40 rounded-t-[20px]">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            ⚠️ Pwoblèm ak fòma (Problème de format)
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
        </CardContent>
      </Card>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(index);
    setShowFeedback(true);
    
    const isCorrect = index === currentQuestion.correctAnswer;
    playSound(isCorrect ? "correct" : "incorrect");
    
    if (isCorrect) {
      setScore(prev => prev + 1);
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
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            🎯 Activités Pratiques Interactives
          </CardTitle>
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
            {emoji} Aktivite Konplete! (Activités Complétées!)
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
                <span className="font-bold text-success">Ekselan!</span> Ou metrize sujet la! 
                <span className="italic"> (Excellent! Tu maîtrises le sujet!)</span>
              </p>
            ) : percentage >= 60 ? (
              <p className="text-lg">
                <span className="font-bold text-primary">Byen!</span> Kontinye pratike. 
                <span className="italic"> (Bien! Continue à pratiquer.)</span>
              </p>
            ) : (
              <p className="text-lg">
                <span className="font-bold text-orange-600">Kontinye eseye!</span> Revize leçon an ankò. 
                <span className="italic"> (Continue d'essayer! Révise la leçon.)</span>
              </p>
            )}
          </div>

          <Button 
            onClick={handleRestart} 
            size="lg"
            className="w-full sm:w-auto"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Rekòmanse Aktivite yo (Recommencer)
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-accent/20 to-primary/20 rounded-t-[20px]">
        <div className="space-y-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            🎯 Aktivite {currentQuestionIndex + 1} sou {questions.length}
          </CardTitle>
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
              {selectedAnswer === currentQuestion.correctAnswer ? '✅ Correct!' : '📚 Aprann sou sa:'}
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
              <>Pwochèn Kesyon (Suivant) <ArrowRight className="w-4 h-4 ml-2" /></>
            ) : (
              <>Wè Rezilta (Voir Résultats) <CheckCircle className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        )}

        {/* Original Content (collapsed) */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            Wè tout egzèsis yo (Voir tous les exercices)
          </summary>
          <div className="mt-4 prose prose-sm max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </details>
      </CardContent>
    </Card>
  );
};
