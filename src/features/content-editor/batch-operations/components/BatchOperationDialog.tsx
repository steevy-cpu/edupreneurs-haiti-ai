import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Loader2, BarChart3 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BatchOperationButton } from "./BatchOperationButton";
import { BatchOperationProgress } from "./BatchOperationProgress";
import type { 
  BatchDialogConfig, 
  BatchOperationTheme, 
  UseBatchOperationReturn,
  OperationType,
  QuizProvider
} from "../types";

interface BatchOperationDialogProps {
  dialogConfig: BatchDialogConfig;
  theme: BatchOperationTheme;
  operationType: OperationType;
  gradeLevel: string;
  validatedCount: number;
  totalCount: number;
  operation: UseBatchOperationReturn;
  disabled?: boolean;
  // Optional provider selection for quiz operations
  provider?: QuizProvider;
  onProviderChange?: (provider: QuizProvider) => void;
}

export const BatchOperationDialog = ({
  dialogConfig,
  theme,
  operationType,
  gradeLevel,
  validatedCount,
  totalCount,
  operation,
  disabled = false,
  provider,
  onProviderChange,
}: BatchOperationDialogProps) => {
  const {
    isRunning,
    progress,
    currentItem,
    stats,
    skipCompleted,
    setSkipCompleted,
    start,
    pause,
    itemsToProcess,
    estimatedMinutes,
  } = operation;

  if (isRunning) {
    return (
      <BatchOperationProgress
        isRunning={isRunning}
        progress={progress}
        currentItem={currentItem}
        stats={stats}
        theme={theme}
        operationType={operationType}
        onPause={pause}
      />
    );
  }

  const { canResume } = operation;
  const percentage = totalCount > 0 ? Math.round((validatedCount / totalCount) * 100) : 0;
  const sublabel = canResume
    ? `${operation.progress.current}/${operation.progress.total} — Reprendre?`
    : totalCount > 0 
      ? `${validatedCount}/${totalCount} déjà ${operationType === 'validate' ? 'validés' : 'régénérés'} (${percentage}%)`
      : undefined;

  const showProviderToggle = provider !== undefined && onProviderChange !== undefined;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <BatchOperationButton
          label={dialogConfig.title}
          sublabel={sublabel}
          theme={theme}
          disabled={disabled}
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogConfig.title}?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Provider selection for quiz operations */}
              {showProviderToggle && (
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <p className="text-xs font-medium">Fournisseur de quiz</p>
                  <RadioGroup
                    value={provider}
                    onValueChange={(val) => onProviderChange(val as QuizProvider)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lovable" id="provider-lovable" />
                      <Label htmlFor="provider-lovable" className="text-xs cursor-pointer">
                        Lovable AI
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="quizgecko" id="provider-quizgecko" />
                      <Label htmlFor="provider-quizgecko" className="text-xs cursor-pointer">
                        Quizgecko
                      </Label>
                    </div>
                  </RadioGroup>
                  {provider === 'quizgecko' && (
                    <p className="text-[10px] text-muted-foreground">
                      ⚠️ Nécessite une clé API Quizgecko configurée. Plus lent (1 à la fois).
                    </p>
                  )}
                </div>
              )}

              {/* Stats bar */}
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Statistiques pour {gradeLevel}
                  </span>
                  <span>{validatedCount}/{totalCount} {operationType === 'validate' ? 'validés' : 'traités'}</span>
                </div>
                <Progress value={percentage} className="h-1.5" />
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                  <div>• Total leçons: {totalCount}</div>
                  <div>• Restantes: {totalCount - validatedCount}</div>
                </div>
              </div>

              {/* Skip checkbox */}
              {dialogConfig.showSkipCheckbox && (
                <div className="flex items-center space-x-2 py-1">
                  <Checkbox 
                    id="skip-completed" 
                    checked={skipCompleted}
                    onCheckedChange={(checked) => setSkipCompleted(checked === true)}
                  />
                  <label 
                    htmlFor="skip-completed"
                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {dialogConfig.skipCheckboxLabel}
                  </label>
                </div>
              )}

              <p className="text-sm">{dialogConfig.description.replace('{count}', String(itemsToProcess.length))}</p>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  Les résultats sont sauvegardés automatiquement après chaque leçon.
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3" />
                  Durée estimée: ~{estimatedMinutes} minute{estimatedMinutes > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={start}
            className={theme.buttonClass}
            disabled={itemsToProcess.length === 0}
          >
            {theme.icon && <theme.icon className="h-4 w-4 mr-2" />}
            {dialogConfig.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
