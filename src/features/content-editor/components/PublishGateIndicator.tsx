import { CheckCircle2, AlertCircle, Clock, FileQuestion, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PublishBlockers } from '../hooks/useLessonPublishable';
import type { LessonAsset } from '@/features/matieres/validation/validation-report.types';

interface PublishGateIndicatorProps {
  blockers: PublishBlockers;
  quizAsset: LessonAsset | null;
  activitiesAsset: LessonAsset | null;
  isLoading?: boolean;
  compact?: boolean;
  className?: string;
}

function getStatusIcon(missing: boolean, notValidated: boolean, isLoading?: boolean) {
  if (isLoading) return <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />;
  if (missing) return <AlertCircle className="h-4 w-4 text-destructive" />;
  if (notValidated) return <Clock className="h-4 w-4 text-warning" />;
  return <CheckCircle2 className="h-4 w-4 text-primary" />;
}

function getStatusText(missing: boolean, notValidated: boolean, asset: LessonAsset | null): string {
  if (missing) return 'Manquant';
  if (notValidated) return asset?.status === 'draft' ? 'Brouillon' : 'En attente de validation';
  return 'Validé';
}

/**
 * Visual indicator showing publication readiness status.
 * Displays checkmarks for validated assets and warnings for blockers.
 */
export function PublishGateIndicator({
  blockers,
  quizAsset,
  activitiesAsset,
  isLoading,
  compact = false,
  className,
}: PublishGateIndicatorProps) {
  const hasBlockers = blockers.quizMissing || blockers.quizNotValidated || 
                      blockers.activitiesMissing || blockers.activitiesNotValidated;

  if (compact) {
    // Compact inline display
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <div className="flex items-center gap-1">
          <FileQuestion className="h-3.5 w-3.5 text-muted-foreground" />
          {getStatusIcon(blockers.quizMissing, blockers.quizNotValidated, isLoading)}
        </div>
        <div className="flex items-center gap-1">
          <Gamepad2 className="h-3.5 w-3.5 text-muted-foreground" />
          {getStatusIcon(blockers.activitiesMissing, blockers.activitiesNotValidated, isLoading)}
        </div>
        {hasBlockers && !isLoading && (
          <span className="text-xs text-muted-foreground">
            Publication bloquée
          </span>
        )}
      </div>
    );
  }

  // Expanded display with details
  return (
    <div className={cn('space-y-2 p-3 rounded-lg border bg-muted/30', className)}>
      <div className="flex items-center gap-2 text-sm font-medium">
        {hasBlockers ? (
          <AlertCircle className="h-4 w-4 text-warning" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-primary" />
        )}
        <span>Prêt à publier</span>
      </div>

      <div className="space-y-1.5">
        {/* Quiz Status */}
        <div className="flex items-center gap-2 text-sm">
          {getStatusIcon(blockers.quizMissing, blockers.quizNotValidated, isLoading)}
          <FileQuestion className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1">Quiz Final</span>
          <span className={cn(
            'text-xs',
            blockers.quizMissing || blockers.quizNotValidated 
              ? 'text-muted-foreground' 
              : 'text-primary'
          )}>
            {isLoading ? 'Chargement...' : getStatusText(blockers.quizMissing, blockers.quizNotValidated, quizAsset)}
          </span>
        </div>

        {/* Activities Status */}
        <div className="flex items-center gap-2 text-sm">
          {getStatusIcon(blockers.activitiesMissing, blockers.activitiesNotValidated, isLoading)}
          <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1">Activités</span>
          <span className={cn(
            'text-xs',
            blockers.activitiesMissing || blockers.activitiesNotValidated 
              ? 'text-muted-foreground' 
              : 'text-primary'
          )}>
            {isLoading ? 'Chargement...' : getStatusText(blockers.activitiesMissing, blockers.activitiesNotValidated, activitiesAsset)}
          </span>
        </div>
      </div>

      {hasBlockers && !isLoading && (
        <p className="text-xs text-muted-foreground mt-2">
          Validez le quiz et les activités avant de publier.
        </p>
      )}
    </div>
  );
}
