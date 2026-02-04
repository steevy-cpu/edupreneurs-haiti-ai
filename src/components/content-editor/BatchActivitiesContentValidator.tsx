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
import { parseActivities, ParsedActivity, ParsedQuizActivity, ParsedTrueFalseActivity } from "@/utils/quizActivityParsing";

interface BatchActivitiesContentValidatorProps {
  lessons: any[];
  gradeLevel: string;
  onComplete: () => void;
  validatedCount?: number;
  totalWithActivities?: number;
}

interface ValidationResult {
  lessonId: string;
  lessonTitle: string;
  aligned: boolean;
  confidence: number;
  offContentCount: number;
  error?: string;
}

export const BatchActivitiesContentValidator = ({ 
  lessons, 
  gradeLevel, 
  onComplete,
  validatedCount = 0,
  totalWithActivities = 0
}: BatchActivitiesContentValidatorProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [currentLesson, setCurrentLesson] = useState<string>("");
  const [skipValidated, setSkipValidated] = useState(true);
  const abortRef = useRef(false);

  const lessonsToProcess = skipValidated 
    ? lessons.filter(l => !l.last_activities_validated_at)
    : lessons;

  const handleValidateAll = async () => {
    if (lessonsToProcess.length === 0) {
      toast.info("Toutes les activités sont déjà validées ou liste vide!");
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
          .select('contenu, exemples_exercices, activites_interactives')
          .eq('id', lesson.id)
          .single();

        if (fetchError) {
          throw new Error('Erreur de chargement');
        }

        if (!fullLesson?.activites_interactives) {
          throw new Error('Pas d\'activités disponibles');
        }

        // Parse activities using proven utility
        const parseResult = parseActivities(fullLesson.activites_interactives);
        
        if (parseResult.items.length === 0) {
          throw new Error('Aucune activité trouvée');
        }

        // Map activities to the format expected by the edge function
        const activities = parseResult.items.map((activity: ParsedActivity) => {
          if (activity.activityType === 'QUIZ') {
            const quizActivity = activity as ParsedQuizActivity;
            return {
              activityType: 'QUIZ' as const,
              question: quizActivity.question,
              options: quizActivity.options,
              correctAnswer: quizActivity.correctAnswer,
              explanation: quizActivity.explanation
            };
          } else {
            const tfActivity = activity as ParsedTrueFalseActivity;
            return {
              activityType: 'TRUE_FALSE' as const,
              statement: tfActivity.statement,
              isTrue: tfActivity.isTrue,
              explanation: tfActivity.explanation
            };
          }
        });

        // Call the validation edge function
        const { data, error } = await supabase.functions.invoke('validate-activities-content-alignment', {
          body: {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            gradeLevel: lesson.grade_level,
            contenu: fullLesson.contenu || '',
            exemples: fullLesson.exemples_exercices || '',
            activities
          }
        });

        if (error) {
          throw new Error(error.message || 'Erreur de validation');
        }

        const aligned = data?.aligned ?? false;
        const offContentCount = data?.offContentActivities?.length || 0;
        const confidence = data?.confidence || 0;

        // Prepare validation details to store full API response
        const validationDetails = {
          activities: {
            aligned,
            confidence,
            offContentActivities: data?.offContentActivities || [],
            summary: data?.summary || `${offContentCount === 0 ? 'Aligné' : 'Hors-contenu'}: ${aligned ? 'Oui' : 'Non'}`,
            totalActivities: data?.totalActivities || 0,
            alignedCount: data?.alignedCount || 0,
          },
          lastValidatedAt: new Date().toISOString(),
        };

        // Update the lesson with validation results
        const { error: updateError } = await supabase
          .from('lessons')
          .update({
            needs_activities_regeneration: !aligned,
            activities_alignment_score: confidence,
            last_activities_validated_at: new Date().toISOString(),
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
      toast.success(`✓ Toutes les ${alignedCount} activités sont alignées avec le contenu!`);
    } else if (alignedCount === 0 && offContentCount > 0) {
      toast.warning(`⚠ ${offContentCount} leçon${offContentCount > 1 ? 's' : ''} nécessite${offContentCount > 1 ? 'nt' : ''} régénération d'activités`);
    } else {
      toast.info(`${alignedCount} alignée${alignedCount > 1 ? 's' : ''}, ${offContentCount} à régénérer${errorCount > 0 ? `, ${errorCount} erreur${errorCount > 1 ? 's' : ''}` : ''}`);
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
      <div className="space-y-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
            <span>Validation activités...</span>
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
            className="h-2 [&>div]:bg-purple-500"
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
                {alignedCount} alignée{alignedCount > 1 ? 's' : ''}
              </span>
            )}
            {offContentCount > 0 && (
              <span className="flex items-center gap-1 text-purple-600">
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
          className="w-full border-purple-500/30 text-purple-700 hover:bg-purple-500/10 h-auto py-2"
        >
          <Search className="h-4 w-4 mr-2" />
          <div className="flex flex-col items-start text-left">
            <span>Valider alignement activités</span>
            {totalWithActivities > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {validatedCount}/{totalWithActivities} déjà validées ({Math.round((validatedCount/totalWithActivities)*100)}%)
              </span>
            )}
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Valider l'alignement des activités?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>📊 Statistiques pour {gradeLevel}</span>
                  <span>{validatedCount}/{totalWithActivities} validés</span>
                </div>
                <Progress value={(validatedCount / (totalWithActivities || 1)) * 100} className="h-1.5" />
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                  <div>• Total leçons: {totalWithActivities}</div>
                  <div>• Restantes: {totalWithActivities - validatedCount}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 py-1">
                <Checkbox 
                  id="skip-validated-activities" 
                  checked={skipValidated}
                  onCheckedChange={(checked) => setSkipValidated(checked === true)}
                />
                <label 
                  htmlFor="skip-validated-activities"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Ignorer les leçons déjà validées
                </label>
              </div>

              <p className="text-sm">
                Cette action va analyser les activités interactives de {lessonsToProcess.length} leçon{lessonsToProcess.length > 1 ? 's' : ''} 
                pour vérifier si elles sont alignées avec le contenu.
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
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Search className="h-4 w-4 mr-2" />
            Commencer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
