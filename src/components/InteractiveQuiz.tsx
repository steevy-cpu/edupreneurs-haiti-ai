import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, ArrowRight, Trophy, Loader2 } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface InteractiveQuizProps {
  content: string;
  isLoading: boolean;
}

export const InteractiveQuiz = ({ content, isLoading }: InteractiveQuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { playSound } = useSoundEffects();

  const parseQuestions = (content: string): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];
    
    // Parse markdown-style questions
    const sections = content.split(/##\s+✅\s+Question\s+\d+/i);
    
    sections.slice(1).forEach((section) => {
      // Extract question
      const questionMatch = section.match(/^(.+?)(?=\n[A-D]\))/is);
      if (!questionMatch) return;
      
      const questionText = questionMatch[1].trim();
      
      // Extract options
      const optionMatches = section.matchAll(/([A-D])\)\s*(.+?)(?=\n[A-D]\)|\n###|\n\n|$)/gis);
      const options: string[] = [];
      Array.from(optionMatches).forEach(match => {
        options.push(match[2].trim());
      });
      
      // Extract correct answer
      const correctMatch = section.match(/###\s+(?:Réponse correcte|Correct)[:\s]+([A-D])/i);
      const correctLetter = correctMatch ? correctMatch[1].toUpperCase() : 'A';
      const correctIndex = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
      
      // Extract explanation
      const explanationMatch = section.match(/###\s+Explication[:\s]+(.+?)(?=##|$)/is);
      const explanation = explanationMatch ? explanationMatch[1].trim() : "";
      
      if (questionText && options.length >= 2) {
        questions.push({
          question: questionText,
          options,
          correctAnswer: correctIndex,
          explanation
        });
      }
    });
    
    return questions.length > 0 ? questions : generateFallbackQuestions();
  };

  const generateFallbackQuestions = (): QuizQuestion[] => {
    return [{
      question: "Question d'évaluation (basée sur le contenu)",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      explanation: "Consultez le contenu du quiz ci-dessous."
    }];
  };

  const questions = parseQuestions(content);
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
      <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-success/5">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/20 to-success/20 rounded-t-[20px]">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            🏆 Quiz d'Évaluation Final
          </CardTitle>
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
    const passGrade = percentage >= 70;
    
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
            {passGrade ? '🎉' : '📚'} Quiz Konplete!
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
                  🌟 Félicitations! Ou pase egzamen an!
                </p>
                <p className="text-sm italic">
                  (Congratulations! Tu as réussi l'examen!)
                </p>
                <p className="mt-3 text-sm">
                  Ou ka ale nan pwochèn leçon! (Tu peux aller à la prochaine leçon!)
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-orange-700 dark:text-orange-400 mb-2">
                  💪 Pa dekouraje! Revize epi eseye ankò!
                </p>
                <p className="text-sm italic">
                  (Ne te décourage pas! Révise et réessaie!)
                </p>
                <p className="mt-3 text-sm">
                  Ou bezwen omwen 70% pou pase. (Tu as besoin d'au moins 70% pour passer.)
                </p>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleRestart} 
              variant="outline"
              size="lg"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Rekòmanse Quiz (Recommencer)
            </Button>
            {passGrade && (
              <Button 
                size="lg"
                onClick={() => window.location.href = '/math-course'}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Pwochèn Leçon (Prochaine leçon)
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
          <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
            <span>🏆 Quiz Final — Kesyon {currentQuestionIndex + 1}/{questions.length}</span>
            <Trophy className="text-primary w-6 h-6" />
          </CardTitle>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Question */}
        <div className="p-6 bg-gradient-to-r from-primary/10 to-success/10 rounded-lg border-2 border-primary/30">
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
              {selectedAnswer === currentQuestion.correctAnswer ? '✅ Ekselan!' : '❌ Pa kòrèk'}
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
              <>Pwochèn Kesyon <ArrowRight className="w-4 h-4 ml-2" /></>
            ) : (
              <>Fini Quiz la <CheckCircle className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        )}

        {/* Original Content (collapsed) */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            Wè kontni konplè a (Voir le contenu complet)
          </summary>
          <div className="mt-4 prose prose-sm max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </details>
      </CardContent>
    </Card>
  );
};
