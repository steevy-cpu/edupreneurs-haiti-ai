import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import {
  BatchQuizValidator,
  BatchActivitiesValidator,
  BatchQuizRegenerator,
  BatchActivitiesRegenerator,
  BatchQuizGeneratorNew,
  BatchContentGenerator,
} from "@/features/content-editor/batch-operations";

// Data shape produced by LessonBrowser after each load
export interface BatchPanelData {
  lessonsMissingContent: any[];
  lessonsMissingQuiz: any[];
  lessonsWithValidQuiz: any[];
  lessonsWithValidActivities: any[];
  gradeLevel: string;
  totalLessons: number;
  missingContentTotal: number;
  missingQuizzesTotal: number;
}

interface BatchOperationsPanelProps {
  data: BatchPanelData | null;
  onRefresh: () => void;
  onDashboardRefresh?: () => void;
}

/**
 * Renders the 6 batch operation buttons (generation, validation, regeneration).
 * Extracted from LessonBrowser so that LessonBrowser is responsible only for
 * browsing/selecting lessons.
 *
 * Owns the activeBatchOperation mutex to prevent two operations running at once.
 */
export const BatchOperationsPanel = ({
  data,
  onRefresh,
  onDashboardRefresh,
}: BatchOperationsPanelProps) => {
  // Mutex: only one batch operation can run at a time
  const [activeBatchOperation, setActiveBatchOperation] = useState<string | null>(null);

  // Nothing to show until LessonBrowser has loaded lessons
  if (!data || data.gradeLevel === "all" || data.totalLessons === 0) return null;

  const {
    lessonsMissingContent,
    lessonsMissingQuiz,
    lessonsWithValidQuiz,
    lessonsWithValidActivities,
    gradeLevel,
    missingContentTotal,
    missingQuizzesTotal,
  } = data;

  const hasGeneration = missingContentTotal > 0 || missingQuizzesTotal > 0;
  const hasValidation = lessonsWithValidQuiz.length > 0 || lessonsWithValidActivities.length > 0;

  if (!hasGeneration && !hasValidation) return null;

  return (
    <Card className="flex-shrink-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Opérations en lot — {gradeLevel}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Generation section */}
        {hasGeneration && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Génération</Label>
            {missingContentTotal > 0 && (
              <BatchContentGenerator
                lessons={lessonsMissingContent}
                gradeLevel={gradeLevel}
                onComplete={() => {
                  setActiveBatchOperation(null);
                  onRefresh();
                }}
                onStart={() => setActiveBatchOperation('content-generate')}
                onDashboardRefresh={onDashboardRefresh}
                disabled={activeBatchOperation !== null && activeBatchOperation !== 'content-generate'}
              />
            )}
            {missingQuizzesTotal > 0 && (
              <BatchQuizGeneratorNew
                lessons={lessonsMissingQuiz}
                gradeLevel={gradeLevel}
                onComplete={() => {
                  setActiveBatchOperation(null);
                  onRefresh();
                }}
                onStart={() => setActiveBatchOperation('quiz-generate')}
                onDashboardRefresh={onDashboardRefresh}
                disabled={activeBatchOperation !== null && activeBatchOperation !== 'quiz-generate'}
              />
            )}
          </div>
        )}

        {/* Validation section */}
        {hasValidation && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Validation</Label>
            <div className="space-y-1.5">
              {lessonsWithValidQuiz.length > 0 && (
                <BatchQuizValidator
                  lessons={lessonsWithValidQuiz}
                  gradeLevel={gradeLevel}
                  onComplete={() => {
                    setActiveBatchOperation(null);
                    onRefresh();
                  }}
                  onStart={() => setActiveBatchOperation('quiz-validate')}
                  onDashboardRefresh={onDashboardRefresh}
                  disabled={activeBatchOperation !== null && activeBatchOperation !== 'quiz-validate'}
                />
              )}
              {lessonsWithValidActivities.length > 0 && (
                <BatchActivitiesValidator
                  lessons={lessonsWithValidActivities}
                  gradeLevel={gradeLevel}
                  onComplete={() => {
                    setActiveBatchOperation(null);
                    onRefresh();
                  }}
                  onStart={() => setActiveBatchOperation('activities-validate')}
                  onDashboardRefresh={onDashboardRefresh}
                  disabled={activeBatchOperation !== null && activeBatchOperation !== 'activities-validate'}
                />
              )}
            </div>
          </div>
        )}

        {/* Regeneration section — only admin-visible; wrappers self-hide when not eligible */}
        <BatchQuizRegenerator
          lessons={lessonsWithValidQuiz}
          gradeLevel={gradeLevel}
          onComplete={() => {
            setActiveBatchOperation(null);
            onRefresh();
          }}
          onStart={() => setActiveBatchOperation('quiz-regenerate')}
          onDashboardRefresh={onDashboardRefresh}
          disabled={activeBatchOperation !== null && activeBatchOperation !== 'quiz-regenerate'}
        />
        <BatchActivitiesRegenerator
          lessons={lessonsWithValidActivities}
          gradeLevel={gradeLevel}
          onComplete={() => {
            setActiveBatchOperation(null);
            onRefresh();
          }}
          onStart={() => setActiveBatchOperation('activities-regenerate')}
          onDashboardRefresh={onDashboardRefresh}
          disabled={activeBatchOperation !== null && activeBatchOperation !== 'activities-regenerate'}
        />
      </CardContent>
    </Card>
  );
};
