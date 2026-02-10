import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { 
  BatchOperationConfig, 
  BatchOperationTheme, 
  BatchDialogConfig,
  BatchLesson,
  OperationResult,
  QuizProvider
} from "../types";

// Theme for quiz generation
export const quizGeneratorTheme: BatchOperationTheme = {
  color: 'primary',
  icon: Sparkles,
  progressBgClass: 'bg-primary/5',
  borderClass: 'border-primary/20',
  textClass: 'text-primary',
  hoverClass: 'hover:bg-primary/10',
  buttonClass: 'bg-primary hover:bg-primary/90',
};

// Dialog configuration for quiz generation
export const quizGeneratorDialogConfig: BatchDialogConfig = {
  title: 'Générer tous les quizzes manquants',
  description: 'Cette opération va générer automatiquement les quizzes pour {count} leçon(s). Les résultats sont sauvegardés après chaque génération.',
  confirmLabel: 'Commencer',
  skipCheckboxLabel: 'Ignorer les leçons avec quiz existant',
  showSkipCheckbox: false, // Not needed since we only target missing quizzes
};

// Factory function for quiz generator config
export const createQuizGeneratorConfig = (provider: QuizProvider = 'lovable'): BatchOperationConfig => ({
  operationType: 'regenerate',
  contentType: 'quiz',
  
  filterLesson: (lesson: BatchLesson, _skipCompleted: boolean) => {
    // Always process - we're generating missing quizzes
    return !hasValidQuiz(lesson);
  },
  
  processLesson: async (lesson: BatchLesson): Promise<OperationResult> => {
    // Fetch full lesson content for better quiz generation
    const { data: fullLesson, error: fetchError } = await supabase
      .from('lessons')
      .select('contenu, exemples_exercices, subjects(name, slug)')
      .eq('id', lesson.id)
      .single();

    if (fetchError) {
      throw new Error('Erreur de chargement');
    }

    const edgeFunctionName = provider === 'quizgecko' ? 'generate-quiz-quizgecko' : 'generate-quiz-final';

    const { data, error } = await supabase.functions.invoke(edgeFunctionName, {
      body: {
        lessonTitle: lesson.title,
        lessonSlug: lesson.slug,
        subjectSlug: fullLesson?.subjects?.slug || '',
        contenu: fullLesson?.contenu || '',
        exemplesExercices: fullLesson?.exemples_exercices || '',
        gradeLevel: lesson.grade_level,
        subject: fullLesson?.subjects?.name || '',
        outputFormat: 'html',
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

    return {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      success: true,
      quizContent: data.quizContent,
    } as OperationResult & { quizContent: string };
  },
  
  updateLesson: async (lessonId: string, result: any) => {
    const { error: updateError } = await supabase
      .from('lessons')
      .update({ quiz_final: result.quizContent })
      .eq('id', lessonId);

    if (updateError) {
      throw new Error('Erreur de sauvegarde');
    }
  },
  
  theme: quizGeneratorTheme,
  
  messages: {
    empty: "Aucune leçon à générer!",
    progress: "Génération en cours...",
    success: "{count} quiz(s) généré(s) avec succès!",
    partial: "{success} réussi(s), {errors} échec(s)",
    error: "Échec de génération pour tous les quizzes",
    pauseInfo: "Génération annulée. Progrès sauvegardé.",
  },
  
  rateLimit: provider === 'quizgecko' ? 3000 : 1500,
});

// Helper function to check if a lesson has a valid quiz
const hasValidQuiz = (lesson: BatchLesson): boolean => {
  if (!lesson.quiz_final) return false;
  return lesson.quiz_final.includes('quiz-question') || 
         lesson.quiz_final.includes('quiz-container');
};
