import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PublishBlockers, PublishGateStatus } from './useLessonPublishable';

// Simplified asset type for batch queries (avoids strict LessonAsset typing)
interface BatchAsset {
  id: string;
  lesson_id: string;
  kind: string;
  status: string | null;
}

interface BatchPublishStatus {
  [lessonId: string]: PublishGateStatus;
}

/**
 * Hook to fetch publishability status for multiple lessons in a single query.
 * More efficient than calling useLessonPublishable for each lesson individually.
 */
export function useBatchLessonPublishable(lessonIds: string[]) {
  return useQuery({
    queryKey: ['batch-lesson-publishable', lessonIds.sort().join(',')],
    queryFn: async (): Promise<BatchPublishStatus> => {
      if (lessonIds.length === 0) return {};

      const { data: assets, error } = await supabase
        .from('lesson_assets')
        .select('id, lesson_id, kind, status')
        .in('lesson_id', lessonIds)
        .in('kind', ['quiz_final', 'activities']);

      if (error) throw error;

      const result: BatchPublishStatus = {};

      for (const lessonId of lessonIds) {
        const lessonAssets = (assets || []) as BatchAsset[];
        const filtered = lessonAssets.filter(a => a.lesson_id === lessonId);
        const quizAsset = filtered.find(a => a.kind === 'quiz_final');
        const activitiesAsset = filtered.find(a => a.kind === 'activities');

        const quizMissing = !quizAsset;
        const quizNotValidated = !!quizAsset && 
          quizAsset.status !== 'validated' && quizAsset.status !== 'published';
        const activitiesMissing = !activitiesAsset;
        const activitiesNotValidated = !!activitiesAsset && 
          activitiesAsset.status !== 'validated' && activitiesAsset.status !== 'published';

        const blockers: PublishBlockers = {
          quizMissing,
          quizNotValidated,
          activitiesMissing,
          activitiesNotValidated,
        };

        const hasBlockers = quizMissing || quizNotValidated || 
                           activitiesMissing || activitiesNotValidated;

        // Build block reason
        let blockReason: string | null = null;
        if (hasBlockers) {
          const reasons: string[] = [];
          if (quizMissing) reasons.push('Quiz manquant');
          else if (quizNotValidated) reasons.push('Quiz non validé');
          if (activitiesMissing) reasons.push('Activités manquantes');
          else if (activitiesNotValidated) reasons.push('Activités non validées');
          blockReason = reasons.join(', ');
        }

        result[lessonId] = {
          canPublish: !hasBlockers,
          isLoading: false,
          blockers,
          quizAsset: null, // Not needed for batch validation display
          activitiesAsset: null,
          blockReason,
        };
      }

      return result;
    },
    enabled: lessonIds.length > 0,
    staleTime: 30000,
  });
}
