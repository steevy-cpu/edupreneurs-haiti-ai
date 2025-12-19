import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Trophy, AlertTriangle, RefreshCw } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ParsedQuestion {
  number: number;
  question: string;
  options: { letter: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

interface HTMLQuizParserProps {
  htmlContent: string;
  lessonSlug: string;
  subject: string;
}

export const HTMLQuizParser = ({ htmlContent, lessonSlug, subject }: HTMLQuizParserProps) => {
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [parseError, setParseError] = useState(false);
  const { playSound } = useSoundEffects();
  const { toast } = useToast();

  useEffect(() => {
    checkLessonCompletion();
    parseHTMLQuiz(htmlContent);
  }, [htmlContent, lessonSlug]);

  const checkLessonCompletion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('lesson_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_slug', lessonSlug)
        .maybeSingle();

      if (data) {
        setIsLessonCompleted(true);
      }
    } catch (error) {
      console.error('Error checking lesson completion:', error);
    }
  };

  const parseHTMLQuiz = (html: string) => {
    if (!html || html.trim() === '') {
      setParseError(true);
      return;
    }

    // The stored quiz HTML can be malformed (e.g., broken data-answer attributes) which can cause the browser
    // parser to nest multiple questions inside the first question.
    // To guarantee we only show ONE question at a time, we parse each quiz-question block separately.

    // First, repair the most common malformed option markup.
    const repairedHtml = html
      .replace(
        /data-answer="([A-D])\)\s*([^<]*?)<\/div>/g,
        (_m, letter: string, text: string) => `data-answer="${letter}">${letter}) ${text.trim()}</div>`
      )
      .replace(/data-answer="([A-D])\)[^"]*"/g, 'data-answer="$1"')
      .replace(/data-correct="([A-D])[^"]*"/g, 'data-correct="$1"');

    // Parse using a proper DOM parser - this handles all questions correctly
    const tempParser = new DOMParser();
    const fullDoc = tempParser.parseFromString(repairedHtml, 'text/html');
    const allQuestionElements = fullDoc.querySelectorAll('.quiz-question');

    const parsed: ParsedQuestion[] = [];

    allQuestionElements.forEach((qEl, index) => {
      const numberAttr = qEl.getAttribute('data-number');
      const number = numberAttr ? parseInt(numberAttr) : index + 1;

      const questionP = qEl.querySelector('p');
      const questionText = questionP?.textContent?.trim() || '';

      const options: { letter: string; text: string }[] = [];
      qEl.querySelectorAll('.option').forEach((opt) => {
        let letter = opt.getAttribute('data-answer') || '';
        let text = opt.textContent?.trim() || '';

        const letterMatch = letter.match(/^([A-D])/);
        if (letterMatch) letter = letterMatch[1];

        text = text.replace(/^[A-D]\)\s*/, '').trim();

        if (!letter && text) {
          const textLetterMatch = opt.textContent?.trim().match(/^([A-D])\)/);
          if (textLetterMatch) letter = textLetterMatch[1];
        }

        if (letter && text) options.push({ letter, text });
      });

      const correctAnswerEl = qEl.querySelector('.correct-answer');
      let correctAnswer = correctAnswerEl?.getAttribute('data-correct') || '';
      const correctMatch = correctAnswer.match(/^([A-D])/);
      if (correctMatch) correctAnswer = correctMatch[1];

      let explanation = '';
      const explanationParagraphs = correctAnswerEl?.querySelectorAll('p');
      if (explanationParagraphs && explanationParagraphs.length > 1) {
        explanation = explanationParagraphs[1]?.textContent?.trim() || '';
      } else if (explanationParagraphs && explanationParagraphs.length === 1) {
        const text = explanationParagraphs[0]?.textContent?.trim() || '';
        explanation = text.replace(/Réponse correcte\s*:\s*[A-D]/i, '').trim();
      }

      if (questionText && options.length >= 2 && correctAnswer) {
        parsed.push({
          number,
          question: questionText,
          options,
          correctAnswer,
          explanation: explanation || 'Bonne réponse!'
        });
      }
    });

    if (parsed.length === 0) {
      console.warn('HTMLQuizParser: No questions could be parsed from:', html.substring(0, 200));
      setParseError(true);
    } else {
      setParseError(false);
    }

    setQuestions(parsed);
  };

  const handleAnswerSelect = (letter: string) => {
    if (showFeedback) return;
    setSelectedAnswer(letter);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    setShowFeedback(true);
    
    if (isCorrect) {
      setScore(score + 1);
      playSound('correct');
      
      // Award gold for correct answer if lesson not completed
      if (!isLessonCompleted) {
        await awardGold(1);
      }
    } else {
      playSound('incorrect');
    }
  };

  const awardGold = async (amount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('gold_earned')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ gold_earned: (profile.gold_earned || 0) + amount })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error awarding gold:', error);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setCompleted(true);
    
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 80;
    const goldEarned = passed ? Math.max(10, Math.round(percentage / 10) * 5) : 0;
    
    if (passed) {
      playSound('correct');
      toast({
        title: "🎉 Quiz réussi !",
        description: `Tu as obtenu ${score}/${questions.length} (${percentage}%) et gagné ${goldEarned} points d'or !`,
      });
    } else {
      playSound('incorrect');
      toast({
        title: "📚 Continue à t'entraîner !",
        description: `Tu as obtenu ${score}/${questions.length} (${percentage}%). Il te faut au moins 80% pour réussir. Réessaye !`,
        variant: "destructive"
      });
    }

    // Only save completion and award gold if passed (80% or higher) and not already completed
    if (passed && !isLessonCompleted) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Mark lesson as complete
        const { error: completionError } = await supabase
          .from('lesson_completions')
          .upsert({
            user_id: user.id,
            lesson_slug: lessonSlug,
            subject: subject,
            score: percentage,
            completed_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,lesson_slug'
          });

        if (completionError) {
          console.error('Error saving completion:', completionError);
        } else {
          setIsLessonCompleted(true);
        }

        // Award completion gold
        await awardGold(goldEarned);
        
        toast({
          title: "🏆 Leçon complétée !",
          description: `Tu as gagné ${goldEarned} points d'or pour avoir terminé cette leçon !`,
        });
      } catch (error) {
        console.error('Error saving quiz completion:', error);
      }
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setCompleted(false);
  };

  // Show error state if parsing failed
  if (parseError || (questions.length === 0 && htmlContent)) {
    return (
      <Card className="p-6 border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
          <div className="space-y-4 flex-1">
            <div>
              <h3 className="font-bold text-lg text-amber-700 dark:text-amber-300 mb-2">
                Quiz non disponible
              </h3>
              <p className="text-sm text-muted-foreground">
                Le quiz n'a pas pu être chargé dans le format interactif. 
                Veuillez réessayer plus tard ou contacter le support.
              </p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recharger la page
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Show loading state only briefly
  if (questions.length === 0 && !htmlContent) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Aucun quiz disponible pour cette leçon.</p>
      </div>
    );
  }

  if (completed) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 80;
    
    return (
      <Card className={`p-8 ${passed ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-500' : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-500'}`}>
        <div className="text-center space-y-6">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${passed ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-amber-500 to-orange-500'}`}>
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className={`text-2xl font-bold mb-2 ${passed ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
              {passed ? '🎉 Quiz réussi !' : '📚 Continue à t\'entraîner !'}
            </h3>
            <p className={`text-lg ${passed ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
              Score: {score}/{questions.length} ({percentage}%)
            </p>
            {!passed && (
              <p className="text-sm text-muted-foreground mt-2">
                Il te faut au moins 80% pour réussir la leçon
              </p>
            )}
            {passed && !isLessonCompleted && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                ✅ Leçon marquée comme complétée !
              </p>
            )}
            {isLessonCompleted && (
              <p className="text-sm text-muted-foreground mt-2">
                Cette leçon était déjà complétée
              </p>
            )}
          </div>
          <Button 
            onClick={handleRestart}
            className={passed ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'}
          >
            Refaire le quiz
          </Button>
        </div>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  // Safety check
  if (!currentQuestion) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Erreur: Question non trouvée</p>
      </div>
    );
  }
  
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          Question {currentQuestionIndex + 1} sur {questions.length}
        </Badge>
        <Badge variant="outline" className="text-sm">
          Score: {score}/{currentQuestionIndex + (showFeedback ? 1 : 0)}
        </Badge>
      </div>

      {/* Question Card */}
      <Card className="p-6 border-2 border-purple-200 dark:border-purple-800">
        <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-4">
          Question {currentQuestion.number}
        </h3>
        <p className="text-lg text-foreground mb-6">{currentQuestion.question}</p>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option.letter;
            const isCorrectOption = option.letter === currentQuestion.correctAnswer;
            
            let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all ";
            
            if (showFeedback) {
              if (isCorrectOption) {
                buttonClass += "border-green-500 bg-green-50 dark:bg-green-950/30";
              } else if (isSelected && !isCorrect) {
                buttonClass += "border-red-500 bg-red-50 dark:bg-red-950/30";
              } else {
                buttonClass += "border-gray-200 dark:border-gray-700 opacity-50";
              }
            } else {
              if (isSelected) {
                buttonClass += "border-purple-500 bg-purple-50 dark:bg-purple-950/30";
              } else {
                buttonClass += "border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20";
              }
            }

            return (
              <button
                key={`${currentQuestion.number}-${option.letter}-${option.text}`}
                onClick={() => handleAnswerSelect(option.letter)}
                disabled={showFeedback}
                className={buttonClass}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {option.letter})
                  </span>
                  <span className="flex-1">{option.text}</span>
                  {showFeedback && isCorrectOption && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                  {showFeedback && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <Card className={`p-4 border-l-4 ${isCorrect ? 'border-l-green-500 bg-green-50 dark:bg-green-950/20' : 'border-l-red-500 bg-red-50 dark:bg-red-950/20'}`}>
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold mb-2 text-foreground">
                  {isCorrect ? '✅ Bonne réponse !' : `❌ Mauvaise réponse. La bonne réponse est ${currentQuestion.correctAnswer}`}
                </p>
                <p className="text-sm text-foreground">{currentQuestion.explanation}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Actions - ALWAYS show the button */}
        <div className="flex justify-end gap-3 mt-6">
          {!showFeedback ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              Valider ma réponse
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Terminer le quiz'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
