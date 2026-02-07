import { useMemo } from "react";
import { 
  useBatchOperation, 
  BatchOperationDialog,
  createActivitiesValidatorConfig,
  activitiesValidatorTheme,
  activitiesValidatorDialogConfig,
  BatchLesson
} from "@/features/content-editor/batch-operations";

interface BatchActivitiesValidatorProps {
  lessons: BatchLesson[];
  gradeLevel: string;
  onComplete: () => void;
  onDashboardRefresh?: () => void;
  onStart?: () => void;
  disabled?: boolean;
}

export const BatchActivitiesValidator = ({ 
  lessons, 
  gradeLevel, 
  onComplete,
  onDashboardRefresh,
  onStart,
  disabled = false,
}: BatchActivitiesValidatorProps) => {
  const config = useMemo(() => createActivitiesValidatorConfig(), []);
  
  const operation = useBatchOperation({
    lessons,
    config,
    onComplete,
    onDashboardRefresh,
    onStart,
  });

  // Calculate stats for display
  const validatedCount = lessons.filter(l => l.last_activities_validated_at).length;
  const totalWithActivities = lessons.length;

  if (totalWithActivities === 0) return null;

  return (
    <BatchOperationDialog
      dialogConfig={activitiesValidatorDialogConfig}
      theme={activitiesValidatorTheme}
      operationType="validate"
      gradeLevel={gradeLevel}
      validatedCount={validatedCount}
      totalCount={totalWithActivities}
      operation={operation}
      disabled={disabled}
    />
  );
};
