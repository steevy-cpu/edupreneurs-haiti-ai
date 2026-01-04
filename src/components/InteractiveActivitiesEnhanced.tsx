import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, ArrowRight, RefreshCw, Shuffle } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MathText } from "@/components/MathContent";

type ActivityType = 'QUIZ' | 'TRUEFALSE';

interface BaseActivity {
  type: ActivityType;
  title: string;
  difficulty: string;
}

interface QuizActivity extends BaseActivity {
  type: 'QUIZ';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface TrueFalseActivity extends BaseActivity {
  type: 'TRUEFALSE';
  statement: string;
  correctAnswer: number;
  explanation: string;
}

type Activity = QuizActivity | TrueFalseActivity;

interface InteractiveActivitiesEnhancedProps {
  content: string;
  isLoading: boolean;
  onRegenerate?: () => void;
  onGoldUpdate?: () => void;
}

export const InteractiveActivitiesEnhanced = ({ 
  content, 
  isLoading, 
  onRegenerate,
  onGoldUpdate 
}: InteractiveActivitiesEnhancedProps) => {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const { playSound } = useSoundEffects();
  const { toast } = useToast();

  // Check if lesson is already completed
  useEffect(() => {
    const checkCompletion = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const pathParts = window.location.pathname.split('/');
      const lessonSlug = pathParts[pathParts.length - 1];
      const subject = 'mathematiques';

      if (!lessonSlug) return;

      const { data } = await supabase
        .from('lesson_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_slug', lessonSlug)
        .eq('subject', subject)
        .maybeSingle();

      if (data) {
        setIsLessonCompleted(true);
      }
    };

    checkCompletion();
  }, []);

