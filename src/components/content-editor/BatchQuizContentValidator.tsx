import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Search, X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BatchQuizContentValidatorProps {
  lessons: any[];
  gradeLevel: string;
  onComplete: () => void;
}

interface ValidationResult {
  lessonId: string;
  lessonTitle: string;
  aligned: boolean;
  confidence: number;
  offContentCount: number;
  error?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Parse quiz HTML to extract questions
const parseQuizQuestions = (quizHtml: string): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];
  
  // Create a temporary container to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(quizHtml, 'text/html');
  
  // Find all quiz-question elements
  const questionElements = doc.querySelectorAll('.quiz-question');
  
  questionElements.forEach((elem) => {
    const questionText = elem.querySelector('h3, .question-text, p')?.textContent?.trim() || "";
    const options: string[] = [];
    let correctAnswer = 0;
    let explanation = "";
    
    // Find options
    const optionElements = elem.querySelectorAll('[data-correct], .option, li');
    optionElements.forEach((opt, idx) => {
      const optText = opt.textContent?.trim() || "";
      if (optText) {
        options.push(optText);
        if (opt.getAttribute('data-correct') === 'true') {
          correctAnswer = idx;
        }
      }
    });
    
    // Find explanation
    const explanationElem = elem.querySelector('.explanation, [class*="explanation"]');
    if (explanationElem) {
      explanation = explanationElem.textContent?.trim() || "";
    }
    
    if (questionText && options.length > 0) {
      questions.push({
        question: questionText,
        options,
        correctAnswer,
        explanation
      });
    }
  });
  
  return questions;
};

export const BatchQuizContentValidator = ({ lessons, gradeLevel, onComplete }: BatchQuizContentValidatorProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [currentLesson, setCurrentLesson] = useState<string>("");
  const abortRef = useRef(false);

  const handleValidateAll = async () => {
    if (lessons.length === 0) {
      toast.info("Aucun quiz à valider!");
      return;
    }

    abortRef.current = false;
    setIsValidating(true);
    setProgress({ current: 0, total: lessons.length });
    setResults([]);

    const validationResults: ValidationResult[] = [];

    for (let i = 0; i < lessons.length; i++) {
      if (abortRef.current) {
        toast.info("Validation annulée");
        break;
      }

      const lesson = lessons[i];
      setCurrentLesson(lesson.title);
      setProgress({ current: i, total: lessons.length });

      try {
        // Fetch full lesson content
        const { data: fullLesson, error: fetchError } = await supabase
          .from('lessons')
          .select('contenu, exemples_exercices, quiz_final')
          .eq('id', lesson.id)
          .single();

        if (fetchError) {
          throw new Error('Erreur de chargement');
        }

        if (!fullLesson?.quiz_final) {
          throw new Error('Pas de quiz disponible');
        }

        // Parse quiz questions from HTML
        const questions = parseQuizQuestions(fullLesson.quiz_final);

        if (questions.length === 0) {
          throw new Error('Aucune question trouvée dans le quiz');
        }

        // Call the validation edge function
        const { data, error } = await supabase.functions.invoke('validate-quiz-content-alignment', {
          body: {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            gradeLevel: lesson.grade_level,
            contenu: fullLesson.contenu || '',
            exemples: fullLesson.exemples_exercices || '',
            questions
          }
        });

        if (error) {
          throw new Error(error.message || 'Erreur de validation');
        }

        const aligned = data?.aligned ?? false;
        const offContentCount = data?.offContentQuestions?.length || 0;
        const confidence = data?.confidence || 0;

        // Update the lesson with validation results
        const { error: updateError } = await supabase
          .from('lessons')
          .update({
            needs_quiz_regeneration: !aligned,
            content_alignment_score: confidence,
            last_content_validated_at: new Date().toISOString()
          })
          .eq('id', lesson.id);

        if (updateError) {
          console.error('Error updating lesson:', updateError);
        }

        validationResults.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          aligned,
          confidence,
          offContentCount
        });

      } catch (error) {
        console.error(`Error validating ${lesson.title}:`, error);
        validationResults.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          aligned: false,
          confidence: 0,
          offContentCount: 0,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }

      setResults([...validationResults]);

      // Rate limiting delay between requests (2 seconds for AI calls)
      if (i < lessons.length - 1 && !abortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setProgress({ current: lessons.length, total: lessons.length });
    setIsValidating(false);

    const alignedCount = validationResults.filter(r => r.aligned && !r.error).length;
    const offContentCount = validationResults.filter(r => !r.aligned && !r.error).length;
    const errorCount = validationResults.filter(r => r.error).length;

    if (offContentCount === 0 && errorCount === 0) {
      toast.success(`✓ Tous les ${alignedCount} quizzes sont alignés avec le contenu!`);
    } else if (alignedCount === 0 && offContentCount > 0) {
      toast.warning(`⚠ ${offContentCount} quiz${offContentCount > 1 ? 's' : ''} nécessite${offContentCount > 1 ? 'nt' : ''} régénération`);
    } else {
      toast.info(`${alignedCount} aligné${alignedCount > 1 ? 's' : ''}, ${offContentCount} à régénérer${errorCount > 0 ? `, ${errorCount} erreur${errorCount > 1 ? 's' : ''}` : ''}`);
    }

    onComplete();
  };

  const handleCancel = () => {
    abortRef.current = true;
  };

  const alignedCount = results.filter(r => r.aligned && !r.error).length;
  const offContentCount = results.filter(r => !r.aligned && !r.error).length;
  const errorCount = results.filter(r => r.error).length;

  if (isValidating) {
    return (
      <div className="space-y-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
            <span>Validation en cours...</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
            className="h-7 px-2 text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Annuler
          </Button>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate max-w-[200px]">{currentLesson}</span>
            <span>{progress.current}/{progress.total}</span>
          </div>
          <Progress 
            value={(progress.current / progress.total) * 100} 
            className="h-2 [&>div]:bg-amber-500"
          />
        </div>

        {results.length > 0 && (
          <div className="flex items-center gap-3 text-xs flex-wrap">
            {alignedCount > 0 && (
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="h-3 w-3" />
                {alignedCount} aligné{alignedCount > 1 ? 's' : ''}
              </span>
            )}
            {offContentCount > 0 && (
              <span className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-3 w-3" />
                {offContentCount} hors-contenu
              </span>
            )}
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <X className="h-3 w-3" />
                {errorCount} erreur{errorCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          size="sm" 
          variant="outline"
          className="w-full border-amber-500/30 text-amber-700 hover:bg-amber-500/10"
        >
          <Search className="h-4 w-4 mr-2" />
          Valider alignement contenu
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Valider l'alignement du contenu?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Cette action va analyser {lessons.length} quiz{lessons.length > 1 ? 's' : ''} du niveau {gradeLevel} 
                pour vérifier si les questions sont alignées avec le contenu des leçons.
              </p>
              <p className="text-xs text-muted-foreground">
                ℹ️ Les quizzes avec des questions hors-contenu seront marqués pour régénération.
              </p>
              <p className="text-xs text-muted-foreground">
                ⏱️ Durée estimée: ~{Math.ceil(lessons.length * 3 / 60)} minute{Math.ceil(lessons.length * 3 / 60) > 1 ? 's' : ''}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleValidateAll}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Search className="h-4 w-4 mr-2" />
            Commencer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
