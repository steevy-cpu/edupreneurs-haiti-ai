import { useMemo } from "react";
import { 
  useBatchOperation, 
  BatchOperationDialog,
  BatchLesson
} from "@/features/content-editor/batch-operations";
import { 
  createContentGeneratorConfig,
  contentGeneratorTheme,
  contentGeneratorDialogConfig,
} from "../generators/contentGenerator";

interface BatchContentGeneratorProps {
  lessons: BatchLesson[];
  gradeLevel: string;
  onComplete: () => void;
  onDashboardRefresh?: () => void;
  onStart?: () => void;
  disabled?: boolean;
}

export const BatchContentGenerator = ({ 
  lessons, 
  gradeLevel, 
  onComplete,
  onDashboardRefresh,
  onStart,
  disabled = false,
}: BatchContentGeneratorProps) => {
  const config = useMemo(() => createContentGeneratorConfig(), []);
  
  const operation = useBatchOperation({
    lessons,
    config,
    onComplete,
    onDashboardRefresh,
    onStart,
  });

  if (lessons.length === 0) return null;

  return (
    <BatchOperationDialog
      dialogConfig={{
        ...contentGeneratorDialogConfig,
        title: `Générer ${lessons.length} contenu${lessons.length > 1 ? 's' : ''} manquant${lessons.length > 1 ? 's' : ''}`,
      }}
      theme={contentGeneratorTheme}
      operationType="regenerate"
      gradeLevel={gradeLevel}
      validatedCount={0}
      totalCount={lessons.length}
      operation={operation}
      disabled={disabled}
    />
  );
};
