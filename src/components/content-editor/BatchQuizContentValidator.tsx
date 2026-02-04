import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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
import { parseQuizQuestions as parseQuizQuestionsFromUtils } from "@/utils/quizActivityParsing";

interface BatchQuizContentValidatorProps {
  lessons: any[];
  gradeLevel: string;
  onComplete: () => void;
  onDashboardRefresh?: () => void;
  validatedCount?: number;
  totalWithQuiz?: number;
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

export const BatchQuizContentValidator = ({ 
  lessons, 
  gradeLevel, 
  onComplete,
  onDashboardRefresh,
  validatedCount = 0,
  totalWithQuiz = 0
}: BatchQuizContentValidatorProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [currentLesson, setCurrentLesson] = useState<string>("");
  const [skipValidated, setSkipValidated] = useState(true);
  const abortRef = useRef(false);

  const lessonsToProcess = skipValidated 
    ? lessons.filter(l => !l.last_content_validated_at)
    : lessons;

  const handleValidateAll = async () => {
    if (lessonsToProcess.length === 0) {
      toast.info("Aucun quiz à valider (tous déjà validés ou liste vide)!");
      return;
    }

    abortRef.current = false;
    setIsValidating(true);
    setProgress({ current: 0, total: lessonsToProcess.length });
    setResults([]);

    const validationResults: ValidationResult[] = [];

    for (let i = 0; i < lessonsToProcess.length; i++) {
      if (abortRef.current) {
        toast.info("Validation arrêtée. Les progrès ont été sauvegardés.");
        break;
      }

      const lesson = lessonsToProcess[i];
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
        // Parse quiz questions using proven utility
        const parseResult = parseQuizQuestionsFromUtils(fullLesson.quiz_final);
        const questions: QuizQuestion[] = parseResult.items.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        }));

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

        // Prepare validation details to store full API response
        const validationDetails = {
          quiz: {
            aligned,
            confidence,
            offContentQuestions: data?.offContentQuestions || [],
            summary: data?.summary || `${offContentCount === 0 ? 'Aligné' : 'Hors-contenu'}: ${aligned ? 'Oui' : 'Non'}`,
            totalQuestions: data?.totalQuestions || 0,
            alignedCount: data?.alignedCount || 0,
          },
          lastValidatedAt: new Date().toISOString(),
        };

        // Update the lesson with validation results
        const { error: updateError } = await supabase
          .from('lessons')
          .update({
            needs_quiz_regeneration: !aligned,
            content_alignment_score: confidence,
            last_content_validated_at: new Date().toISOString(),
            validation_details_json: validationDetails
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
      if (i < lessonsToProcess.length - 1 && !abortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setProgress({ current: lessonsToProcess.length, total: lessonsToProcess.length });
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
    if (onDashboardRefresh) {
      onDashboardRefresh();
    }
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
            Pause & Sauvegarder
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
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Progression sauvegardée automatiquement
          </p>
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
          className="w-full border-amber-500/30 text-amber-700 hover:bg-amber-500/10 h-auto py-2"
        >
          <Search className="h-4 w-4 mr-2" />
          <div className="flex flex-col items-start text-left">
            <span>Valider alignement contenu</span>
            {totalWithQuiz > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {validatedCount}/{totalWithQuiz} déjà validés ({Math.round((validatedCount/totalWithQuiz)*100)}%)
              </span>
            )}
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Valider l'alignement du contenu?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>📊 Statistiques pour {gradeLevel}</span>
                  <span>{validatedCount}/{totalWithQuiz} validés</span>
                </div>
                <Progress value={(validatedCount / (totalWithQuiz || 1)) * 100} className="h-1.5" />
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                  <div>• Total leçons: {totalWithQuiz}</div>
                  <div>• Restants: {totalWithQuiz - validatedCount}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 py-1">
                <Checkbox 
                  id="skip-validated-quiz" 
                  checked={skipValidated}
                  onCheckedChange={(checked) => setSkipValidated(checked === true)}
                />
                <label 
                  htmlFor="skip-validated-quiz"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Ignorer les leçons déjà validées
                </label>
              </div>

              <p className="text-sm">
                Cette action va analyser {lessonsToProcess.length} quiz{lessonsToProcess.length > 1 ? 's' : ''} 
                pour vérifier si les questions sont alignées avec le contenu.
              </p>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  Les résultats sont sauvegardés automatiquement après chaque leçon.
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3" />
                  Durée estimée: ~{Math.ceil(lessonsToProcess.length * 3 / 60)} minute{Math.ceil(lessonsToProcess.length * 3 / 60) > 1 ? 's' : ''}
                </p>
              </div>
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
