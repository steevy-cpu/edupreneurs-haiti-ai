import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { BatchOperationConfig, BatchLesson, OperationResult, BatchOperationTheme, BatchDialogConfig } from "../types";

// Activities regenerator theme
export const activitiesRegeneratorTheme: BatchOperationTheme = {
  color: 'purple',
  icon: RefreshCw,
  progressBgClass: 'bg-purple-500/5',
  borderClass: 'border-purple-500/20',
  textClass: 'text-purple-700',
  hoverClass: 'hover:bg-purple-500/10',
  buttonClass: '[&>div]:bg-purple-500 bg-purple-600 hover:bg-purple-700',
};

// Activities regenerator dialog config
export const activitiesRegeneratorDialogConfig: BatchDialogConfig = {
  title: 'Régénérer activités flaggées',
  description: 'Cette action va régénérer {count} activité(s) en utilisant le contenu de la leçon pour créer des activités alignées.',
  confirmLabel: 'Régénérer tout',
  skipCheckboxLabel: '',
  showSkipCheckbox: false,
};

// Create activities regenerator config
export const createActivitiesRegeneratorConfig = (): BatchOperationConfig => ({
  operationType: 'regenerate',
  contentType: 'activities',
  rateLimit: 2000,
  theme: activitiesRegeneratorTheme,
  messages: {
    empty: "Aucune activité à régénérer!",
    progress: "Régénération en cours...",
    success: "✓ {count} activité(s) régénérée(s) avec succès!",
    partial: "{success} régénérée(s), {errors} erreur(s)",
    error: "✗ Échec de la régénération de toutes les activités",
    pauseInfo: "Régénération arrêtée. Les progrès ont été sauvegardés.",
  },

  filterLesson: (lesson: BatchLesson, _skipCompleted: boolean) => {
    // Must need regeneration and have been validated
    return !!(lesson.needs_activities_regeneration && lesson.last_activities_validated_at);
  },

  processLesson: async (lesson: BatchLesson): Promise<OperationResult> => {
    // Fetch full content
    const { data: fullLesson, error: fetchError } = await supabase
      .from('lessons')
      .select('contenu, exemples_exercices, grade_level, subjects(name)')
      .eq('id', lesson.id)
      .single();

    if (fetchError) throw new Error('Erreur de chargement');

    // Call activities generation edge function
    const { data, error } = await supabase.functions.invoke('generate-interactive-activities', {
      body: {
        exercisesContent: fullLesson.exemples_exercices || fullLesson.contenu || '',
        lessonTitle: lesson.title,
        gradeLevel: fullLesson.grade_level || lesson.grade_level,
        subject: fullLesson.subjects?.name || 'Matière',
      }
    });

    if (error) throw new Error(error.message || 'Erreur de génération');
    if (!data?.content) throw new Error('Pas de contenu activités retourné');

    return {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      success: true,
      _activitiesContent: data.content,
    } as OperationResult & { _activitiesContent: string };
  },

  updateLesson: async (lessonId: string, result: OperationResult, existingDetails: any) => {
    const activitiesContent = (result as any)._activitiesContent;

    // Clear activities validation from merged details, preserve quiz
    const mergedDetails = existingDetails ? {
      ...existingDetails,
      activities: undefined,
      activitiesValidatedAt: undefined,
    } : null;

    const { error: updateError } = await supabase
      .from('lessons')
      .update({
        activites_interactives: activitiesContent,
        needs_activities_regeneration: false,
        activities_alignment_score: null,
        last_activities_validated_at: null,
        validation_details_json: mergedDetails,
      })
      .eq('id', lessonId);

    if (updateError) throw new Error('Erreur de mise à jour');
  },
});
