/**
 * QualityIndicators - Display data quality metrics for an exam
 */
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface QualityMetrics {
  totalExercises: number;
  withAnswer: number;
  withExplanation: number;
  withBlocks: number;
  answerPercent: number;
  explanationPercent: number;
  blocksPercent: number;
}

interface QualityIndicatorsProps {
  metrics: QualityMetrics;
  compact?: boolean;
  onFilterClick?: (filter: 'missing-answer' | 'missing-explanation' | 'missing-blocks') => void;
}

function getColorClass(percent: number): string {
  if (percent >= 80) return 'text-green-600 dark:text-green-500';
  if (percent >= 40) return 'text-yellow-600 dark:text-yellow-500';
  return 'text-red-600 dark:text-red-500';
}

function getProgressColor(percent: number): string {
  if (percent >= 80) return 'bg-green-500';
  if (percent >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getIcon(percent: number) {
  if (percent >= 80) return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />;
  if (percent >= 40) return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />;
  return <XCircle className="h-4 w-4 text-red-600 dark:text-red-500" />;
}

export function QualityIndicators({ metrics, compact = false, onFilterClick }: QualityIndicatorsProps) {
  if (metrics.totalExercises === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Aucun exercice
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Badge 
          variant="outline" 
          className={`${getColorClass(metrics.answerPercent)} cursor-pointer hover:bg-muted`}
          onClick={() => onFilterClick?.('missing-answer')}
        >
          {metrics.answerPercent}% réponses
        </Badge>
        <Badge 
          variant="outline"
          className={`${getColorClass(metrics.explanationPercent)} cursor-pointer hover:bg-muted`}
          onClick={() => onFilterClick?.('missing-explanation')}
        >
          {metrics.explanationPercent}% explications
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between text-sm font-medium">
        <span>Qualité des données</span>
        <span className="text-muted-foreground">{metrics.totalExercises} exercices</span>
      </div>

      {/* Answer Progress */}
      <div 
        className="space-y-1 cursor-pointer hover:bg-muted/50 rounded p-2 -mx-2 transition-colors"
        onClick={() => onFilterClick?.('missing-answer')}
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getIcon(metrics.answerPercent)}
            <span>Réponses correctes</span>
          </div>
          <span className={getColorClass(metrics.answerPercent)}>
            {metrics.withAnswer}/{metrics.totalExercises} ({metrics.answerPercent}%)
          </span>
        </div>
        <Progress 
          value={metrics.answerPercent} 
          className="h-2"
        />
      </div>

      {/* Explanation Progress */}
      <div 
        className="space-y-1 cursor-pointer hover:bg-muted/50 rounded p-2 -mx-2 transition-colors"
        onClick={() => onFilterClick?.('missing-explanation')}
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getIcon(metrics.explanationPercent)}
            <span>Explications</span>
          </div>
          <span className={getColorClass(metrics.explanationPercent)}>
            {metrics.withExplanation}/{metrics.totalExercises} ({metrics.explanationPercent}%)
          </span>
        </div>
        <Progress 
          value={metrics.explanationPercent} 
          className="h-2"
        />
      </div>

      {/* Structured Blocks Progress */}
      <div 
        className="space-y-1 cursor-pointer hover:bg-muted/50 rounded p-2 -mx-2 transition-colors"
        onClick={() => onFilterClick?.('missing-blocks')}
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getIcon(metrics.blocksPercent)}
            {/* Updated label: reflects AI extraction, not manual structuring */}
            <span>Contenu extrait par IA</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                Les exercices dont le contenu a été extrait automatiquement par l'IA depuis le PDF.
              </TooltipContent>
            </Tooltip>
          </div>
          <span className={getColorClass(metrics.blocksPercent)}>
            {metrics.withBlocks}/{metrics.totalExercises} ({metrics.blocksPercent}%)
          </span>
        </div>
        <Progress 
          value={metrics.blocksPercent} 
          className="h-2"
        />
      </div>
    </div>
  );
}
