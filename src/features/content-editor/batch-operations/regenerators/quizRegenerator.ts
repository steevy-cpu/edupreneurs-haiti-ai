import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { BatchOperationConfig, BatchLesson, OperationResult, BatchOperationTheme, BatchDialogConfig, QuizProvider } from "../types";

// Quiz regenerator theme
export const quizRegeneratorTheme: BatchOperationTheme = {
  color: 'primary',
  icon: RefreshCw,
  progressBgClass: 'bg-primary/5',
  borderClass: 'border-primary/20',
  textClass: 'text-primary',
  hoverClass: 'hover:bg-primary/10',
  buttonClass: '[&>div]:bg-primary bg-primary hover:bg-primary/90',
};

// Quiz regenerator dialog config
export const quizRegeneratorDialogConfig: BatchDialogConfig = {
  title: 'Régénérer quizzes flaggés',
  description: 'Cette action va régénérer {count} quiz(s) en utilisant le contenu de la leçon pour créer des questions alignées.',
  confirmLabel: 'Régénérer tout',
  skipCheckboxLabel: '',
  showSkipCheckbox: false,
};

// Create quiz regenerator config
export const createQuizRegeneratorConfig = (provider: QuizProvider = 'lovable'): BatchOperationConfig => ({
  operationType: 'regenerate',
  contentType: 'quiz',
  rateLimit: provider === 'quizgecko' ? 3000 : 1500,
  concurrency: provider === 'quizgecko' ? 1 : 2,
  theme: quizRegeneratorTheme,
  messages: {
    empty: "Aucun quiz à régénérer!",
    progress: "Régénération en cours...",
    success: "✓ {count} quiz(s) régénéré(s) avec succès!",
    partial: "{success} régénéré(s), {errors} erreur(s)",
    error: "✗ Échec de la régénération de tous les quizzes",
    pauseInfo: "Régénération arrêtée. Les progrès ont été sauvegardés.",
  },

  filterLesson: (lesson: BatchLesson, _skipCompleted: boolean) => {
    // Must need regeneration and have been validated
    return !!(lesson.needs_quiz_regeneration && lesson.last_content_validated_at);
  },

  processLesson: async (lesson: BatchLesson): Promise<OperationResult> => {
    // Fetch full content
    const { data: fullLesson, error: fetchError } = await supabase
      .from('lessons')
      .select('contenu, exemples_exercices, grade_level, subjects(name)')
      .eq('id', lesson.id)
      .single();

    if (fetchError) throw new Error('Erreur de chargement');

    const edgeFunctionName = provider === 'quizgecko' ? 'generate-quiz-quizgecko' : 'generate-quiz-final';

    const { data, error } = await supabase.functions.invoke(edgeFunctionName, {
      body: {
        lessonTitle: lesson.title,
        contenu: fullLesson.contenu || '',
        exemplesExercices: fullLesson.exemples_exercices || '',
        gradeLevel: fullLesson.grade_level || lesson.grade_level,
        subject: fullLesson.subjects?.name || 'Matière',
      }
    });

    if (error) throw new Error(error.message || 'Erreur de génération');
    if (!data?.quizContent) throw new Error('Pas de contenu quiz retourné');

    return {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      success: true,
      _quizContent: data.quizContent,
    } as OperationResult & { _quizContent: string };
  },

  updateLesson: async (lessonId: string, result: OperationResult, existingDetails: any) => {
    const quizContent = (result as any)._quizContent;

    // Clear quiz validation from merged details, preserve activities
    const mergedDetails = existingDetails ? {
      ...existingDetails,
      quiz: undefined,
      quizValidatedAt: undefined,
    } : null;

    const { error: updateError } = await supabase
      .from('lessons')
      .update({
        quiz_final: quizContent,
        needs_quiz_regeneration: false,
        content_alignment_score: null,
        last_content_validated_at: null,
        validation_details_json: mergedDetails,
      })
      .eq('id', lessonId);

    if (updateError) throw new Error('Erreur de mise à jour');
  },
});
