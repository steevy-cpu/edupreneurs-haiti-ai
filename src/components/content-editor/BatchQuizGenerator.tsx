import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Sparkles, X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
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

interface BatchQuizGeneratorProps {
  lessons: any[];
  gradeLevel: string;
  onComplete: () => void;
}

interface GenerationResult {
  lessonId: string;
  lessonTitle: string;
  success: boolean;
  error?: string;
}

export const BatchQuizGenerator = ({ lessons, gradeLevel, onComplete }: BatchQuizGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [currentLesson, setCurrentLesson] = useState<string>("");
  const abortRef = useRef(false);

  const handleGenerateAll = async () => {
    if (lessons.length === 0) {
      toast.info("Aucune leçon à générer!");
      return;
    }

    abortRef.current = false;
    setIsGenerating(true);
    setProgress({ current: 0, total: lessons.length });
    setResults([]);

    const generationResults: GenerationResult[] = [];

    for (let i = 0; i < lessons.length; i++) {
      if (abortRef.current) {
        toast.info("Génération annulée");
        break;
      }

      const lesson = lessons[i];
      setCurrentLesson(lesson.title);
      setProgress({ current: i, total: lessons.length });

      try {
        // Fetch full lesson content for better quiz generation
        const { data: fullLesson, error: fetchError } = await supabase
          .from('lessons')
          .select('contenu, exemples_exercices, subjects(name, slug)')
          .eq('id', lesson.id)
          .single();

        if (fetchError) {
          throw new Error('Erreur de chargement');
        }

        // Call the generate-quiz-final edge function
        const { data, error } = await supabase.functions.invoke('generate-quiz-final', {
          body: {
            lessonTitle: lesson.title,
            lessonSlug: lesson.slug,
            subjectSlug: fullLesson?.subjects?.slug || '',
            contenu: fullLesson?.contenu || '',
            exemplesExercices: fullLesson?.exemples_exercices || '',
            gradeLevel: lesson.grade_level,
            subject: fullLesson?.subjects?.name || '',
            outputFormat: 'html', // Use HTML for backward compatibility
          }
        });

        if (error) {
          throw new Error(error.message || 'Erreur de génération');
        }

        if (!data?.quizContent) {
          throw new Error('Contenu vide retourné');
        }

        // Validate the generated content has the right structure
        const hasValidStructure = data.quizContent.includes('quiz-question') || 
                                   data.quizContent.includes('quiz-container');
        
        if (!hasValidStructure) {
          throw new Error('Format invalide généré');
        }

        // Update the lesson with the generated quiz
        const { error: updateError } = await supabase
          .from('lessons')
          .update({ quiz_final: data.quizContent })
          .eq('id', lesson.id);

        if (updateError) {
          throw new Error('Erreur de sauvegarde');
        }

        generationResults.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          success: true,
        });

      } catch (error) {
        console.error(`Error generating quiz for ${lesson.title}:`, error);
        generationResults.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }

      setResults([...generationResults]);

      // Rate limiting delay between requests (1.5 seconds for 3G optimization)
      if (i < lessons.length - 1 && !abortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    setProgress({ current: lessons.length, total: lessons.length });
    setIsGenerating(false);

    const successCount = generationResults.filter(r => r.success).length;
    const failCount = generationResults.filter(r => !r.success).length;

    if (failCount === 0) {
      toast.success(`${successCount} quiz${successCount > 1 ? 's' : ''} généré${successCount > 1 ? 's' : ''} avec succès!`);
    } else if (successCount === 0) {
      toast.error(`Échec de génération pour tous les ${failCount} quizzes`);
    } else {
      toast.warning(`${successCount} réussi${successCount > 1 ? 's' : ''}, ${failCount} échec${failCount > 1 ? 's' : ''}`);
    }

    onComplete();
  };

  const handleCancel = () => {
    abortRef.current = true;
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  if (isGenerating) {
    return (
      <div className="space-y-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Génération en cours...</span>
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
            className="h-2"
          />
        </div>

        {results.length > 0 && (
          <div className="flex items-center gap-3 text-xs">
            {successCount > 0 && (
              <span className="flex items-center gap-1 text-primary">
                <CheckCircle2 className="h-3 w-3" />
                {successCount} réussi{successCount > 1 ? 's' : ''}
              </span>
            )}
            {failCount > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="h-3 w-3" />
                {failCount} échec{failCount > 1 ? 's' : ''}
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
          className="w-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Générer {lessons.length} quiz{lessons.length > 1 ? 's' : ''} manquant{lessons.length > 1 ? 's' : ''}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Générer tous les quizzes manquants?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Cela va générer automatiquement les quizzes pour {lessons.length} leçon{lessons.length > 1 ? 's' : ''} 
                du niveau {gradeLevel}.
              </p>
              <p className="text-xs text-muted-foreground">
                ⚠️ Cette opération peut prendre plusieurs minutes. Vous pouvez annuler à tout moment.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleGenerateAll}>
            <Sparkles className="h-4 w-4 mr-2" />
            Commencer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
