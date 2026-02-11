import { useState, useMemo } from "react";
import { 
  useBatchOperation, 
  BatchOperationDialog,
  createQuizRegeneratorConfig,
  quizRegeneratorTheme,
  quizRegeneratorDialogConfig,
  BatchLesson
} from "@/features/content-editor/batch-operations";
import type { QuizProvider } from "@/features/content-editor/batch-operations";
import { useContentEditorPermissions } from "@/hooks/useContentEditorPermissions";

interface BatchQuizRegeneratorProps {
  lessons: BatchLesson[];
  gradeLevel: string;
  onComplete: () => void;
  onDashboardRefresh?: () => void;
  onStart?: () => void;
  disabled?: boolean;
}

export const BatchQuizRegenerator = ({ 
  lessons, 
  gradeLevel, 
  onComplete,
  onDashboardRefresh,
  onStart,
  disabled = false,
}: BatchQuizRegeneratorProps) => {
  const { role } = useContentEditorPermissions();
  const [provider, setProvider] = useState<QuizProvider>('lovable');
  const config = useMemo(() => createQuizRegeneratorConfig(provider), [provider]);
  
  const operation = useBatchOperation({
    lessons,
    config,
    gradeLevel,
    onComplete,
    onDashboardRefresh,
    onStart,
  });

  const canBatchRegenerate = role === 'admin';
  
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
      provider={provider}
      onProviderChange={setProvider}
    />
  );
};
