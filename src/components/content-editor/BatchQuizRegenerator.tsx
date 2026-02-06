import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { RefreshCw, X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
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
import { useContentEditorPermissions } from "@/hooks/useContentEditorPermissions";

interface BatchQuizRegeneratorProps {
  lessons: any[];
  gradeLevel: string;
  onComplete: () => void;
  onDashboardRefresh?: () => void;
}

interface RegenerationResult {
  lessonId: string;
  lessonTitle: string;
  success: boolean;
  error?: string;
}

export const BatchQuizRegenerator = ({ 
  lessons, 
  gradeLevel, 
  onComplete,
  onDashboardRefresh
}: BatchQuizRegeneratorProps) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<RegenerationResult[]>([]);
  const [currentLesson, setCurrentLesson] = useState<string>("");
  const abortRef = useRef(false);
  const { role } = useContentEditorPermissions();

  // Only admin can batch regenerate
  const canBatchRegenerate = role === 'admin';

  // Filter to only lessons that need regeneration and have been validated
  const lessonsToRegenerate = lessons.filter(
    l => l.needs_quiz_regeneration && l.last_content_validated_at
  );

  if (!canBatchRegenerate || lessonsToRegenerate.length === 0) {
    return null;
  }

  const handleRegenerateAll = async () => {
    if (lessonsToRegenerate.length === 0) {
      toast.info("Aucun quiz à régénérer!");
      return;
    }

    abortRef.current = false;
    setIsRegenerating(true);
    setProgress({ current: 0, total: lessonsToRegenerate.length });
    setResults([]);

    const regenerationResults: RegenerationResult[] = [];

    for (let i = 0; i < lessonsToRegenerate.length; i++) {
      if (abortRef.current) {
        toast.info("Régénération arrêtée. Les progrès ont été sauvegardés.");
        break;
      }

      const lesson = lessonsToRegenerate[i];
      setCurrentLesson(lesson.title);
      setProgress({ current: i, total: lessonsToRegenerate.length });

      try {
        // Fetch full lesson content
        const { data: fullLesson, error: fetchError } = await supabase
          .from('lessons')
          .select('contenu, exemples_exercices, grade_level, subjects(name)')
          .eq('id', lesson.id)
          .single();

        if (fetchError) {
          throw new Error('Erreur de chargement');
        }

        // Call the quiz generation edge function
        const { data, error } = await supabase.functions.invoke('generate-quiz-final', {
          body: {
            lessonTitle: lesson.title,
            contenu: fullLesson.contenu || '',
            exemplesExercices: fullLesson.exemples_exercices || '',
            gradeLevel: fullLesson.grade_level || lesson.grade_level,
            subject: fullLesson.subjects?.name || 'Matière',
          }
        });

        if (error) {
          throw new Error(error.message || 'Erreur de génération');
        }

        if (!data?.quizContent) {
          throw new Error('Pas de contenu quiz retourné');
        }

        // Update the lesson with new quiz and clear flags
        const { error: updateError } = await supabase
          .from('lessons')
          .update({
            quiz_final: data.quizContent,
            needs_quiz_regeneration: false,
            content_alignment_score: null,
            last_content_validated_at: null,
          })
          .eq('id', lesson.id);

        if (updateError) {
          throw new Error('Erreur de mise à jour');
        }

        regenerationResults.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          success: true
        });

      } catch (error) {
        console.error(`Error regenerating quiz for ${lesson.title}:`, error);
        regenerationResults.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }

      setResults([...regenerationResults]);

      // Rate limiting delay between requests (2 seconds for AI calls)
      if (i < lessonsToRegenerate.length - 1 && !abortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setProgress({ current: lessonsToRegenerate.length, total: lessonsToRegenerate.length });
    setIsRegenerating(false);

    const successCount = regenerationResults.filter(r => r.success).length;
    const errorCount = regenerationResults.filter(r => !r.success).length;

    if (errorCount === 0) {
      toast.success(`✓ ${successCount} quiz${successCount > 1 ? 's' : ''} régénéré${successCount > 1 ? 's' : ''} avec succès!`);
    } else if (successCount === 0) {
      toast.error(`✗ Échec de la régénération de tous les quizzes`);
    } else {
      toast.info(`${successCount} régénéré${successCount > 1 ? 's' : ''}, ${errorCount} erreur${errorCount > 1 ? 's' : ''}`);
    }

    onComplete();
    if (onDashboardRefresh) {
      onDashboardRefresh();
    }
  };

  const handleCancel = () => {
    abortRef.current = true;
  };

  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;

  if (isRegenerating) {
    return (
      <div className="space-y-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Régénération en cours...</span>
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
            className="h-2"
          />
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Sauvegarde automatique après chaque leçon
          </p>
        </div>

        {results.length > 0 && (
          <div className="flex items-center gap-3 text-xs flex-wrap">
            {successCount > 0 && (
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="h-3 w-3" />
                {successCount} régénéré{successCount > 1 ? 's' : ''}
              </span>
            )}
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="h-3 w-3" />
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
          className="w-full border-primary/30 text-primary hover:bg-primary/10 h-auto py-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          <div className="flex flex-col items-start text-left">
            <span>Régénérer quizzes flaggés ({lessonsToRegenerate.length})</span>
            <span className="text-[10px] text-muted-foreground">
              {lessonsToRegenerate.length} quiz{lessonsToRegenerate.length > 1 ? 's' : ''} nécessite{lessonsToRegenerate.length > 1 ? 'nt' : ''} régénération
            </span>
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Régénérer les quizzes flaggés?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>🔄 Régénération batch pour {gradeLevel}</span>
                  <span>{lessonsToRegenerate.length} quizzes</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ces quizzes ont été validés et identifiés comme ayant des questions hors-contenu.
                </p>
              </div>

              <p className="text-sm">
                Cette action va régénérer {lessonsToRegenerate.length} quiz{lessonsToRegenerate.length > 1 ? 's' : ''} 
                {' '}en utilisant le contenu de la leçon pour créer des questions alignées.
              </p>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  Les quizzes sont sauvegardés automatiquement après chaque régénération.
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3" />
                  Durée estimée: ~{Math.ceil(lessonsToRegenerate.length * 3 / 60)} minute{Math.ceil(lessonsToRegenerate.length * 3 / 60) > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleRegenerateAll}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Régénérer tout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
