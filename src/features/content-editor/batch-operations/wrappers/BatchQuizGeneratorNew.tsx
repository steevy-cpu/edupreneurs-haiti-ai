import { useMemo } from "react";
import { 
  useBatchOperation, 
  BatchOperationDialog,
  BatchLesson
} from "@/features/content-editor/batch-operations";
import { 
  createQuizGeneratorConfig,
  quizGeneratorTheme,
  quizGeneratorDialogConfig,
} from "../generators/quizGenerator";

interface BatchQuizGeneratorProps {
  lessons: BatchLesson[];
  gradeLevel: string;
  onComplete: () => void;
  onDashboardRefresh?: () => void;
  onStart?: () => void;
  disabled?: boolean;
}

export const BatchQuizGeneratorNew = ({ 
  lessons, 
  gradeLevel, 
  onComplete,
  onDashboardRefresh,
  onStart,
  disabled = false,
}: BatchQuizGeneratorProps) => {
  const config = useMemo(() => createQuizGeneratorConfig(), []);
  
  const operation = useBatchOperation({
    lessons,
    config,
    onComplete,
    onDashboardRefresh,
    onStart,
  });

  // Only show if there are lessons to generate
  if (lessons.length === 0) return null;

  return (
    <BatchOperationDialog
      dialogConfig={{
        ...quizGeneratorDialogConfig,
        title: `Générer ${lessons.length} quiz${lessons.length > 1 ? 's' : ''} manquant${lessons.length > 1 ? 's' : ''}`,
      }}
      theme={quizGeneratorTheme}
      operationType="regenerate"
      gradeLevel={gradeLevel}
      validatedCount={0}
      totalCount={lessons.length}
      operation={operation}
      disabled={disabled}
    />
  );
};
