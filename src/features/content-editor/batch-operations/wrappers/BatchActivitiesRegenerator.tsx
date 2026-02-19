import { useMemo } from "react";
import { 
  useBatchOperation, 
  BatchOperationDialog,
  createActivitiesRegeneratorConfig,
  activitiesRegeneratorTheme,
  activitiesRegeneratorDialogConfig,
  BatchLesson
} from "@/features/content-editor/batch-operations";
// Context replaces independent hook call — reads from the shared provider in ContentEditor
import { useContentEditorPermissionsContext } from "@/contexts/ContentEditorPermissionsContext";

interface BatchActivitiesRegeneratorProps {
  lessons: BatchLesson[];
  gradeLevel: string;
  onComplete: () => void;
  onDashboardRefresh?: () => void;
  onStart?: () => void;
  disabled?: boolean;
}

export const BatchActivitiesRegenerator = ({ 
  lessons, 
  gradeLevel, 
  onComplete,
  onDashboardRefresh,
  onStart,
  disabled = false,
}: BatchActivitiesRegeneratorProps) => {
  const { role } = useContentEditorPermissionsContext();
  const config = useMemo(() => createActivitiesRegeneratorConfig(), []);
  
  const operation = useBatchOperation({
    lessons,
    config,
    gradeLevel,
    onComplete,
    onDashboardRefresh,
    onStart,
  });

  // Only admin can batch regenerate
  const canBatchRegenerate = role === 'admin';
  
  // Filter to only lessons that need regeneration
  const lessonsToRegenerate = lessons.filter(
    l => l.needs_activities_regeneration && l.last_activities_validated_at
  );

  if (!canBatchRegenerate || lessonsToRegenerate.length === 0) {
    return null;
  }

  return (
    <BatchOperationDialog
      dialogConfig={{
        ...activitiesRegeneratorDialogConfig,
        title: `Régénérer activités flaggées (${lessonsToRegenerate.length})`,
      }}
      theme={activitiesRegeneratorTheme}
      operationType="regenerate"
      gradeLevel={gradeLevel}
      validatedCount={0}
      totalCount={lessonsToRegenerate.length}
      operation={operation}
      disabled={disabled}
    />
  );
};
