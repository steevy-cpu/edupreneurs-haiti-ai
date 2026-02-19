import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLessonQuizAsset, useLessonActivitiesAsset } from '@/features/matieres/data/lessonAssets.queries';
import type { LessonAsset } from '@/features/matieres/validation/validation-report.types';

export interface PublishBlockers {
  quizMissing: boolean;
  quizNotValidated: boolean;
  activitiesMissing: boolean;
  activitiesNotValidated: boolean;
}

export interface PublishGateStatus {
  canPublish: boolean;
  isLoading: boolean;
  blockers: PublishBlockers;
  quizAsset: LessonAsset | null;
  activitiesAsset: LessonAsset | null;
  /** Summary message for UI display */
  blockReason: string | null;
}

/**
 * Hook to check if a lesson can be published.
 *
 * Mirrors the check_lesson_publishable DB function exactly:
 *   1. Prefer validated lesson_assets records (quiz_final / activities kinds).
 *   2. Legacy fallback: if no validated asset exists, accept a non-empty HTML
 *      string in the lesson's own quiz_final / activites_interactives columns.
 *
 * Both the hook and the DB function must change together when the platform
 * migrates all lessons to validated lesson_assets (see future-work note in plan).
 */
export function useLessonPublishable(lessonId: string | undefined): PublishGateStatus {
  const { data: quizAsset, isLoading: quizLoading } = useLessonQuizAsset(lessonId);
  const { data: activitiesAsset, isLoading: activitiesLoading } = useLessonActivitiesAsset(lessonId);

  // Fetch legacy HTML fields — only used when no validated asset exists.
  // Lightweight select of two text fields; cached for 60 s so it doesn't
  // fire on every render during an editor session.
  const { data: legacyContent, isLoading: legacyLoading } = useQuery({
    queryKey: ['lesson-legacy-content', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      const { data, error } = await supabase
        .from('lessons')
        .select('quiz_final, activites_interactives')
        .eq('id', lessonId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
    staleTime: 60_000, // 1-min stale — legacy HTML doesn't change rapidly
  });

  const isLoading = quizLoading || activitiesLoading || legacyLoading;

  // Legacy fallback booleans — parallel to the DB function's IF NOT quiz_validated block
  const legacyQuizOk = !!(legacyContent?.quiz_final?.trim());
  const legacyActivitiesOk = !!(legacyContent?.activites_interactives?.trim());

  // Quiz is publishable if: has validated asset OR has legacy HTML content
  const quizMissing = !quizAsset && !legacyQuizOk;
  // Validated asset exists but is not in a publishable status → still a blocker
  const quizNotValidated = !!quizAsset && quizAsset.status !== 'validated' && quizAsset.status !== 'published';

  // Activities is publishable if: has validated asset OR has legacy HTML content
  const activitiesMissing = !activitiesAsset && !legacyActivitiesOk;
  const activitiesNotValidated = !!activitiesAsset && activitiesAsset.status !== 'validated' && activitiesAsset.status !== 'published';

  const blockers: PublishBlockers = {
    quizMissing,
    quizNotValidated,
    activitiesMissing,
    activitiesNotValidated,
  };

  // Can publish if no blockers
  const hasBlockers = quizMissing || quizNotValidated || activitiesMissing || activitiesNotValidated;
  const canPublish = !isLoading && !hasBlockers;

  // Generate human-readable block reason
  let blockReason: string | null = null;
  if (hasBlockers) {
    const reasons: string[] = [];
    if (quizMissing) reasons.push('Quiz manquant');
    else if (quizNotValidated) reasons.push('Quiz non validé');
    if (activitiesMissing) reasons.push('Activités manquantes');
    else if (activitiesNotValidated) reasons.push('Activités non validées');
    blockReason = reasons.join(', ');
  }

  return {
    canPublish,
    isLoading,
    blockers,
    quizAsset: quizAsset ?? null,
    activitiesAsset: activitiesAsset ?? null,
    blockReason,
  };
}

