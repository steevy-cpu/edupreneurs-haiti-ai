import { useLessonActivitiesAsset } from '@/features/matieres/data/lessonAssets.queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Gamepad2, AlertCircle } from 'lucide-react';
import { InteractiveActivitiesEnhanced } from '@/components/InteractiveActivitiesEnhanced';

interface LessonActivitiesTabProps {
  lessonId: string;
  legacyActivitiesHtml?: string | null;
}

/**
 * Lazy-loading Activities Tab
 * Fetches activities content only when tab is active
 * Falls back to legacy HTML if no JSON asset exists
 */
export function LessonActivitiesTab({ 
  lessonId, 
  legacyActivitiesHtml 
}: LessonActivitiesTabProps) {
  const { data: activitiesAsset, isLoading, error } = useLessonActivitiesAsset(lessonId);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
            <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
            Activités Interactives
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-3 sm:p-6 flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">Erreur lors du chargement des activités</p>
        </CardContent>
      </Card>
    );
  }

  // Check for JSON asset first (Phase 2+ content)
  // TODO: Create ActivitiesRenderer when JSON format is implemented
  // For now, fallback to legacy HTML

  // Fallback to legacy HTML content
  if (legacyActivitiesHtml) {
    return (
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
            <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
            Activités Interactives
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <InteractiveActivitiesEnhanced 
            content={legacyActivitiesHtml}
            isLoading={false}
          />
        </CardContent>
      </Card>
    );
  }

  // Check if we have a JSON asset (for future use)
  if (activitiesAsset?.payload_json && activitiesAsset.status === 'published') {
    // TODO: Render from JSON when ActivitiesRenderer is ready
    return (
      <Card>
        <CardContent className="p-3 sm:p-6">
          <p className="text-muted-foreground text-sm sm:text-base">
            Activités en cours de chargement...
          </p>
        </CardContent>
      </Card>
    );
  }

  // No activities available
  return (
    <Card>
      <CardContent className="p-3 sm:p-6">
        <p className="text-muted-foreground text-sm sm:text-base">
          Aucune activité interactive disponible
        </p>
      </CardContent>
    </Card>
  );
}
