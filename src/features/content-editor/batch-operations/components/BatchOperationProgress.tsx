import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import type { BatchOperationTheme, OperationProgress, OperationStats, OperationType } from "../types";

interface BatchOperationProgressProps {
  isRunning: boolean;
  progress: OperationProgress;
  currentItem: string;
  stats: OperationStats;
  theme: BatchOperationTheme;
  operationType: OperationType;
  onPause: () => void;
}

export const BatchOperationProgress = ({
  isRunning,
  progress,
  currentItem,
  stats,
  theme,
  operationType,
  onPause,
}: BatchOperationProgressProps) => {
  if (!isRunning) return null;

  const progressValue = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
  const isValidation = operationType === 'validate';

  return (
    <div className={`space-y-3 p-3 rounded-lg ${theme.progressBgClass} ${theme.borderClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Loader2 className={`h-4 w-4 animate-spin ${theme.textClass}`} />
          <span>{isValidation ? 'Validation en cours...' : 'Régénération en cours...'}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onPause}
          className="h-7 px-2 text-destructive hover:text-destructive"
        >
          <X className="h-4 w-4 mr-1" />
          Pause & Sauvegarder
        </Button>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate max-w-[200px]">{currentItem}</span>
          <span>{progress.current}/{progress.total}</span>
        </div>
        <Progress 
          value={progressValue} 
          className={`h-2 ${theme.buttonClass}`}
        />
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <CheckCircle2 className="h-2.5 w-2.5" />
          Progression sauvegardée automatiquement
        </p>
      </div>

      {(stats.success > 0 || stats.failed > 0 || stats.aligned > 0 || stats.misaligned > 0) && (
        <div className="flex items-center gap-3 text-xs flex-wrap">
          {isValidation ? (
            <>
              {stats.aligned > 0 && (
                <span className="flex items-center gap-1 text-primary">
                  <CheckCircle2 className="h-3 w-3" />
                  {stats.aligned} aligné{stats.aligned > 1 ? 's' : ''}
                </span>
              )}
              {stats.misaligned > 0 && (
                <span className={`flex items-center gap-1 ${theme.textClass}`}>
                  <AlertTriangle className="h-3 w-3" />
                  {stats.misaligned} hors-contenu
                </span>
              )}
            </>
          ) : (
            stats.success > 0 && (
              <span className={`flex items-center gap-1 ${theme.textClass}`}>
                <CheckCircle2 className="h-3 w-3" />
                {stats.success} régénéré{stats.success > 1 ? 's' : ''}
              </span>
            )
          )}
          {stats.failed > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <X className="h-3 w-3" />
              {stats.failed} erreur{stats.failed > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
