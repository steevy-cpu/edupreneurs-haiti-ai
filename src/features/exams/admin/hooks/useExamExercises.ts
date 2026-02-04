/**
 * useExamExercises - Hook for fetching and mutating exam exercises
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

// Use the database type directly for better compatibility
type DbExamExercise = Tables<'exam_exercises'>;

interface UpdateExerciseParams {
  id: string;
  updates: Partial<Pick<DbExamExercise, 'correct_answer' | 'explanation' | 'concept' | 'points' | 'difficulty'>>;
}

interface DeleteExerciseParams {
  id: string;
}

export function useExamExercises(examId: string | null) {
  const queryClient = useQueryClient();

  // Fetch all exercises for an exam
  const {
    data: exercises,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['exam-exercises', examId],
    queryFn: async () => {
      if (!examId) return [];
      
      const { data, error } = await supabase
        .from('exam_exercises')
        .select('*')
        .eq('exam_id', examId)
        .order('exercise_number', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!examId,
    staleTime: 30000, // 30 seconds - good for 3G
  });

  // Update mutation with optimistic updates
  const updateExercise = useMutation({
    mutationFn: async ({ id, updates }: UpdateExerciseParams) => {
      const { error } = await supabase
        .from('exam_exercises')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['exam-exercises', examId] });

      // Snapshot the previous value
      const previousExercises = queryClient.getQueryData<DbExamExercise[]>(['exam-exercises', examId]);

      // Optimistically update
      if (previousExercises) {
        queryClient.setQueryData<DbExamExercise[]>(
          ['exam-exercises', examId],
          previousExercises.map(ex => 
            ex.id === id ? { ...ex, ...updates } : ex
          )
        );
      }

      return { previousExercises };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousExercises) {
        queryClient.setQueryData(['exam-exercises', examId], context.previousExercises);
      }
      toast.error("Erreur lors de la mise à jour");
      console.error("Update error:", err);
    },
    onSuccess: () => {
      toast.success("Exercice mis à jour");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['exam-exercises', examId] });
    },
  });

  // Delete mutation
  const deleteExercise = useMutation({
    mutationFn: async ({ id }: DeleteExerciseParams) => {
      const { error } = await supabase
        .from('exam_exercises')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['exam-exercises', examId] });

      const previousExercises = queryClient.getQueryData<DbExamExercise[]>(['exam-exercises', examId]);

      if (previousExercises) {
        queryClient.setQueryData<DbExamExercise[]>(
          ['exam-exercises', examId],
          previousExercises.filter(ex => ex.id !== id)
        );
      }

      return { previousExercises };
    },
    onError: (err, variables, context) => {
      if (context?.previousExercises) {
        queryClient.setQueryData(['exam-exercises', examId], context.previousExercises);
      }
      toast.error("Erreur lors de la suppression");
      console.error("Delete error:", err);
    },
    onSuccess: () => {
      toast.success("Exercice supprimé");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-exercises', examId] });
    },
  });

  return {
    exercises: exercises || [],
    isLoading,
    error,
    refetch,
    updateExercise,
    deleteExercise,
  };
}

// Calculate quality metrics from exercises
export function calculateQualityMetrics(exercises: DbExamExercise[]) {
  const total = exercises.length;
  if (total === 0) {
    return {
      totalExercises: 0,
      withAnswer: 0,
      withExplanation: 0,
      withBlocks: 0,
      answerPercent: 0,
      explanationPercent: 0,
      blocksPercent: 0,
    };
  }

  const withAnswer = exercises.filter(ex => 
    ex.correct_answer && ex.correct_answer.trim() !== ''
  ).length;

  const withExplanation = exercises.filter(ex => 
    ex.explanation && ex.explanation.trim() !== ''
  ).length;

  const withBlocks = exercises.filter(ex => 
    ex.prompt_blocks && Array.isArray(ex.prompt_blocks) && ex.prompt_blocks.length > 0
  ).length;

  return {
    totalExercises: total,
    withAnswer,
    withExplanation,
    withBlocks,
    answerPercent: Math.round((withAnswer / total) * 100),
    explanationPercent: Math.round((withExplanation / total) * 100),
    blocksPercent: Math.round((withBlocks / total) * 100),
  };
}

// Export the type for components
export type { DbExamExercise };
