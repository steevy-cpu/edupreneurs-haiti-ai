import { useMemo } from "react";
import { 
  useBatchOperation, 
  BatchOperationDialog,
  createQuizRegeneratorConfig,
  quizRegeneratorTheme,
  quizRegeneratorDialogConfig,
  BatchLesson
} from "@/features/content-editor/batch-operations";
import { useContentEditorPermissions } from "@/hooks/useContentEditorPermissions";

interface BatchQuizRegeneratorProps {
  lessons: BatchLesson[];
  gradeLevel: string;
  onComplete: () => void;
  onDashboardRefresh?: () => void;
  disabled?: boolean;
}

export const BatchQuizRegenerator = ({ 
  lessons, 
  gradeLevel, 
  onComplete,
  onDashboardRefresh,
  disabled = false,
}: BatchQuizRegeneratorProps) => {
  const { role } = useContentEditorPermissions();
  const config = useMemo(() => createQuizRegeneratorConfig(), []);
  
  const operation = useBatchOperation({
    lessons,
    config,
    onComplete,
    onDashboardRefresh,
  });

  // Only admin can batch regenerate
  const canBatchRegenerate = role === 'admin';
  
  // Filter to only lessons that need regeneration
  const lessonsToRegenerate = lessons.filter(
    l => l.needs_quiz_regeneration && l.last_content_validated_at
  );

  if (!canBatchRegenerate || lessonsToRegenerate.length === 0) {
    return null;
  }

  return (
    <BatchOperationDialog
      dialogConfig={{
        ...quizRegeneratorDialogConfig,
        title: `Régénérer quizzes flaggés (${lessonsToRegenerate.length})`,
      }}
      theme={quizRegeneratorTheme}
      operationType="regenerate"
      gradeLevel={gradeLevel}
      validatedCount={0}
      totalCount={lessonsToRegenerate.length}
      operation={operation}
      disabled={disabled}
    />
  );
};
