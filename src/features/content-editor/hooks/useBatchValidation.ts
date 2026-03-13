/**
 * @file useBatchValidation.ts
 * @description Manages batch quiz/activity validation — parsing, stats, CSV export,
 * and the combined generate-then-validate workflow.
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseQuizQuestions, parseActivities } from "@/utils/quizActivityParsing";
import type { LessonValidation, ValidationStats } from "@/types/batch-generation.types";

/** Configuration passed from the parent orchestrator */
export interface BatchValidationConfig {
  gradeLevel: string;
  subject: string;
  series: string[];
  isNS3OrNS4: boolean;
  startGeneration: () => Promise<void>;
  setActiveInnerTab: (tab: 'generation' | 'validation') => void;
  fetchLessons: () => Promise<any[]>;
}

export const useBatchValidation = (config: BatchValidationConfig) => {
  const { gradeLevel, subject, series, isNS3OrNS4, startGeneration, setActiveInnerTab, fetchLessons } = config;

  // Validation states
  const [validations, setValidations] = useState<LessonValidation[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [validationStats, setValidationStats] = useState<ValidationStats>({
    total: 0, quizValid: 0, quizInvalid: 0, activitiesValid: 0, activitiesInvalid: 0,
  });
  const [isGeneratingThenValidating, setIsGeneratingThenValidating] = useState(false);

  /** Run validation on all lessons matching current filters */
  const runValidation = useCallback(async () => {
    setIsValidating(true);
    setValidations([]);
    setActiveInnerTab('validation');

    try {
      let query = supabase
        .from('lessons')
        .select('id, title, slug, grade_level, quiz_final, activites_interactives, subjects(id, name, series)')
        .or('quiz_final.neq.null,activites_interactives.neq.null');

      if (gradeLevel !== 'all') {
        query = query.eq('grade_level', gradeLevel);
      }

      if (subject !== 'all') {
        query = query.eq('subject_id', subject);
      }

      const { data: lessonsData, error } = await query.order('title');

      if (error) throw error;

      // Client-side series filter for NS3/NS4
      let filteredLessons = lessonsData || [];
      if (isNS3OrNS4 && series.length > 0 && subject === "all") {
        filteredLessons = filteredLessons.filter(lesson => 
          lesson.subjects && series.includes((lesson.subjects as any).series)
        );
      }

      const results: LessonValidation[] = [];
      let quizValid = 0, quizInvalid = 0, activitiesValid = 0, activitiesInvalid = 0;

      for (const lesson of filteredLessons) {
        // Use imported parsing functions for consistent validation
        const quizResult = lesson.quiz_final ? parseQuizQuestions(lesson.quiz_final) : { items: [], errors: [] };
        const activityResult = lesson.activites_interactives ? parseActivities(lesson.activites_interactives) : { items: [], errors: [] };

        if (lesson.quiz_final) {
          if (quizResult.items.length > 0 && quizResult.errors.length === 0) quizValid++;
          else quizInvalid++;
        }

        if (lesson.activites_interactives) {
          if (activityResult.items.length > 0 && activityResult.errors.length === 0) activitiesValid++;
          else activitiesInvalid++;
        }

        results.push({
          lesson: {
            id: lesson.id,
            title: lesson.title,
            slug: lesson.slug,
            grade_level: lesson.grade_level,
            subject_name: (lesson.subjects as any)?.name || 'N/A',
          },
          quizParsed: quizResult.items,
          quizErrors: quizResult.errors,
          activitiesParsed: activityResult.items,
          activityErrors: activityResult.errors,
          originalActivityContent: lesson.activites_interactives,
          originalQuizContent: lesson.quiz_final,
        });
      }

      setValidations(results);
      setValidationStats({ total: results.length, quizValid, quizInvalid, activitiesValid, activitiesInvalid });
      toast.success(`Validation terminée: ${results.length} leçons analysées`);
    } catch (error) {
      console.error('Validation error:', error);
      toast.error("Erreur lors de la validation");
    } finally {
      setIsValidating(false);
    }
  }, [gradeLevel, subject, series, isNS3OrNS4, setActiveInnerTab]);

  /** Run generation followed by validation in sequence */
  const generateThenValidate = useCallback(async () => {
    setIsGeneratingThenValidating(true);
    try {
      await startGeneration();
      // Wait for generation to complete fully before validating
      await new Promise(resolve => setTimeout(resolve, 2000));
      await runValidation();
      toast.success("Génération et validation terminées!");
    } catch (error) {
      console.error('Generate then validate error:', error);
      toast.error("Erreur lors de l'opération");
    } finally {
      setIsGeneratingThenValidating(false);
    }
  }, [startGeneration, runValidation]);

  /** Show confirmation for large batches before generate-then-validate */
  const handleGenerateThenValidate = useCallback(async () => {
    const lessons = await fetchLessons();
    
    if (!lessons || lessons.length === 0) {
      toast.error("Aucune leçon trouvée avec ces critères");
      return;
    }

    if (lessons.length > 10) {
      return { needsConfirmation: true, lessonCount: lessons.length };
    }

    await generateThenValidate();
    return { needsConfirmation: false, lessonCount: lessons.length };
  }, [fetchLessons, generateThenValidate]);

  /** Export validation results as CSV */
  const exportValidationCSV = useCallback(() => {
    const headers = ['Leçon', 'Matière', 'Niveau', 'Quiz Questions', 'Quiz Erreurs', 'Activités', 'Erreurs Activités'];
    const rows = validations.map(v => [
      v.lesson.title,
      v.lesson.subject_name,
      v.lesson.grade_level,
      v.quizParsed.length,
      v.quizErrors.join('; '),
      v.activitiesParsed.length,
      v.activityErrors.join('; '),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-quiz-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  }, [validations]);

  /** Toggle expanded state for a lesson in the validation list */
  const toggleExpanded = useCallback((lessonId: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  }, []);

  return {
    validations, setValidations,
    isValidating,
    validationStats,
    isGeneratingThenValidating,
    expandedLessons,
    runValidation,
    generateThenValidate,
    handleGenerateThenValidate,
    exportValidationCSV,
    toggleExpanded,
  };
};