  const awardGold = async () => {
    if (isLessonCompleted) return;

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
          .update({ gold_earned: (profile.gold_earned || 0) + 1 })
          .eq('user_id', user.id);
        
        onGoldUpdate?.();
      }
    } catch (error) {
      console.error('Error awarding gold:', error);
    }
  };

  // Parse TRUEFALSE activities - handles multiple formats
  const parseTrueFalseActivities = (content: string): TrueFalseActivity[] => {
    const activities: TrueFalseActivity[] = [];
    
    // Find all TRUEFALSE sections using TYPE marker
    const trueFalseRegex = /\*\*TYPE:\s*(?:TRUE_FALSE|TRUEFALSE)\*\*([\s\S]*?)(?=\*\*TYPE:|$)/gi;
    let match;
    
    while ((match = trueFalseRegex.exec(content)) !== null) {
      const section = match[1];
      
      // Try to find the statement - multiple formats
      // Format 1: **Affirmation à évaluer** or **Affirmation a evaluer**
      // Format 2: **Affirmation 1:**
      let statement = '';
      
      const affirmationMatch = section.match(/\*\*Affirmation\s*(?:à|a)?\s*(?:évaluer|evaluer|[0-9]*):?\*\*\s*\n?\s*(.+?)(?=\n\s*[-*]?\s*[A-B]\)|\n\s*\*\*Réponse)/is);
      if (affirmationMatch) {
        statement = affirmationMatch[1].trim().replace(/\*\*/g, '').replace(/\s+/g, ' ');
      }
      
      if (!statement || statement.length < 5) {
        console.warn('⚠️ No statement found in TRUEFALSE block');
        continue;
      }
      
      // Try to find the correct answer - multiple formats
      let correctAnswer = -1;
      
      // Format 1: **Réponse correcte:** A or B (with A=VRAI, B=FAUX options)
      const letterAnswerMatch = section.match(/\*\*Réponse\s*correcte:?\*\*\s*([A-B])/i) 
        || section.match(/\*\*Réponse\s*correcte:\s*([A-B])\*\*/i);
      
      if (letterAnswerMatch) {
        const letter = letterAnswerMatch[1].toUpperCase();
        // Check if options show A=VRAI, B=FAUX pattern
        const hasVraiOption = /[-*]?\s*A\)\s*VRAI/i.test(section);
        const hasFauxOption = /[-*]?\s*B\)\s*FAUX/i.test(section);
        
        if (hasVraiOption && hasFauxOption) {
          // A = VRAI (0), B = FAUX (1)
          correctAnswer = letter === 'A' ? 0 : 1;
        } else {
          // Assume direct mapping: A=0, B=1
          correctAnswer = letter === 'A' ? 0 : 1;
        }
      }
      
      // Format 2: **Réponse: VRAI** or **Réponse: FAUX**
      if (correctAnswer === -1) {
        const directAnswerMatch = section.match(/\*\*Réponse:?\*\*\s*(VRAI|FAUX)/i) 
          || section.match(/\*\*Réponse:\s*(VRAI|FAUX)\*\*/i);
        
        if (directAnswerMatch) {
          correctAnswer = directAnswerMatch[1].toUpperCase() === 'VRAI' ? 0 : 1;
        }
      }
      
      if (correctAnswer === -1) {
        console.warn('⚠️ No correct answer found in TRUEFALSE block');
        continue;
      }
      
      // Get explanation
      const explanationMatch = section.match(/\*\*Explication:?\*\*\s*(.+?)(?=\*\*TYPE:|$)/is);
      const explanation = explanationMatch 
        ? explanationMatch[1].trim().replace(/\*\*/g, '').replace(/\s+/g, ' ') 
        : "";
      
      activities.push({
        type: 'TRUEFALSE',
        title: `Affirmation ${activities.length + 1}`,
        difficulty: 'Moyen',
        statement,
        correctAnswer,
        explanation
      });
      
      console.log(`✅ Parsed TRUEFALSE: "${statement.substring(0, 50)}..." -> ${correctAnswer === 0 ? 'VRAI' : 'FAUX'}`);
    }
    
    return activities;
  };
  
  // Parse QUIZ activities - handles multiple formats
  const parseQuizActivities = (content: string): QuizActivity[] => {
    const activities: QuizActivity[] = [];
    
    // Find all QUIZ sections using TYPE marker
    const quizRegex = /\*\*TYPE:\s*QUIZ\*\*([\s\S]*?)(?=\*\*TYPE:|$)/gi;
    let match;
    
    while ((match = quizRegex.exec(content)) !== null) {
      const section = match[1];
      
      // Find question text - multiple formats
      // Format 1: **Question 1:**
      // Format 2: **Question:**
      const questionMatch = section.match(/\*\*Question\s*\d*:?\*\*\s*\n?\s*(.+?)(?=\n\s*[-*]?\s*[A-D]\))/is);
      if (!questionMatch) {
        console.warn('⚠️ No question text found in QUIZ block');
        continue;
      }
      
      const question = questionMatch[1].trim().replace(/\*\*/g, '').replace(/\s+/g, ' ');
      
      // Parse options - accepts optional dash/asterisk prefix: - A) or * A) or A)
      const optionsMap: Record<string, string> = {};
      const optionMatches = section.matchAll(/^\s*[-*]?\s*([A-D])\)\s*(.+?)$/gim);
      
      for (const optMatch of optionMatches) {
        const letter = optMatch[1].toUpperCase();
        let optionText = optMatch[2].trim().replace(/\*\*/g, '').replace(/\s+/g, ' ');
        // Clean up any trailing content
        optionText = optionText.split('\n')[0].trim();
        if (optionText && !optionText.toLowerCase().startsWith('réponse')) {
          optionsMap[letter] = optionText;
        }
      }
      
      // Build options array in A, B, C, D order
      const options: string[] = [];
      ['A', 'B', 'C', 'D'].forEach(letter => {
        if (optionsMap[letter]) {
          options.push(optionsMap[letter]);
        }
      });
      
      if (options.length < 2) {
        console.warn(`⚠️ Expected at least 2 options, found ${options.length} in QUIZ block`);
        continue;
      }
      
      // Parse correct answer - multiple formats
      let correctMatch = section.match(/\*\*Réponse\s*correcte:?\*\*\s*([A-D])/i);
      if (!correctMatch) {
        correctMatch = section.match(/\*\*Réponse\s*correcte:\s*([A-D])\*\*/i);
      }
      if (!correctMatch) {
        console.warn('⚠️ No correct answer found in QUIZ block');
        continue;
      }
      
      const correctLetter = correctMatch[1].toUpperCase();
      const correctIndex = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
      
      // Get explanation
      const explanationMatch = section.match(/\*\*Explication:?\*\*\s*(.+?)(?=\*\*TYPE:|$)/is);
      const explanation = explanationMatch 
        ? explanationMatch[1].trim().replace(/\*\*/g, '').replace(/\s+/g, ' ') 
        : "";
      
      activities.push({
        type: 'QUIZ',
        title: `Question ${activities.length + 1}`,
        difficulty: 'Moyen',
        question,
        options,
        correctAnswer: correctIndex,
        explanation
      });
      
      console.log(`✅ Parsed QUIZ: "${question.substring(0, 50)}..." -> Correct: ${correctLetter}`);
    }
    
    return activities;
  };

  // Parse all activities with memoization
  const activities = useMemo(() => {
    if (!content) return [];
    
    console.log('🔍 Parsing activities content:', content.substring(0, 200));
    
    const trueFalseActivities = parseTrueFalseActivities(content);
    const quizActivities = parseQuizActivities(content);
    
    const allActivities = [...quizActivities, ...trueFalseActivities];
    console.log(`📊 Total activities parsed: ${allActivities.length} (${quizActivities.length} QUIZ, ${trueFalseActivities.length} TRUEFALSE)`);
    
    return allActivities;
  }, [content]);

  if (!isLoading && activities.length === 0 && content) {
    return (
      <Card className="lesson-card border-none rounded-[20px] shadow-lg">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-2">⚠️ Format non reconnu</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground mb-4">Les activités n'ont pas pu être chargées.</p>
          <details className="mb-4 text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Voir extrait brut (debug)
            </summary>
            <pre className="mt-2 p-3 bg-muted rounded-lg overflow-x-auto whitespace-pre-wrap break-words max-h-48">
              {content.substring(0, 1000)}...
            </pre>
          </details>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Régénérer
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="lesson-card border-none rounded-[20px] shadow-lg">
        <CardHeader className="p-6">
          <CardTitle>📝 Activités Interactives</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Aucune activité disponible.</p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline" className="w-full mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Générer
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const currentActivity = activities[currentActivityIndex];
  const progress = ((currentActivityIndex + 1) / activities.length) * 100;

  const handleAnswerSubmit = async () => {
    const isCorrect = selectedAnswer === currentActivity.correctAnswer;

    setShowFeedback(true);
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

  const handleNext = () => {
    playSound("next");
    setShowFeedback(false);
    setSelectedAnswer(null);
    
    if (currentActivityIndex < activities.length - 1) {
      setCurrentActivityIndex(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    playSound("next");
    setCurrentActivityIndex(0);
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
              ✏️ Activités Interactives
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
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={175.93}
                  strokeDashoffset={175.93}
                  className="text-primary animate-spin"
                  style={{
                    animation: 'spin 1.5s linear infinite',
                  }}
                />
              </svg>
            </div>
            <p className="text-muted-foreground text-center font-medium">Génération des activités interactives...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (completed) {
    const percentage = Math.round((score / activities.length) * 100);
    const emoji = percentage >= 80 ? "🎉" : percentage >= 60 ? "👏" : "💪";
    
    return (
      <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-success/30">
        <CardHeader className="p-6 bg-gradient-to-r from-success/20 to-primary/20 rounded-t-[20px]">
          <CardTitle className="flex items-center gap-2">
            {emoji} Activités Complétées!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-6">
          <div>
            <div className="text-6xl font-bold text-primary mb-2">{percentage}%</div>
            <p className="text-xl font-semibold">
              {score} / {activities.length} bonnes réponses
            </p>
          </div>
          
          <div className="p-6 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg border-2 border-success/30">
            {percentage >= 80 ? (
              <p className="text-lg font-bold text-success">Excellent! Tu maîtrises le sujet!</p>
            ) : percentage >= 60 ? (
              <p className="text-lg font-bold text-primary">Bien! Continue à pratiquer.</p>
            ) : (
              <p className="text-lg font-bold text-orange-600">Continue d'essayer! Révise la leçon.</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleRestart} size="lg" variant="outline">
              <ArrowRight className="w-4 h-4 mr-2" />
              Recommencer
            </Button>
            {onRegenerate && (
              <Button onClick={onRegenerate} size="lg" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Nouvelles activités
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderActivity = () => {
    switch (currentActivity.type) {
      case 'QUIZ':
        const quizActivity = currentActivity as QuizActivity;
        return (
          <>
            <div className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/20">
              <p className="text-base sm:text-lg font-medium leading-relaxed break-words">
                <MathText text={quizActivity.question} />
              </p>
            </div>

            <div className="grid gap-2 sm:gap-3">
              {quizActivity.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === quizActivity.correctAnswer;
                const showCorrect = showFeedback && isCorrect;
                const showIncorrect = showFeedback && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => !showFeedback && setSelectedAnswer(index)}
                    disabled={showFeedback}
                    className={`
                      p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-300 min-h-[60px] sm:min-h-[70px]
                      ${!showFeedback ? 'hover:border-primary hover:bg-primary/5 active:scale-[0.98] sm:hover:scale-[1.02]' : ''}
                      ${isSelected && !showFeedback ? 'border-primary bg-primary/10' : 'border-muted'}
                      ${showCorrect ? 'border-success bg-success/10' : ''}
                      ${showIncorrect ? 'border-destructive bg-destructive/10' : ''}
                      ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`
                        w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                        ${showCorrect ? 'bg-success text-white' : ''}
                        ${showIncorrect ? 'bg-destructive text-white' : ''}
                        ${!showFeedback ? 'bg-muted' : ''}
                      `}>
                        {showCorrect && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                        {showIncorrect && <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                        {!showFeedback && String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1 text-sm sm:text-base break-words"><MathText text={option} /></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        );

      case 'TRUEFALSE':
        const tfActivity = currentActivity as TrueFalseActivity;
        return (
          <>
            <div className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/20">
              <p className="text-base sm:text-lg font-medium leading-relaxed break-words"><MathText text={tfActivity.statement} /></p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {['VRAI', 'FAUX'].map((label, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === tfActivity.correctAnswer;
                const showCorrect = showFeedback && isCorrect;
                const showIncorrect = showFeedback && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => !showFeedback && setSelectedAnswer(index)}
                    disabled={showFeedback}
                    className={`
                      p-4 sm:p-6 rounded-xl border-2 font-bold text-lg sm:text-xl transition-all duration-300 min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center
                      ${!showFeedback ? 'hover:border-primary hover:bg-primary/5 active:scale-[0.98] sm:hover:scale-105' : ''}
                      ${isSelected && !showFeedback ? 'border-primary bg-primary/10' : 'border-muted'}
                      ${showCorrect ? 'border-success bg-success/10' : ''}
                      ${showIncorrect ? 'border-destructive bg-destructive/10' : ''}
                      ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {showCorrect && <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mb-2" />}
                    {showIncorrect && <XCircle className="w-5 h-5 sm:w-6 sm:h-6 mb-2" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-accent/30 max-w-4xl mx-auto">
      <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-accent/20 to-primary/20 rounded-t-[20px]">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-start sm:items-center gap-2 text-sm sm:text-base">
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-1 sm:mt-0" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span>Activité {currentActivityIndex + 1}/{activities.length}</span>
                <span className="hidden sm:inline">—</span>
                <span className="break-words">{currentActivity.title}</span>
                <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                  ({currentActivity.difficulty})
                </span>
              </div>
            </CardTitle>
            {onRegenerate && (
              <Button onClick={onRegenerate} variant="outline" size="sm" className="flex-shrink-0">
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <span className="text-xs sm:text-sm">Régénérer</span>
              </Button>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
        {renderActivity()}

        {showFeedback && (
          <div className={`
            p-4 sm:p-6 rounded-lg border-2 animate-fade-in
            ${selectedAnswer === currentActivity.correctAnswer
              ? 'bg-success/10 border-success' 
              : 'bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-700'
            }
          `}>
            <p className="font-semibold mb-2 text-sm sm:text-base">
              {selectedAnswer === currentActivity.correctAnswer
                ? '✅ Correct!' 
                : '📚 Explications:'}
            </p>
                    <p className="text-xs sm:text-sm leading-relaxed break-words">
                      <MathText text={currentActivity.explanation || ''} />
                    </p>
          </div>
        )}

        {!showFeedback && (
          <Button 
            onClick={handleAnswerSubmit}
            size="lg"
            className="w-full min-h-[48px] text-sm sm:text-base"
            disabled={selectedAnswer === null}
          >
            Vérifier
          </Button>
        )}

        {showFeedback && (
          <Button 
            onClick={handleNext}
            size="lg"
            className="w-full min-h-[48px] text-sm sm:text-base"
          >
            {currentActivityIndex < activities.length - 1 ? (
              <>Activité suivante <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" /></>
            ) : (
              <>Voir les résultats <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 ml-2" /></>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
