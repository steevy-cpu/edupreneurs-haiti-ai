import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { 
  BatchOperationConfig, 
  BatchOperationTheme, 
  BatchDialogConfig,
  BatchLesson,
  OperationResult 
} from "../types";

// Theme for content generation (blue/indigo to differentiate from quiz green)
export const contentGeneratorTheme: BatchOperationTheme = {
  color: 'primary',
  icon: BookOpen,
  progressBgClass: 'bg-blue-500/5',
  borderClass: 'border-blue-500/20',
  textClass: 'text-blue-600',
  hoverClass: 'hover:bg-blue-500/10',
  buttonClass: 'bg-blue-600 hover:bg-blue-700',
};

// Dialog configuration for content generation
export const contentGeneratorDialogConfig: BatchDialogConfig = {
  title: 'Générer le contenu manquant',
  description: 'Cette opération va générer automatiquement le contenu (objectif, introduction, contenu, exemples, images et vidéos YouTube) pour {count} leçon(s). Les résultats sont sauvegardés après chaque génération.',
  confirmLabel: 'Commencer la génération',
  skipCheckboxLabel: 'Ignorer les leçons avec contenu partiel',
  showSkipCheckbox: false,
};

// Placeholder patterns that should not count as real content
const PLACEHOLDER_PATTERNS = [
  'contenu à venir...', 'contenu a venir...',
  'exercices à venir...', 'exercices a venir...',
];

const isPlaceholderOrEmpty = (field?: string | null): boolean => {
  if (!field || field.trim().length < 10) return true;
  return PLACEHOLDER_PATTERNS.includes(field.trim().toLowerCase());
};

// Helper: check if a lesson is missing core content (supports both flag-based and raw text)
export const isLessonMissingContent = (lesson: BatchLesson): boolean => {
  // Flag-based check (from lesson_content_flags view)
  if ('has_objectif' in lesson || 'has_contenu' in lesson) {
    return !(lesson as any).has_objectif || !(lesson as any).has_introduction || 
           !(lesson as any).has_contenu || !(lesson as any).has_exemples;
  }
  // Fallback: raw text check with placeholder detection
  return isPlaceholderOrEmpty(lesson.objectif) || isPlaceholderOrEmpty(lesson.introduction) ||
         isPlaceholderOrEmpty(lesson.contenu) || isPlaceholderOrEmpty(lesson.exemples_exercices);
};

// Factory function for content generator config
export const createContentGeneratorConfig = (): BatchOperationConfig => ({
  operationType: 'regenerate',
  contentType: 'quiz', // reusing type since batch system only has quiz/activities
  
  filterLesson: (lesson: BatchLesson, _skipCompleted: boolean) => {
    return isLessonMissingContent(lesson);
  },
  
  processLesson: async (lesson: BatchLesson): Promise<OperationResult> => {
    // Fetch subject info for the lesson
    const { data: fullLesson, error: fetchError } = await supabase
      .from('lessons')
      .select('subjects(name, slug)')
      .eq('id', lesson.id)
      .single();

    if (fetchError) {
      throw new Error('Erreur de chargement de la leçon');
    }

    // Create a generation job (same as SingleLessonGenerator)
    const config = {
      selectedSections: ['objectif', 'introduction', 'contenu', 'exemples_exercices'],
      wordCounts: {
        objectif: 100,
        introduction: 200,
        contenu: 800,
        exemples_exercices: 500,
      },
      generateQuiz: false,
      generateVideos: true,
      generateAudio: false,
      imageGenerationModel: 'lovable' as const,
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    // Insert the job
    const { data: job, error: jobError } = await supabase
      .from('ai_generation_jobs')
      .insert({
        lesson_id: lesson.id,
        job_type: 'batch_content_generation',
        config: config as any,
        status: 'pending',
        created_by: user.id,
        progress: { current: 0, total: config.selectedSections.length, sections: [] },
      })
      .select()
      .single();

    if (jobError || !job) {
      throw new Error('Erreur de création du job');
    }

    // Trigger the edge function
    const { error: invokeError } = await supabase.functions.invoke('process-ai-job', {
      body: { jobId: job.id }
    });

    if (invokeError) {
      throw new Error(`Erreur d'exécution: ${invokeError.message}`);
    }

    // Poll for completion (max 5 minutes)
    const maxWait = 300000;
    const pollInterval = 3000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const { data: updatedJob } = await supabase
        .from('ai_generation_jobs')
        .select('status, error_message, result_content')
        .eq('id', job.id)
        .single();

      if (!updatedJob) continue;

      if (updatedJob.status === 'completed') {
        return {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          success: true,
        };
      }

      if (updatedJob.status === 'failed') {
        throw new Error(updatedJob.error_message || 'La génération a échoué');
      }
    }

    throw new Error('Timeout: la génération a pris trop de temps');
  },
  
  updateLesson: async (_lessonId: string, _result: any) => {
    // The process-ai-job edge function already saves the content to the lesson
    // No additional update needed
  },
  
  theme: contentGeneratorTheme,
  
  messages: {
    empty: "Toutes les leçons ont déjà du contenu!",
    progress: "Génération de contenu en cours...",
    success: "{count} contenu(s) généré(s) avec succès!",
    partial: "{success} réussi(s), {errors} échec(s)",
    error: "Échec de génération pour tous les contenus",
    pauseInfo: "Génération annulée. Progrès sauvegardé.",
  },
  
  rateLimit: 3000,
  concurrency: 1,
});
