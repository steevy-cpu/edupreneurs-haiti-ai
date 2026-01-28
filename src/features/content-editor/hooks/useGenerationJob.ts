import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AiJobStatus = Database['public']['Enums']['ai_job_status'] | string;

export interface JobConfig {
  selectedSections: string[];
  wordCounts: Record<string, number>;
  generateQuiz: boolean;
  generateVideos: boolean;
  generateAudio: boolean;
  imageGenerationModel: 'none' | 'openai' | 'lovable';
  globalContext?: string;
}

export interface SectionResult {
  name: string;
  status: 'completed' | 'error';
  content?: string;
  error?: string;
  wordCount?: number;
}

export interface JobProgress {
  current: number;
  total: number;
  sections: SectionResult[];
}

export interface GenerationJob {
  id: string;
  lesson_id: string;
  job_type: string;
  config: JobConfig;
  status: AiJobStatus;
  progress: JobProgress;
  current_section: string | null;
  result_content: Record<string, any> | null;
  error_message: string | null;
  created_by: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UseGenerationJobOptions {
  lessonId: string;
  onJobComplete?: (result: Record<string, any> | null) => void;
}

export function useGenerationJob({ lessonId, onJobComplete }: UseGenerationJobOptions) {
  const { user } = useSessionAuth();
  const queryClient = useQueryClient();
  const [activeJob, setActiveJob] = useState<GenerationJob | null>(null);

  // Query for any existing active job for this lesson
  const { data: existingJob, refetch: refetchExistingJob } = useQuery({
    queryKey: ['ai-generation-job', lessonId, 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_generation_jobs')
        .select('*')
        .eq('lesson_id', lessonId)
        .in('status', ['pending', 'running'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching active job:', error);
        return null;
      }

      if (!data) return null;

      // Transform database record to GenerationJob type
      return {
        ...data,
        config: data.config as unknown as JobConfig,
        progress: data.progress as unknown as JobProgress,
        result_content: data.result_content as Record<string, any> | null,
      } as GenerationJob;
    },
    enabled: !!lessonId && !!user,
    staleTime: 5000,
  });

  // Set active job from existing job on mount or when it changes
  useEffect(() => {
    if (existingJob && !activeJob) {
      setActiveJob(existingJob);
    }
  }, [existingJob, activeJob]);

  // Subscribe to realtime updates for the active job
  useRealtimeSubscription({
    table: 'ai_generation_jobs',
    event: 'UPDATE',
    filter: activeJob?.id ? `id=eq.${activeJob.id}` : undefined,
    enabled: !!activeJob?.id,
    callback: useCallback((payload: any) => {
      const rawJob = payload.new;
      // Transform to GenerationJob type
      const updatedJob: GenerationJob = {
        ...rawJob,
        config: rawJob.config as unknown as JobConfig,
        progress: rawJob.progress as unknown as JobProgress,
        result_content: rawJob.result_content as Record<string, any> | null,
      };
      console.log('📡 Job update received:', updatedJob.status, updatedJob.current_section);
      
      setActiveJob(updatedJob);

      // Check if job is completed or failed
      if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
        console.log('🎉 Job finished:', updatedJob.status);
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['ai-generation-job', lessonId] });
        
        // Notify completion
        if (updatedJob.status === 'completed') {
          toast.success('Génération terminée !');
          onJobComplete?.(updatedJob.result_content);
        } else {
          toast.error(updatedJob.error_message || 'La génération a échoué');
          onJobComplete?.(null);
        }
        
        // Clear active job after a short delay to allow UI to update
        setTimeout(() => {
          setActiveJob(null);
          refetchExistingJob();
        }, 1000);
      }
    }, [lessonId, onJobComplete, queryClient, refetchExistingJob]),
  });

  // Start a new generation job
  const startJob = useMutation({
    mutationFn: async (config: JobConfig) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('🚀 Creating new generation job...');

      // Create the job record
      const { data: job, error: insertError } = await supabase
        .from('ai_generation_jobs')
        .insert({
          lesson_id: lessonId,
          job_type: 'single_lesson',
          config: config as unknown as Database['public']['Tables']['ai_generation_jobs']['Insert']['config'],
          status: 'pending',
          progress: { current: 0, total: 0, sections: [] },
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating job:', insertError);
        throw insertError;
      }

      console.log('📋 Job created:', job.id);

      // Trigger the edge function to process the job
      // We don't await this - it runs in the background
      supabase.functions.invoke('process-ai-job', {
        body: { jobId: job.id }
      }).then(({ error }) => {
        if (error) {
          console.error('Error invoking process-ai-job:', error);
        }
      });

      // Transform to GenerationJob type
      return {
        ...job,
        config: job.config as unknown as JobConfig,
        progress: job.progress as unknown as JobProgress,
        result_content: job.result_content as Record<string, any> | null,
      } as GenerationJob;
    },
    onSuccess: (job) => {
      console.log('✅ Job started successfully');
      setActiveJob(job);
      toast.info('Génération démarrée en arrière-plan');
    },
    onError: (error: any) => {
      console.error('❌ Failed to start job:', error);
      toast.error('Erreur lors du démarrage de la génération');
    },
  });

  // Cancel a running job
  const cancelJob = useMutation({
    mutationFn: async () => {
      if (!activeJob?.id) {
        throw new Error('No active job to cancel');
      }

      console.log('🛑 Cancelling job:', activeJob.id);

      const { error } = await supabase
        .from('ai_generation_jobs')
        .update({ 
          status: 'cancelled',
          completed_at: new Date().toISOString(),
        })
        .eq('id', activeJob.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.info('Génération annulée');
      setActiveJob(null);
      refetchExistingJob();
    },
    onError: (error: any) => {
      console.error('❌ Failed to cancel job:', error);
      toast.error('Erreur lors de l\'annulation');
    },
  });

  // Resume watching an existing job
  const resumeJob = useCallback((job: GenerationJob) => {
    console.log('🔄 Resuming job:', job.id);
    setActiveJob(job);
  }, []);

  // Get progress percentage
  const progressPercentage = activeJob?.progress 
    ? Math.round((activeJob.progress.current / Math.max(activeJob.progress.total, 1)) * 100)
    : 0;

  return {
    // State
    activeJob,
    existingJob,
    isGenerating: !!activeJob && (activeJob.status === 'pending' || activeJob.status === 'running'),
    isPending: startJob.isPending,
    
    // Progress
    progress: activeJob?.progress || null,
    currentSection: activeJob?.current_section || null,
    progressPercentage,
    
    // Result
    resultContent: activeJob?.result_content || null,
    
    // Actions
    startJob: startJob.mutate,
    cancelJob: cancelJob.mutate,
    resumeJob,
    
    // Resume capability
    canResume: !!existingJob && !activeJob,
  };
}
