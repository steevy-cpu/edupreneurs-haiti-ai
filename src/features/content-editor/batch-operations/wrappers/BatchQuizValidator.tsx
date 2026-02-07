import { useMemo } from "react";
import { 
  useBatchOperation, 
  BatchOperationDialog,
  createQuizValidatorConfig,
  quizValidatorTheme,
  quizValidatorDialogConfig,
  BatchLesson
} from "@/features/content-editor/batch-operations";

interface BatchQuizValidatorProps {
  lessons: BatchLesson[];
  gradeLevel: string;
  onComplete: () => void;
  onDashboardRefresh?: () => void;
  onStart?: () => void;
  disabled?: boolean;
}

export const BatchQuizValidator = ({ 
  lessons, 
  gradeLevel, 
  onComplete,
  onDashboardRefresh,
  onStart,
  disabled = false,
}: BatchQuizValidatorProps) => {
  const config = useMemo(() => createQuizValidatorConfig(), []);
  
  const operation = useBatchOperation({
    lessons,
    config,
    onComplete,
    onDashboardRefresh,
    onStart,
  });

  // Calculate stats for display
  const validatedCount = lessons.filter(l => l.last_content_validated_at).length;
  const totalWithQuiz = lessons.length;

  if (totalWithQuiz === 0) return null;

  return (
    <BatchOperationDialog
      dialogConfig={quizValidatorDialogConfig}
      theme={quizValidatorTheme}
      operationType="validate"
      gradeLevel={gradeLevel}
      validatedCount={validatedCount}
      totalCount={totalWithQuiz}
      operation={operation}
      disabled={disabled}
    />
  );
};
