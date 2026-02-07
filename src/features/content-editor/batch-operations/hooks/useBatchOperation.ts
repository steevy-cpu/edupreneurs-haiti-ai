import { useState, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { 
  BatchOperationConfig, 
  BatchLesson, 
  OperationResult, 
  OperationProgress, 
  OperationStats,
  UseBatchOperationReturn 
} from "../types";

interface UseBatchOperationOptions {
  lessons: BatchLesson[];
  config: BatchOperationConfig;
  onComplete: () => void;
  onDashboardRefresh?: () => void;
}

export const useBatchOperation = ({
  lessons,
  config,
  onComplete,
  onDashboardRefresh,
}: UseBatchOperationOptions): UseBatchOperationReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<OperationProgress>({ current: 0, total: 0 });
  const [results, setResults] = useState<OperationResult[]>([]);
  const [currentItem, setCurrentItem] = useState<string>("");
  const [skipCompleted, setSkipCompleted] = useState(true);
  const abortRef = useRef(false);

  // Calculate items to process based on filter
  const itemsToProcess = useMemo(() => {
    return lessons.filter(lesson => config.filterLesson(lesson, skipCompleted));
  }, [lessons, config, skipCompleted]);

  // Calculate stats from results
  const stats = useMemo<OperationStats>(() => {
    return {
      success: results.filter(r => r.success && !r.error).length,
      failed: results.filter(r => r.error).length,
      aligned: results.filter(r => r.aligned === true && !r.error).length,
      misaligned: results.filter(r => r.aligned === false && !r.error).length,
    };
  }, [results]);

  const canStart = itemsToProcess.length > 0;
  const estimatedMinutes = Math.ceil(itemsToProcess.length * 3 / 60);

  const pause = useCallback(() => {
    abortRef.current = true;
  }, []);

  const start = useCallback(async () => {
    if (itemsToProcess.length === 0) {
      toast.info(config.messages.empty);
      return;
    }

    abortRef.current = false;
    setIsRunning(true);
    setProgress({ current: 0, total: itemsToProcess.length });
    setResults([]);

    const operationResults: OperationResult[] = [];

    for (let i = 0; i < itemsToProcess.length; i++) {
      if (abortRef.current) {
        toast.info(config.messages.pauseInfo);
        break;
      }

      const lesson = itemsToProcess[i];
      setCurrentItem(lesson.title);
      setProgress({ current: i, total: itemsToProcess.length });

      try {
        // Process the lesson
        const result = await config.processLesson(lesson);

        // Fetch existing validation_details_json for merge
        const { data: existing } = await supabase
          .from('lessons')
          .select('validation_details_json')
          .eq('id', lesson.id)
          .single();

        // Update with merge logic
        await config.updateLesson(lesson.id, result, existing?.validation_details_json);

        operationResults.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          success: result.success,
          aligned: result.aligned,
          confidence: result.confidence,
          offContentCount: result.offContentCount,
        });

      } catch (error) {
        console.error(`Error processing ${lesson.title}:`, error);
        operationResults.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        });
      }

      setResults([...operationResults]);

      // Rate limiting delay
      if (i < itemsToProcess.length - 1 && !abortRef.current) {
        await new Promise(resolve => setTimeout(resolve, config.rateLimit));
      }
    }

    setProgress({ current: itemsToProcess.length, total: itemsToProcess.length });
    setIsRunning(false);

    // Show appropriate toast based on results
    const successCount = operationResults.filter(r => r.success && !r.error).length;
    const errorCount = operationResults.filter(r => r.error).length;
    const alignedCount = operationResults.filter(r => r.aligned === true && !r.error).length;
    const misalignedCount = operationResults.filter(r => r.aligned === false && !r.error).length;

    if (config.operationType === 'validate') {
      if (misalignedCount === 0 && errorCount === 0) {
        toast.success(config.messages.success.replace('{count}', String(alignedCount)));
      } else if (alignedCount === 0 && misalignedCount > 0) {
        toast.warning(config.messages.error.replace('{count}', String(misalignedCount)));
      } else {
        toast.info(config.messages.partial
          .replace('{aligned}', String(alignedCount))
          .replace('{misaligned}', String(misalignedCount))
          .replace('{errors}', String(errorCount)));
      }
    } else {
      // Regeneration
      if (errorCount === 0) {
        toast.success(config.messages.success.replace('{count}', String(successCount)));
      } else if (successCount === 0) {
        toast.error(config.messages.error);
      } else {
        toast.info(config.messages.partial
          .replace('{success}', String(successCount))
          .replace('{errors}', String(errorCount)));
      }
    }

    onComplete();
    onDashboardRefresh?.();
  }, [itemsToProcess, config, onComplete, onDashboardRefresh]);

  return {
    isRunning,
    progress,
    results,
    currentItem,
    skipCompleted,
    start,
    pause,
    setSkipCompleted,
    stats,
    itemsToProcess,
    canStart,
    estimatedMinutes,
  };
};
