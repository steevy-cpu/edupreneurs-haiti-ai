import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, Clock, X, RotateCcw } from 'lucide-react';
import type { JobProgress, GenerationJob } from '../hooks/useGenerationJob';

interface GenerationJobProgressProps {
  job: GenerationJob | null;
  progress: JobProgress | null;
  currentSection: string | null;
  progressPercentage: number;
  onCancel?: () => void;
  onResume?: () => void;
  existingJob?: GenerationJob | null;
  canResume?: boolean;
}

const SECTION_LABELS: Record<string, string> = {
  objectif: 'Objectif',
  introduction: 'Introduction',
  contenu: 'Contenu principal',
  exemples_exercices: 'Exemples & Exercices',
  activites_interactives: 'Activités Interactives',
  quiz_final: 'Quiz Final',
  youtube_url: 'Vidéos YouTube',
  explanatory_images: 'Images explicatives',
  audio_objectif: 'Audio Objectif',
  audio_introduction: 'Audio Introduction',
  audio_contenu: 'Audio Contenu',
  audio_exemples: 'Audio Exemples',
};

function SectionStatusIcon({ status }: { status: 'pending' | 'generating' | 'completed' | 'error' }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'generating':
      return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
}

export function GenerationJobProgress({
  job,
  progress,
  currentSection,
  progressPercentage,
  onCancel,
  onResume,
  existingJob,
  canResume,
}: GenerationJobProgressProps) {
  // Show resume option if there's an existing job but no active job
  if (canResume && existingJob && !job) {
    return (
      <div className="bg-accent/50 border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <div>
              <p className="font-medium text-foreground">
                Génération en cours
              </p>
              <p className="text-sm text-muted-foreground">
                Une génération est déjà en cours pour cette leçon
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onResume}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reprendre le suivi
          </Button>
        </div>
      </div>
    );
  }

  if (!job || !progress) {
    return null;
  }

  const isRunning = job.status === 'pending' || job.status === 'running';
  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';
  const isCancelled = job.status === 'cancelled';

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRunning && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          {isCompleted && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          {isFailed && <XCircle className="h-5 w-5 text-destructive" />}
          {isCancelled && <XCircle className="h-5 w-5 text-muted-foreground" />}
          
          <span className="font-medium">
            {isRunning && 'Génération en cours...'}
            {isCompleted && 'Génération terminée'}
            {isFailed && 'Génération échouée'}
            {isCancelled && 'Génération annulée'}
          </span>
          
          {currentSection && isRunning && (
            <Badge variant="secondary" className="ml-2">
              {SECTION_LABELS[currentSection] || currentSection}
            </Badge>
          )}
        </div>
        
        {isRunning && onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Annuler
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {progress.current} / {progress.total} sections
          </span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Section details */}
      {progress.sections.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-2">
            {progress.sections.map((section) => {
              const displayStatus = section.status === 'completed' ? 'completed' : 
                                   section.status === 'error' ? 'error' : 'pending';
              return (
                <div
                  key={section.name}
                  className="flex items-center gap-2 text-sm"
                >
                  <SectionStatusIcon status={displayStatus} />
                  <span className={section.status === 'error' ? 'text-destructive' : 'text-foreground'}>
                    {SECTION_LABELS[section.name] || section.name}
                  </span>
                  {section.wordCount && (
                    <span className="text-xs text-muted-foreground">
                      ({section.wordCount} mots)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error message */}
      {job.error_message && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          <p className="text-sm text-destructive">
            {job.error_message}
          </p>
        </div>
      )}

      {/* Info about background processing */}
      {isRunning && (
        <p className="text-xs text-muted-foreground text-center">
          💡 Vous pouvez fermer cette fenêtre - la génération continue en arrière-plan
        </p>
      )}
    </div>
  );
}
