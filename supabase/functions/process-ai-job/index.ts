import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  secureJsonResponse, 
  secureErrorResponse, 
  corsPreflightResponse 
} from "../_shared/securityHeaders.ts";

interface JobConfig {
  selectedSections: string[];
  wordCounts: Record<string, number>;
  generateQuiz: boolean;
  generateVideos: boolean;
  generateAudio: boolean;
  imageGenerationModel: 'none' | 'openai' | 'lovable';
  globalContext?: string;
}

interface SectionResult {
  name: string;
  status: 'completed' | 'error';
  content?: string;
  error?: string;
  wordCount?: number;
}

interface JobProgress {
  current: number;
  total: number;
  sections: SectionResult[];
}

// Delay between AI calls (reduced since service-role bypasses rate limiting)
const INTER_CALL_DELAY = 1500;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry helper for transient failures (429, 5xx)
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxRetries = 2,
  baseDelay = 5000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isTransient = 
        error?.message?.includes('429') ||
        error?.message?.includes('Too many requests') ||
        error?.message?.includes('rate limit') ||
        error?.message?.includes('5') && error?.message?.includes('status') ||
        error?.message?.includes('non-2xx');
      
      if (attempt < maxRetries && isTransient) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`⚠️ Retry ${attempt + 1}/${maxRetries} for ${label} after ${delay}ms:`, error.message);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Exhausted retries for ${label}`);
}

async function updateJobProgress(
  supabase: any,
  jobId: string,
  progress: JobProgress,
  currentSection?: string,
  status?: string
): Promise<void> {
  const updates: Record<string, any> = {
    progress,
    updated_at: new Date().toISOString(),
  };
  
  if (currentSection) {
    updates.current_section = currentSection;
  }
  
  if (status) {
    updates.status = status;
  }
  
  await supabase
    .from('ai_generation_jobs')
    .update(updates)
    .eq('id', jobId);
}

async function generateSection(
  supabase: any,
  lesson: any,
  sectionName: string,
  config: JobConfig
): Promise<{ content: string; wordCount: number }> {
  if (sectionName === 'activites_interactives') {
    // Combine contenu and exemples for context
    const fullContent = [
      lesson.contenu || '',
      lesson.exemples_exercices || ''
    ].filter(Boolean).join('\n\n');

    const { data, error } = await supabase.functions.invoke('generate-interactive-activities', {
      body: {
        exercisesContent: fullContent,
        lessonTitle: lesson.title,
        gradeLevel: lesson.grade_level,
        subject: lesson.subjects?.name || 'Matière',
      }
    });

    if (error) throw error;
    if (!data?.content) throw new Error('No content generated');
    
    return {
      content: data.content,
      wordCount: data.content.split(/\s+/).length,
    };
  }

  // Standard section generation
  const { data, error } = await supabase.functions.invoke('generate-lesson-section', {
    body: {
      lessonId: lesson.id,
      sectionName,
      lessonTitle: lesson.title,
      subject: lesson.subjects?.name || 'Matière',
      gradeLevel: lesson.grade_level || '7AF',
      targetWords: config.wordCounts[sectionName] || 300,
      context: config.globalContext,
    }
  });

  if (error) throw error;
  if (!data?.content) throw new Error('No content generated');

  return {
    content: data.content,
    wordCount: data.wordCount || data.content.split(/\s+/).length,
  };
}

async function generateQuiz(
  supabase: any,
  lesson: any
): Promise<{ content: any }> {
  const { data, error } = await supabase.functions.invoke('generate-quiz-final', {
    body: {
      lessonTitle: lesson.title,
      contenu: lesson.contenu || '',
      exemplesExercices: lesson.exemples_exercices || '',
      gradeLevel: lesson.grade_level,
      subject: lesson.subjects?.name || 'Matière',
    }
  });

  if (error) throw error;
  if (!data?.quizContent) throw new Error('No quiz generated');

  return { content: data.quizContent };
}

async function suggestVideos(
  supabase: any,
  lesson: any
): Promise<{ videos: any[] }> {
  const { data, error } = await supabase.functions.invoke('suggest-youtube-videos', {
    body: {
      lessonTitle: lesson.title,
      contenu: lesson.contenu || '',
      exemplesExercices: lesson.exemples_exercices || '',
      gradeLevel: lesson.grade_level,
      subject: lesson.subjects?.name || 'Matière',
    }
  });

  if (error) throw error;
  return { videos: data?.videos || [] };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return secureErrorResponse('Missing jobId', 400);
    }

    console.log('📋 Starting job processing:', jobId);

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('ai_generation_jobs')
      .select('*, lessons(*, subjects(name))')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('Job not found:', jobError);
      return secureErrorResponse('Job not found', 404);
    }

    // Check if job is already running or completed
    if (job.status !== 'pending') {
      console.log('Job already processed or running:', job.status);
      return secureJsonResponse({ message: 'Job already processed', status: job.status });
    }

    const config = job.config as JobConfig;
    const lesson = job.lessons;

    if (!lesson) {
      await supabase
        .from('ai_generation_jobs')
        .update({ 
          status: 'failed', 
          error_message: 'Lesson not found',
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId);
      return secureErrorResponse('Lesson not found', 404);
    }

    // Calculate total tasks - only count features that are actually processed
    // Note: image generation and audio are NOT processed server-side
    const totalTasks = 
      config.selectedSections.length + 
      (config.generateQuiz ? 1 : 0) + 
      (config.generateVideos ? 1 : 0);

    // Initialize progress
    const progress: JobProgress = {
      current: 0,
      total: totalTasks,
      sections: [],
    };

    // Mark job as running
    await supabase
      .from('ai_generation_jobs')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        progress,
      })
      .eq('id', jobId);

    const resultContent: Record<string, any> = {};
    let hasErrors = false;

    // Generate sections
    for (const sectionName of config.selectedSections) {
      // Check if job was cancelled
      const { data: currentJob } = await supabase
        .from('ai_generation_jobs')
        .select('status')
        .eq('id', jobId)
        .single();
      
      if (currentJob?.status === 'cancelled') {
        console.log('Job cancelled by user');
        return secureJsonResponse({ message: 'Job cancelled' });
      }

      progress.current++;
      await updateJobProgress(supabase, jobId, progress, sectionName, 'running');

      try {
        console.log(`📝 Generating section: ${sectionName}`);
        const startTime = Date.now();
        
        const result = await withRetry(
          () => generateSection(supabase, lesson, sectionName, config),
          sectionName
        );
        
        resultContent[sectionName] = result.content;
        progress.sections.push({
          name: sectionName,
          status: 'completed',
          content: result.content,
          wordCount: result.wordCount,
        });

        // Log to ai_generation_logs
        await supabase.from('ai_generation_logs').insert({
          lesson_id: lesson.id,
          section_name: sectionName,
          target_words: config.wordCounts[sectionName],
          additional_context: config.globalContext,
          response_content: result.content,
          word_count: result.wordCount,
          generation_time_ms: Date.now() - startTime,
          success: true,
          generated_by: job.created_by,
        });

        console.log(`✅ Section ${sectionName} completed`);
      } catch (error: any) {
        console.error(`❌ Error generating ${sectionName}:`, error);
        hasErrors = true;
        
        progress.sections.push({
          name: sectionName,
          status: 'error',
          error: error.message,
        });

        // Log failure
        await supabase.from('ai_generation_logs').insert({
          lesson_id: lesson.id,
          section_name: sectionName,
          success: false,
          error_message: error.message,
          generated_by: job.created_by,
        });
      }

      await updateJobProgress(supabase, jobId, progress);

      // Rate limiting delay
      if (config.selectedSections.indexOf(sectionName) < config.selectedSections.length - 1) {
        await sleep(INTER_CALL_DELAY);
      }
    }

    // Generate quiz if selected
    if (config.generateQuiz) {
      progress.current++;
      await updateJobProgress(supabase, jobId, progress, 'quiz_final');

      try {
        console.log('📝 Generating quiz...');
        const result = await generateQuiz(supabase, { ...lesson, ...resultContent });
        resultContent.quiz_final = result.content;
        
        progress.sections.push({
          name: 'quiz_final',
          status: 'completed',
          content: typeof result.content === 'string' ? result.content : JSON.stringify(result.content),
        });
        console.log('✅ Quiz completed');
      } catch (error: any) {
        console.error('❌ Error generating quiz:', error);
        hasErrors = true;
        progress.sections.push({
          name: 'quiz_final',
          status: 'error',
          error: error.message,
        });
      }
      
      await updateJobProgress(supabase, jobId, progress);
      await sleep(INTER_CALL_DELAY);
    }

    // Suggest videos if selected
    if (config.generateVideos) {
      progress.current++;
      await updateJobProgress(supabase, jobId, progress, 'youtube_url');

      try {
        console.log('📝 Suggesting videos...');
        const result = await suggestVideos(supabase, { ...lesson, ...resultContent });
        
        if (result.videos.length > 0) {
          resultContent.youtube_url = `https://www.youtube.com/watch?v=${result.videos[0].id}`;
          resultContent.suggested_videos = JSON.stringify(result.videos);
          progress.sections.push({
            name: 'youtube_url',
            status: 'completed',
          });
          console.log('✅ Videos suggested');
        } else {
          progress.sections.push({
            name: 'youtube_url',
            status: 'error',
            error: 'Aucune vidéo trouvée',
          });
        }
      } catch (error: any) {
        console.error('❌ Error suggesting videos:', error);
        hasErrors = true;
        progress.sections.push({
          name: 'youtube_url',
          status: 'error',
          error: error.message,
        });
      }
      
      await updateJobProgress(supabase, jobId, progress);
    }

    // Note: Image generation and audio TTS are not supported server-side
    // They must be added separately via the lesson editor

    // Save generated content to the lessons table
    // DEFENSIVE: Separate core content save from optional metadata
    // so a failure in optional fields doesn't lose core content
    
    // Step 1: Save core section content
    const coreUpdates: Record<string, any> = {};
    for (const section of progress.sections) {
      if (section.status === 'completed' && section.content) {
        const columnName = section.name === 'quiz_final' ? 'quiz_final' 
          : section.name === 'activites_interactives' ? 'activites_interactives'
          : section.name;
        coreUpdates[columnName] = section.content;
      }
    }

    if (Object.keys(coreUpdates).length > 0) {
      const { error: coreError } = await supabase
        .from('lessons')
        .update(coreUpdates)
        .eq('id', lesson.id);

      if (coreError) {
        console.error('❌ Failed to save core content:', coreError);
        hasErrors = true;
      } else {
        console.log('✅ Core lesson content saved:', Object.keys(coreUpdates));
      }
    }

    // Step 2: Save optional metadata (youtube_url, suggested_videos) separately
    const metadataUpdates: Record<string, any> = {};
    if (resultContent.youtube_url) {
      metadataUpdates.youtube_url = resultContent.youtube_url;
    }
    if (resultContent.suggested_videos) {
      metadataUpdates.suggested_videos = resultContent.suggested_videos;
    }

    if (Object.keys(metadataUpdates).length > 0) {
      const { error: metaError } = await supabase
        .from('lessons')
        .update(metadataUpdates)
        .eq('id', lesson.id);

      if (metaError) {
        console.warn('⚠️ Failed to save optional metadata (non-critical):', metaError);
        // Don't set hasErrors - core content was already saved
      } else {
        console.log('✅ Metadata saved:', Object.keys(metadataUpdates));
      }
    }

    // Mark job as completed
    const finalStatus = hasErrors ? 'completed' : 'completed'; // Still completed but with partial results
    
    await supabase
      .from('ai_generation_jobs')
      .update({
        status: finalStatus,
        progress,
        result_content: resultContent,
        completed_at: new Date().toISOString(),
        error_message: hasErrors ? 'Some sections failed to generate' : null,
      })
      .eq('id', jobId);

    console.log('🎉 Job processing complete:', { 
      jobId, 
      sectionsCompleted: progress.sections.filter(s => s.status === 'completed').length,
      sectionsWithErrors: progress.sections.filter(s => s.status === 'error').length,
    });

    return secureJsonResponse({ 
      success: true, 
      status: finalStatus,
      resultContent,
    });

  } catch (error: any) {
    console.error('❌ Fatal job processing error:', error);
    
    // Try to mark job as failed
    try {
      const { jobId } = await req.json();
      if (jobId) {
        await supabase
          .from('ai_generation_jobs')
          .update({
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString(),
          })
          .eq('id', jobId);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
    
    return secureErrorResponse(error.message || 'Job processing failed', 500);
  }
});
