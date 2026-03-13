/**
 * @file useBatchPublishing.ts
 * @description Manages publishing of individual and bulk-validated lessons.
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { LessonValidation } from "@/types/batch-generation.types";

/** Configuration passed from the parent orchestrator */
export interface BatchPublishingConfig {
  validations: LessonValidation[];
}

export const useBatchPublishing = (config: BatchPublishingConfig) => {
  const { validations } = config;

  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [publishedLessons, setPublishedLessons] = useState<Set<string>>(new Set());

  /** Publish a single lesson by setting is_published and workflow_status */
  const publishLesson = useCallback(async (lessonId: string) => {
    setIsPublishing(lessonId);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ is_published: true, workflow_status: 'published' })
        .eq('id', lessonId);
      
      if (error) throw error;
      
      setPublishedLessons(prev => new Set([...prev, lessonId]));
      toast.success("Leçon publiée avec succès");
    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error("Erreur lors de la publication: " + error.message);
    } finally {
      setIsPublishing(null);
    }
  }, []);

  /** Publish all valid lessons (no errors, has content, not already published) */
  const publishAllValidLessons = useCallback(async () => {
    const validLessonIds = validations
      .filter(v => v.quizErrors.length === 0 && v.activityErrors.length === 0 && 
                   (v.quizParsed.length > 0 || v.activitiesParsed.length > 0) &&
                   !publishedLessons.has(v.lesson.id))
      .map(v => v.lesson.id);
    
    if (validLessonIds.length === 0) {
      toast.error("Aucune leçon valide à publier");
      return;
    }
    
    setIsPublishing('bulk');
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ is_published: true, workflow_status: 'published' })
        .in('id', validLessonIds);
      
      if (error) throw error;
      
      setPublishedLessons(prev => new Set([...prev, ...validLessonIds]));
      toast.success(`${validLessonIds.length} leçon(s) publiée(s)`);
    } catch (error: any) {
      console.error('Bulk publish error:', error);
      toast.error("Erreur lors de la publication: " + error.message);
    } finally {
      setIsPublishing(null);
    }
  }, [validations, publishedLessons]);

  /** Count of valid unpublished lessons */
  const validLessonsCount = validations.filter(
    v => v.quizErrors.length === 0 && v.activityErrors.length === 0 && 
         (v.quizParsed.length > 0 || v.activitiesParsed.length > 0) &&
         !publishedLessons.has(v.lesson.id)
  ).length;

  return {
    isPublishing,
    publishedLessons,
    publishLesson,
    publishAllValidLessons,
    validLessonsCount,
  };
};
