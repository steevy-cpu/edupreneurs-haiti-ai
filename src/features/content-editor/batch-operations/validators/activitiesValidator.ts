import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { parseActivities, ParsedActivity, ParsedQuizActivity, ParsedTrueFalseActivity } from "@/utils/quizActivityParsing";
import type { BatchOperationConfig, BatchLesson, OperationResult, BatchOperationTheme, BatchDialogConfig } from "../types";

// Activities validator theme
export const activitiesValidatorTheme: BatchOperationTheme = {
  color: 'purple',
  icon: Search,
  progressBgClass: 'bg-purple-500/5',
  borderClass: 'border-purple-500/20',
  textClass: 'text-purple-700',
  hoverClass: 'hover:bg-purple-500/10',
  buttonClass: '[&>div]:bg-purple-500 bg-purple-600 hover:bg-purple-700',
};

// Activities validator dialog config
export const activitiesValidatorDialogConfig: BatchDialogConfig = {
  title: 'Valider alignement activités',
  description: 'Cette action va analyser les activités interactives de {count} leçon(s) pour vérifier si elles sont alignées avec le contenu.',
  confirmLabel: 'Commencer',
  skipCheckboxLabel: 'Ignorer les leçons déjà validées',
  showSkipCheckbox: true,
};

// Create activities validator config
export const createActivitiesValidatorConfig = (): BatchOperationConfig => ({
  operationType: 'validate',
  contentType: 'activities',
  rateLimit: 1000,
  concurrency: 3,
  theme: activitiesValidatorTheme,
  messages: {
    empty: "Toutes les activités sont déjà validées ou liste vide!",
    progress: "Validation activités...",
    success: "✓ Toutes les {count} activités sont alignées avec le contenu!",
    partial: "{aligned} alignée(s), {misaligned} à régénérer{errors > 0 ? `, {errors} erreur(s)` : ''}",
    error: "⚠ {count} leçon(s) nécessite(nt) régénération d'activités",
    pauseInfo: "Validation arrêtée. Les progrès ont été sauvegardés.",
  },

  filterLesson: (lesson: BatchLesson, skipCompleted: boolean) => {
    // Must have valid activities content
    const hasActivities = !!lesson.activites_interactives && 
      lesson.activites_interactives.length > 50;
    if (!hasActivities) return false;
    
    // Skip already validated if checkbox is checked
    if (skipCompleted && lesson.last_activities_validated_at) return false;
    
    return true;
  },

  processLesson: async (lesson: BatchLesson): Promise<OperationResult> => {
    // Fetch full content if not already loaded
    let contenu = lesson.contenu;
    let exemples = lesson.exemples_exercices;
    let activitesInteractives = lesson.activites_interactives;
    
    if (!contenu || !activitesInteractives) {
      const { data: fullLesson, error: fetchError } = await supabase
        .from('lessons')
        .select('contenu, exemples_exercices, activites_interactives')
        .eq('id', lesson.id)
        .single();

      if (fetchError) throw new Error('Erreur de chargement');
      
      contenu = fullLesson?.contenu || '';
      exemples = fullLesson?.exemples_exercices || '';
      activitesInteractives = fullLesson?.activites_interactives;
    }

    if (!activitesInteractives) throw new Error('Pas d\'activités disponibles');

    // Parse activities
    const parseResult = parseActivities(activitesInteractives);
    
    if (parseResult.items.length === 0) throw new Error('Aucune activité trouvée');

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

    // Call validation edge function
    const { data, error } = await supabase.functions.invoke('validate-activities-content-alignment', {
      body: {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        gradeLevel: lesson.grade_level,
        contenu: contenu || '',
        exemples: exemples || '',
        activities
      }
    });

    if (error) throw new Error(error.message || 'Erreur de validation');

    return {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      success: true,
      aligned: data?.aligned ?? false,
      confidence: data?.confidence || 0,
      offContentCount: data?.offContentActivities?.length || 0,
      // Store full response for database update
      _rawData: data,
    } as OperationResult & { _rawData: any };
  },

  updateLesson: async (lessonId: string, result: OperationResult, existingDetails: any) => {
    const rawData = (result as any)._rawData;
    const aligned = result.aligned ?? false;
    const confidence = result.confidence ?? 0;

    // MERGE LOGIC: Preserve existing quiz validation
    const mergedDetails = {
      ...existingDetails,
      activities: {
        aligned,
        confidence,
        offContentActivities: rawData?.offContentActivities || [],
        summary: rawData?.summary || `${result.offContentCount === 0 ? 'Aligné' : 'Hors-contenu'}`,
        totalActivities: rawData?.totalActivities || 0,
        alignedCount: rawData?.alignedCount || 0,
      },
      activitiesValidatedAt: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('lessons')
      .update({
        needs_activities_regeneration: !aligned,
        activities_alignment_score: confidence,
        last_activities_validated_at: new Date().toISOString(),
        validation_details_json: mergedDetails,
      })
      .eq('id', lessonId);

    if (updateError) {
      console.error('Error updating lesson:', updateError);
      throw updateError;
    }
  },
});
