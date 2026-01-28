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
 * Validates that both quiz and activities assets exist and are validated.
 * Falls back gracefully for legacy lessons with HTML content.
 */
export function useLessonPublishable(lessonId: string | undefined): PublishGateStatus {
  const { data: quizAsset, isLoading: quizLoading } = useLessonQuizAsset(lessonId);
  const { data: activitiesAsset, isLoading: activitiesLoading } = useLessonActivitiesAsset(lessonId);

  const isLoading = quizLoading || activitiesLoading;

  // Check quiz status
  const quizMissing = !quizAsset;
  const quizNotValidated = !!quizAsset && quizAsset.status !== 'validated' && quizAsset.status !== 'published';

  // Check activities status
  const activitiesMissing = !activitiesAsset;
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
