/**
 * @file useBatchRegeneration.ts
 * @description Manages regeneration of invalid quiz/activity content —
 * AI-powered correction with preview before save.
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseQuizQuestions, parseActivities } from "@/utils/quizActivityParsing";
import type { LessonGenerationStatus, LessonValidation, RegenerationPreview } from "@/types/batch-generation.types";

/** Configuration passed from the parent orchestrator */
export interface BatchRegenerationConfig {
  allLessons: any[];
  lessonStatuses: LessonGenerationStatus[];
  validations: LessonValidation[];
  setValidations: React.Dispatch<React.SetStateAction<LessonValidation[]>>;
  generateLessonSections: (lesson: any, index: number) => Promise<void>;
}

export const useBatchRegeneration = (config: BatchRegenerationConfig) => {
  const { allLessons, lessonStatuses, validations, setValidations, generateLessonSections } = config;

  // Regeneration states
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [regenerationPreview, setRegenerationPreview] = useState<RegenerationPreview | null>(null);
  const [isSavingRegeneration, setIsSavingRegeneration] = useState(false);

  /** Re-run generation for a single lesson by its ID */
  const handleRegenerateSingleLesson = useCallback(async (lessonId: string) => {
    const lesson = allLessons.find(l => l.id === lessonId) || lessonStatuses.find(l => l.lessonId === lessonId);
    if (!lesson) {
      toast.error("Leçon non trouvée");
      return;
    }

    // Find the index in lessonStatuses for status tracking
    const index = lessonStatuses.findIndex(l => l.lessonId === lessonId);
    if (index === -1) return;

    const lessonData = allLessons.find(l => l.id === lessonId);
    if (lessonData) {
      await generateLessonSections(lessonData, index);
      toast.success("Régénération terminée");
    }
  }, [allLessons, lessonStatuses, generateLessonSections]);

  /** Use AI to fix invalid quiz content and prepare a preview */
  const regenerateQuiz = useCallback(async (lessonId: string) => {
    setIsRegenerating(lessonId);
    
    const validation = validations.find(v => v.lesson.id === lessonId);
    if (!validation) {
      toast.error("Leçon non trouvée");
      setIsRegenerating(null);
      return;
    }

    try {
      // Prefer AI validation issues; fall back to parsing errors
      const issues = validation.aiValidation?.issues || 
        validation.quizParsed.map((_, idx) => ({
          questionIndex: idx,
          issue: validation.quizErrors[0] || "Format ou contenu à vérifier"
        })).slice(0, Math.max(validation.quizErrors.length, 1));

      const { data, error } = await supabase.functions.invoke('fix-invalid-quiz', {
        body: {
          lessonId,
          lessonTitle: validation.lesson.title,
          originalContent: validation.originalQuizContent,
          questions: validation.quizParsed,
          issues,
          needsFullRegeneration: validation.quizParsed.length === 0,
          subject: validation.lesson.subject_name,
          gradeLevel: validation.lesson.grade_level,
          parsingErrors: validation.quizErrors,
        }
      });

      if (error) throw error;

      setRegenerationPreview({
        lessonId,
        lessonTitle: validation.lesson.title,
        type: 'quiz',
        correctedItems: data.correctedQuestions || [],
        newContent: data.newContent || data.newMarkdownContent || '',
        issuesFixed: data.issuesFixed || data.correctedQuestions?.filter((q: any) => q.wasFixed)?.length || 0,
      });

      toast.success("Corrections générées - vérifiez avant de sauvegarder");
    } catch (error: any) {
      console.error('Quiz regeneration error:', error);
      toast.error("Erreur lors de la régénération: " + error.message);
    } finally {
      setIsRegenerating(null);
    }
  }, [validations]);

  /** Use AI to fix invalid activity content and prepare a preview */
  const regenerateActivities = useCallback(async (lessonId: string) => {
    setIsRegenerating(lessonId);
    
    const validation = validations.find(v => v.lesson.id === lessonId);
    if (!validation) {
      toast.error("Leçon non trouvée");
      setIsRegenerating(null);
      return;
    }

    try {
      const issues = validation.activityAIValidation?.issues || 
        validation.activitiesParsed.map((_, idx) => ({
          activityIndex: idx,
          issue: validation.activityErrors[0] || "Format ou contenu à vérifier"
        })).slice(0, Math.max(validation.activityErrors.length, 1));

      const { data, error } = await supabase.functions.invoke('fix-invalid-activities', {
        body: {
          lessonId,
          lessonTitle: validation.lesson.title,
          originalContent: validation.originalActivityContent,
          activities: validation.activitiesParsed,
          issues,
          needsFullRegeneration: validation.activitiesParsed.length === 0,
          subject: validation.lesson.subject_name,
          gradeLevel: validation.lesson.grade_level,
          parsingErrors: validation.activityErrors,
        }
      });

      if (error) throw error;

      setRegenerationPreview({
        lessonId,
        lessonTitle: validation.lesson.title,
        type: 'activity',
        correctedItems: data.correctedActivities || [],
        newContent: data.newContent || data.newMarkdownContent || '',
        issuesFixed: data.issuesFixed || data.correctedActivities?.filter((a: any) => a.wasFixed)?.length || 0,
      });

      toast.success("Corrections générées - vérifiez avant de sauvegarder");
    } catch (error: any) {
      console.error('Activity regeneration error:', error);
      toast.error("Erreur lors de la régénération: " + error.message);
    } finally {
      setIsRegenerating(null);
    }
  }, [validations]);

  /** Save corrected content from regeneration preview to the database */
  const saveRegeneratedContent = useCallback(async () => {
    if (!regenerationPreview) return;

    setIsSavingRegeneration(true);
    try {
      const isQuiz = regenerationPreview.type === 'quiz';
      const updatePayload: Record<string, any> = {
        [isQuiz ? 'quiz_final' : 'activites_interactives']: regenerationPreview.newContent
      };
      
      // Clear regeneration flags and alignment scores
      if (isQuiz) {
        updatePayload.needs_quiz_regeneration = false;
        updatePayload.content_alignment_score = null;
      } else {
        updatePayload.needs_activities_regeneration = false;
        updatePayload.activities_alignment_score = null;
      }
      
      const { error } = await supabase
        .from('lessons')
        .update(updatePayload)
        .eq('id', regenerationPreview.lessonId);

      if (error) throw error;

      // Update local validation state to reflect the fix
      setValidations(prev => prev.map(v => {
        if (v.lesson.id !== regenerationPreview.lessonId) return v;

        if (regenerationPreview.type === 'quiz') {
          const parsed = parseQuizQuestions(regenerationPreview.newContent);
          return {
            ...v,
            quizParsed: parsed.items,
            quizErrors: parsed.errors,
            originalQuizContent: regenerationPreview.newContent,
          };
        } else {
          const parsed = parseActivities(regenerationPreview.newContent);
          return {
            ...v,
            activitiesParsed: parsed.items,
            activityErrors: parsed.errors,
            originalActivityContent: regenerationPreview.newContent,
          };
        }
      }));

      toast.success("Contenu corrigé sauvegardé avec succès");
      setRegenerationPreview(null);
    } catch (error: any) {
      console.error('Save regeneration error:', error);
      toast.error("Erreur lors de la sauvegarde: " + error.message);
    } finally {
      setIsSavingRegeneration(false);
    }
  }, [regenerationPreview, setValidations]);

  return {
    isRegenerating,
    regenerationPreview, setRegenerationPreview,
    isSavingRegeneration,
    handleRegenerateSingleLesson,
    regenerateQuiz,
    regenerateActivities,
    saveRegeneratedContent,
  };
};
