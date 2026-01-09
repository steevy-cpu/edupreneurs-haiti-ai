import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrueFalseGame, TrueFalseQuestion } from "@/components/interactive-activities/TrueFalseGame";

// Security: DOMPurify configuration
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 
                  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'code', 'pre'],
  ALLOWED_ATTR: ['class', 'style', 'id'],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur']
};

const sanitizeHtml = (html: string): string => DOMPurify.sanitize(html, PURIFY_CONFIG);

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

type ActivityItem = 
  | { type: 'quiz'; data: Question }
  | { type: 'true_false'; data: TrueFalseQuestion };

interface InteractiveActivitiesProps {
  content: string;
  isLoading: boolean;
  onRegenerate?: () => void;
  onGoldUpdate?: () => void;
}

export const InteractiveActivities = ({ content, isLoading, onRegenerate, onGoldUpdate }: InteractiveActivitiesProps) => {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedTrueFalse, setSelectedTrueFalse] = useState<boolean | null>(null);
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

      // Try to determine lesson info from URL
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

  // Parse AI-generated content into structured activities
  const parseActivities = (content: string): ActivityItem[] => {
    const activities: ActivityItem[] = [];
    
    // Normalize content first - remove leading dashes from options
    const normalizedContent = content
      .replace(/^-\s*([A-D]\))/gm, '$1')
      .replace(/^\*\s*([A-D]\))/gm, '$1')
      .replace(/^([A-D])\.\s+/gm, '$1) ')
      .replace(/^([A-D]):\s+/gm, '$1) ');
    
    // Parse TRUE_FALSE sections
    const trueFalseMatches = normalizedContent.match(/\*\*TYPE:\s*TRUE_FALSE\*\*([\s\S]*?)(?=\*\*TYPE:|$)/gi);
    if (trueFalseMatches) {
      trueFalseMatches.forEach((section) => {
        const tfQuestions = parseTrueFalseSection(section);
        tfQuestions.forEach(q => activities.push({ type: 'true_false', data: q }));
      });
    }
    
    // Parse QUIZ sections
    const quizSections = normalizedContent.split(/\*\*TYPE:\s*QUIZ\*\*/i);
    if (quizSections.length > 1) {
      quizSections.slice(1).forEach((section) => {
        // Stop at TRUE_FALSE section if present
        const quizOnlySection = section.split(/\*\*TYPE:\s*TRUE_FALSE\*\*/i)[0];
        
        // Split by "---" or **Question X:**
        const questionBlocks = quizOnlySection.split(/(?:^|\n)---\s*\n|\*\*Question\s*\d*:?\s*\*\*/i);
        
        questionBlocks.forEach((block) => {
          if (block.trim().length < 20) return;
          const parsed = parseQuestionBlock(block);
          if (parsed) {
            const exists = activities.some(a => 
              a.type === 'quiz' && a.data.question === parsed.question
            );
            if (!exists) activities.push({ type: 'quiz', data: parsed });
          }
        });
      });
    }
    
    // Fallback: ## Exercice format (original format)
    if (activities.filter(a => a.type === 'quiz').length === 0) {
      const sections = normalizedContent.split(/#{2,3}\s*✏️?\s*Exercice\s+\d+/i);
      
      sections.slice(1).forEach((section) => {
        const parsed = parseExerciseSection(section);
        if (parsed) activities.push({ type: 'quiz', data: parsed });
      });
    }
    
    // Fallback: try direct option parsing if nothing else works
    if (activities.length === 0 && normalizedContent.includes('A)')) {
      const parsed = parseQuestionBlock(normalizedContent);
      if (parsed) activities.push({ type: 'quiz', data: parsed });
    }
    
    return activities;
  };
  
  const parseTrueFalseSection = (section: string): TrueFalseQuestion[] => {
    const questions: TrueFalseQuestion[] = [];
    
    // Split by "---" separator or **Affirmation X:**
    const blocks = section.split(/(?:^|\n)---\s*\n|\*\*Affirmation\s*\d*:?\s*\*\*/i);
    
    blocks.forEach((block) => {
      if (block.trim().length < 10) return;
      
      // Extract statement
      let statementMatch = block.match(/^[\s\n]*(.+?)(?=\n\s*\*\*Réponse)/is);
      if (!statementMatch) return;
      
      const statement = statementMatch[1]
        .trim()
        .replace(/\*\*/g, '')
        .replace(/^Affirmation\s*\d*:?\s*/i, '');
      
      if (statement.length < 5) return;
      
      // Extract answer (VRAI or FAUX)
      const answerMatch = block.match(/\*\*Réponse\s*:?\s*\*?\*?\s*(VRAI|FAUX)/i);
      if (!answerMatch) return;
      
      const isTrue = answerMatch[1].toUpperCase() === 'VRAI';
      
      // Extract explanation
      let explanationMatch = block.match(/\*\*Explication\s*:?\s*\*\*\s*\n?\s*(.+?)(?=\*\*|---|\n\n|$)/is);
      if (!explanationMatch) explanationMatch = block.match(/Explication\s*:?\s*\n?\s*(.+?)(?=\*\*|---|\n\n|$)/is);
      const explanation = explanationMatch ? explanationMatch[1].trim().replace(/\*\*/g, '') : 'Pas d\'explication';
      
      questions.push({ statement, isTrue, explanation });
    });
    
    return questions;
  };
  
  const parseQuestionBlock = (block: string): Question | null => {
    // Extract question text (before options)
    let questionMatch = block.match(/^[\s\n]*(.+?)(?=\n\s*[A-D]\))/is);
    if (!questionMatch) return null;
    
    const questionText = questionMatch[1]
      .trim()
      .replace(/\*\*/g, '')
      .replace(/#{1,3}/g, '')
      .replace(/^Question\s*\d*:?\s*/i, '');
    
    if (questionText.length < 5) return null;
    
    // Extract options with deduplication
    const optionRegex = /^([A-D])\)\s*(.+?)$/gm;
    const optionMatches = Array.from(block.matchAll(optionRegex));
    
    const seenLetters = new Set<string>();
    const options: string[] = [];
    
    for (const match of optionMatches) {
      const letter = match[1].toUpperCase();
      const optionText = match[2]?.trim().replace(/\*\*/g, '');
      
      if (!seenLetters.has(letter) && optionText && optionText.length > 0) {
        seenLetters.add(letter);
        options.push(optionText);
      }
      if (options.length >= 4) break;
    }
    
    if (options.length !== 4) return null;
    
    // Extract correct answer
    let correctMatch = block.match(/\*\*Réponse\s+correcte\s*:?\s*\*?\*?\s*([A-D])/i);
    if (!correctMatch) correctMatch = block.match(/Réponse\s+correcte\s*:?\s*([A-D])/i);
    if (!correctMatch) correctMatch = block.match(/Réponse\s*:?\s*([A-D])/i);
    if (!correctMatch) return null;
    
    const correctLetter = correctMatch[1].toUpperCase();
    const correctIndex = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
    
    // Extract explanation
    let explanationMatch = block.match(/\*\*Explication\s*:?\s*\*\*\s*\n?\s*(.+?)(?=\*\*|#{2,3}|---|\n\n|$)/is);
    if (!explanationMatch) explanationMatch = block.match(/Explication\s*:?\s*\n?\s*(.+?)(?=\*\*|#{2,3}|---|\n\n|$)/is);
    const explanation = explanationMatch ? explanationMatch[1].trim().replace(/\*\*/g, '') : 'Pas d\'explication';
    
    if (correctIndex >= 0 && correctIndex < 4) {
      return { question: questionText, options, correctAnswer: correctIndex, explanation };
    }
    return null;
  };
  
  const parseExerciseSection = (section: string): Question | null => {
    // Extract question text - everything between difficulty marker and first option
    const questionMatch = section.match(/\([^)]*(?:Facile|Moyen|Difficile)[^)]*\)\s*\n+\s*(.+?)(?=\n\s*[A-D][\):])/is);
    if (!questionMatch) return null;
    
    const questionText = questionMatch[1].trim().replace(/\*\*/g, '');
    
    // Extract options
    const optionMatches = section.matchAll(/([A-D])[\):]\s*(.+?)(?=\n\s*[A-D][\):]|\n\s*#{2,3}|\n\n|$)/gis);
    const options: string[] = [];
    const seenLetters = new Set<string>();
    
    for (const match of Array.from(optionMatches)) {
      const letter = match[1].toUpperCase();
      const optionText = match[2]?.trim().replace(/\*\*/g, '');
      if (!seenLetters.has(letter) && optionText) {
        seenLetters.add(letter);
        options.push(optionText);
      }
      if (options.length >= 4) break;
    }
    
    // Extract correct answer
    const correctMatch = section.match(/#{2,3}\s*Réponse\s+correcte\s*:?\s*([A-D])/i);
    if (!correctMatch || options.length !== 4) return null;
    
    const correctLetter = correctMatch[1].toUpperCase();
    const correctIndex = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
    
    // Extract explanation
    const explanationMatch = section.match(/#{2,3}\s*Explication\s*:?\s*\n?\s*(.+?)(?=#{2,3}|$)/is);
    const explanation = explanationMatch ? explanationMatch[1].trim().replace(/\*\*/g, '') : "";
    
    if (questionText && options.length === 4 && correctIndex >= 0 && correctIndex < 4 && explanation) {
      return { question: questionText, options, correctAnswer: correctIndex, explanation };
    }
    return null;
  };

  const activities = parseActivities(content);
  
  // Show error if no activities were parsed
  if (!isLoading && activities.length === 0 && content) {
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
          <div className="prose prose-sm max-w-none dark:prose-invert overflow-x-hidden">
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
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
  
  // Safety check: ensure we have activities after all checks
  if (activities.length === 0) {
    return (
      <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-amber-500/30">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">📝 Activités Interactives</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-6">
          <p className="text-center text-muted-foreground">Aucune activité disponible pour le moment.</p>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline" className="w-full mt-4">
              <ArrowRight className="w-4 h-4 mr-2" />
              Générer les activités
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  const currentActivity = activities[currentActivityIndex];
  const progress = ((currentActivityIndex + 1) / activities.length) * 100;

  // Safety check for currentActivity
  if (!currentActivity) {
    return (
      <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-red-500/30">
        <CardContent className="p-4 sm:p-6">
          <p className="text-center text-muted-foreground">Erreur: Activité introuvable</p>
        </CardContent>
      </Card>
    );
  }

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
        
        // Notify parent to update gold display
        onGoldUpdate?.();
      }
    } catch (error) {
      console.error('Error awarding gold:', error);
    }
  };

  const handleQuizAnswer = async (index: number) => {
    if (showFeedback || currentActivity.type !== 'quiz') return;
    
    setSelectedAnswer(index);
    setShowFeedback(true);
    
    const isCorrect = index === currentActivity.data.correctAnswer;
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

  const handleTrueFalseAnswer = async (isCorrect: boolean) => {
    setShowFeedback(true);
    
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
    setSelectedTrueFalse(null);
    
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
    setSelectedTrueFalse(null);
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
            <p className="text-muted-foreground text-center">Génération d'exercices personnalisés...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (completed) {
    const percentage = Math.round((score / activities.length) * 100);
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
              {score} / {activities.length} bonnes réponses
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
              className="gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Recommencer
            </Button>
            {onRegenerate && (
              <Button 
                onClick={onRegenerate} 
                size="lg"
                className="gap-2 bg-gradient-to-r from-accent/10 to-primary/10 hover:from-accent/20 hover:to-primary/20 border-accent/30"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4" />
                Nouvelles activités
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine activity type icon/label
  const activityTypeLabel = currentActivity.type === 'true_false' ? '✅ Vrai ou Faux' : '🎯 QCM';

  return (
    <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
      <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-accent/20 to-primary/20 rounded-t-[20px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              {activityTypeLabel} - {currentActivityIndex + 1}/{activities.length}
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
        {currentActivity.type === 'true_false' ? (
          // True/False Activity
          <>
            <TrueFalseGame
              question={currentActivity.data}
              onAnswer={handleTrueFalseAnswer}
              showFeedback={showFeedback}
              selectedAnswer={selectedTrueFalse}
              onSelectAnswer={setSelectedTrueFalse}
              isLessonCompleted={isLessonCompleted}
            />
            
            {/* Next Button */}
            {showFeedback && (
              <Button 
                onClick={handleNext}
                size="lg"
                className="w-full animate-fade-in"
              >
                {currentActivityIndex < activities.length - 1 ? (
                  <>Activité suivante <ArrowRight className="w-4 h-4 ml-2" /></>
                ) : (
                  <>Voir les résultats <CheckCircle className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            )}
          </>
        ) : (
          // Quiz Activity
          <>
            {/* Question */}
            <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/20">
              <p className="text-lg font-medium leading-relaxed break-words">
                {currentActivity.data.question}
              </p>
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {currentActivity.data.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentActivity.data.correctAnswer;
                const showCorrect = showFeedback && isCorrect;
                const showIncorrect = showFeedback && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleQuizAnswer(index)}
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
                ${selectedAnswer === currentActivity.data.correctAnswer 
                  ? 'bg-success/10 border-success' 
                  : 'bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-700'
                }
              `}>
                <p className="font-semibold mb-2">
                  {selectedAnswer === currentActivity.data.correctAnswer ? '✅ Correct!' : '📚 Explications:'}
                </p>
                <p className="text-sm leading-relaxed">{currentActivity.data.explanation}</p>
              </div>
            )}

            {/* Next Button */}
            {showFeedback && (
              <Button 
                onClick={handleNext}
                size="lg"
                className="w-full animate-fade-in"
              >
                {currentActivityIndex < activities.length - 1 ? (
                  <>Activité suivante <ArrowRight className="w-4 h-4 ml-2" /></>
                ) : (
                  <>Voir les résultats <CheckCircle className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            )}
          </>
        )}

        {/* Original Content (collapsed) */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            Voir tous les exercices
          </summary>
          <div className="mt-4 prose prose-sm max-w-none dark:prose-invert overflow-x-hidden">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </details>
      </CardContent>
    </Card>
  );
};
