import { useState, useMemo } from "react";
import { 
  useBatchOperation, 
  BatchOperationDialog,
  BatchLesson
} from "@/features/content-editor/batch-operations";
import type { QuizProvider } from "@/features/content-editor/batch-operations";
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
  const [provider, setProvider] = useState<QuizProvider>('lovable');
  const config = useMemo(() => createQuizGeneratorConfig(provider), [provider]);
  
  const operation = useBatchOperation({
    lessons,
    config,
    gradeLevel,
    onComplete,
    onDashboardRefresh,
    onStart,
  });

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
      provider={provider}
      onProviderChange={setProvider}
    />
  );
};
