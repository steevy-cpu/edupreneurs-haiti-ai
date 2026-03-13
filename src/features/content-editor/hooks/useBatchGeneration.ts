/**
 * @file useBatchGeneration.ts
 * @description Manages batch content generation pipeline — processing lessons in batches,
 * generating sections via edge functions, handling images, quiz, video, and audio TTS.
 * Contains the entire generateLessonSections function (~350 lines).
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadBase64ImageToStorage } from "@/utils/uploadBase64ImageToStorage";
import type { SectionName } from "@/lib/lessonPrompts";
import type { GenerationStatus, LessonGenerationStatus } from "@/types/batch-generation.types";

/** Configuration passed from the parent orchestrator */
export interface BatchGenerationConfig {
  fetchLessons: () => Promise<any[]>;
  selectedSections: SectionName[];
  generateQuiz: boolean;
  generateVideos: boolean;
  generateAudio: boolean;
  imageGenerationModel: 'none' | 'openai' | 'lovable';
  onlyEmpty: boolean;
  wordCounts: Record<string, number>;
  globalContext: string;
  setActiveInnerTab: (tab: 'generation' | 'validation') => void;
}

export const useBatchGeneration = (config: BatchGenerationConfig) => {
  const {
    fetchLessons, selectedSections, generateQuiz, generateVideos,
    generateAudio, imageGenerationModel, onlyEmpty, wordCounts,
    globalContext, setActiveInnerTab,
  } = config;

  // Generation progress states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const [lessonStatuses, setLessonStatuses] = useState<LessonGenerationStatus[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);

  // Sync ref with state to avoid stale closure in async loops
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  /** Validate inputs and show confirmation for large batches (>10 lessons) */
  const handleStartGeneration = useCallback(async () => {
    if (selectedSections.length === 0 && !generateQuiz && !generateVideos && imageGenerationModel === 'none' && !generateAudio) {
      toast.error("Sélectionnez au moins une section ou fonctionnalité");
      return;
    }

    const lessons = await fetchLessons();
    
    if (!lessons || lessons.length === 0) {
      toast.error("Aucune leçon trouvée avec ces critères");
      return;
    }

    // Rate limiting warning for very large batches
    if (lessons.length >= 50) {
      toast.warning(`Attention: ${lessons.length} leçons à traiter. Cela peut prendre du temps et être limité par le rate limiting.`);
    }

    // Return lesson count for confirmation dialog (>10 lessons)
    if (lessons.length > 10) {
      return { needsConfirmation: true, lessonCount: lessons.length };
    }

    await startGeneration();
    return { needsConfirmation: false, lessonCount: lessons.length };
  }, [selectedSections, generateQuiz, generateVideos, imageGenerationModel, generateAudio, fetchLessons]);

  /** Begin the batch generation pipeline */
  const startGeneration = useCallback(async () => {
    const lessons = await fetchLessons();
    
    if (!lessons || lessons.length === 0) {
      toast.error("Aucune leçon trouvée avec ces critères");
      return;
    }

    setAllLessons(lessons);
    const batchSize = 50;
    const numBatches = Math.ceil(lessons.length / batchSize);
    setTotalBatches(numBatches);
    setCurrentBatch(1);

    if (numBatches > 1) {
      toast.info(`${lessons.length} leçons trouvées. Génération par lots de ${batchSize} leçons.`);
    }

    setActiveInnerTab('generation');
    await processBatch(lessons, 1, batchSize, numBatches);
  }, [fetchLessons, setActiveInnerTab]);

  /** Process a single batch of lessons sequentially with 3s delay between each */
  const processBatch = async (allLessonsData: any[], batchNumber: number, batchSize: number, totalBatchCount: number) => {
    const startIdx = (batchNumber - 1) * batchSize;
    const endIdx = Math.min(startIdx + batchSize, allLessonsData.length);
    const batchLessons = allLessonsData.slice(startIdx, endIdx);

    toast.info(`Début du lot ${batchNumber}/${totalBatchCount}: ${batchLessons.length} leçons`);

    setTotalLessons(batchLessons.length);
    setCompletedCount(0);
    setLessonStatuses(batchLessons.map(l => ({
      lessonId: l.id,
      title: l.title,
      status: 'pending',
      sectionsGenerated: [],
      generationTime: 0,
    })));
    setIsGenerating(true);
    setIsPaused(false);
    isPausedRef.current = false;

    for (let i = 0; i < batchLessons.length; i++) {
      // Use ref for immediate pause check (avoids stale state closure)
      if (isPausedRef.current) break;

      const lesson = batchLessons[i];
      await generateLessonSections(lesson, i);
      
      // 3s delay between lessons to respect rate limits
      if (i < batchLessons.length - 1 && !isPausedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    setIsGenerating(false);
    
    if (batchNumber < totalBatchCount) {
      toast.success(`Lot ${batchNumber}/${totalBatchCount} terminé. Prêt pour le lot suivant.`);
    } else {
      toast.success(`Génération terminée!`);
      setAllLessons([]);
      setCurrentBatch(0);
      setTotalBatches(0);
    }
  };

  /** Generate all selected sections for a single lesson — the core pipeline function */
  const generateLessonSections = async (lesson: any, index: number) => {
    const startTime = Date.now();
    
    setLessonStatuses(prev => prev.map((l, i) =>
      i === index ? { ...l, status: 'in_progress' as GenerationStatus } : l
    ));

    try {
      // === CONTENT SECTIONS ===
      if (selectedSections.length > 0) {
        for (const sectionName of selectedSections) {
          const shouldGenerate = onlyEmpty ? !lesson[sectionName] || lesson[sectionName].trim() === '' : true;
          
          if (!shouldGenerate) continue;

          const subjectName = lesson.subjects?.name || 'Général';

          let generatedContent: string;

          if (sectionName === 'activites_interactives') {
            // Interactive activities use a dedicated edge function
            const fullContent = [lesson.contenu || '', lesson.exemples_exercices || ''].filter(Boolean).join('\n\n');
            
            const { data, error } = await supabase.functions.invoke('generate-interactive-activities', {
              body: {
                exercisesContent: fullContent,
                lessonTitle: lesson.title,
                gradeLevel: lesson.grade_level,
                subject: subjectName,
              }
            });

            if (error) throw error;
            generatedContent = data.content;
          } else {
            // Standard section generation
            const { data, error } = await supabase.functions.invoke('generate-lesson-section', {
              body: {
                lessonId: lesson.id,
                sectionName,
                lessonTitle: lesson.title,
                subject: subjectName,
                gradeLevel: lesson.grade_level,
                targetWords: wordCounts[sectionName],
                context: globalContext,
              }
            });

            if (error) throw error;
            generatedContent = data.content;
          }

          setLessonStatuses(prev => prev.map((l, i) => {
            if (i === index) {
              return {
                ...l,
                sectionsGenerated: [...l.sectionsGenerated, sectionName],
                generatedContent: { ...l.generatedContent, [sectionName]: generatedContent }
              };
            }
            return l;
          }));

          // Clear regeneration flag if applicable
          const updatePayload: Record<string, any> = { [sectionName]: generatedContent };
          if (sectionName === 'activites_interactives') {
            updatePayload.needs_activities_regeneration = false;
            updatePayload.activities_alignment_score = null;
          }
          await supabase
            .from('lessons')
            .update(updatePayload)
            .eq('id', lesson.id);
        }
      }

      // === QUIZ GENERATION ===
      if (generateQuiz) {
        try {
          const { data: quizData, error: quizError } = await supabase.functions.invoke('generate-quiz-final', {
            body: {
              lessonTitle: lesson.title,
              contenu: lesson.contenu || '',
              exemplesExercices: lesson.exemples_exercices || '',
              gradeLevel: lesson.grade_level,
              subject: lesson.subjects?.name || 'Matière',
            }
          });

          if (quizError) {
            console.error('Quiz generation error:', quizError);
            setLessonStatuses(prev => prev.map((l, i) =>
              i === index ? { ...l, error: (l.error || '') + ' Quiz: ' + quizError.message } : l
            ));
          } else if (quizData?.quizContent) {
            await supabase.from('lessons').update({ 
              quiz_final: quizData.quizContent,
              needs_quiz_regeneration: false,
              content_alignment_score: null
            }).eq('id', lesson.id);
            setLessonStatuses(prev => prev.map((l, i) => {
              if (i === index) {
                return { 
                  ...l, 
                  sectionsGenerated: [...l.sectionsGenerated, 'quiz_final'],
                  generatedContent: { ...l.generatedContent, quiz_final: quizData.quizContent } 
                };
              }
              return l;
            }));
          }
        } catch (e: any) {
          console.error('Quiz generation exception:', e);
          setLessonStatuses(prev => prev.map((l, i) =>
            i === index ? { ...l, error: (l.error || '') + ' Quiz: ' + e.message } : l
          ));
        }
      }

      // === VIDEO SUGGESTIONS ===
      if (generateVideos) {
        try {
          const { data: videoData, error: videoError } = await supabase.functions.invoke('suggest-youtube-videos', {
            body: {
              lessonTitle: lesson.title,
              contenu: lesson.contenu || '',
              exemplesExercices: lesson.exemples_exercices || '',
              gradeLevel: lesson.grade_level,
              subject: lesson.subjects?.name || 'Matière',
            }
          });

          if (videoError) {
            console.error('Video suggestion error:', videoError);
            setLessonStatuses(prev => prev.map((l, i) =>
              i === index ? { ...l, error: (l.error || '') + ' Video: ' + videoError.message } : l
            ));
          } else {
            const videos = videoData?.videos || [];
            setLessonStatuses(prev => prev.map((l, i) => {
              if (i === index) {
                return { ...l, generatedContent: { ...l.generatedContent, youtube_videos: videos } };
              }
              return l;
            }));
          }
        } catch (e: any) {
          console.error('Video suggestion exception:', e);
          setLessonStatuses(prev => prev.map((l, i) =>
            i === index ? { ...l, error: (l.error || '') + ' Video: ' + e.message } : l
          ));
        }
      }

      // === EXPLANATORY IMAGE GENERATION ===
      if (imageGenerationModel !== 'none') {
        try {
          const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-explanatory-images', {
            body: {
              lessonTitle: lesson.title,
              contenu: lesson.contenu || '',
              exemplesExercices: lesson.exemples_exercices || '',
              gradeLevel: lesson.grade_level,
              subject: lesson.subjects?.name || 'Matière',
              model: imageGenerationModel,
            }
          });

          if (imageError) {
            console.error('Image generation error:', imageError);
            setLessonStatuses(prev => prev.map((l, i) =>
              i === index ? { ...l, error: (l.error || '') + ' Images: ' + imageError.message } : l
            ));
          } else if (imageData?.images && imageData.images.length > 0) {
            // Group images by target section
            const contenuImages = imageData.images.filter((img: any) => 
              !img.insertAt || img.insertAt === 'contenu'
            );
            const exemplesImages = imageData.images.filter((img: any) => 
              img.insertAt === 'exemples_exercices'
            );
            
            console.log('[Images] Distribution:', {
              total: imageData.images.length,
              contenu: contenuImages.length,
              exemples: exemplesImages.length
            });

            // Build updates for each section — upload to storage first
            const lessonUpdates: Record<string, string> = {};
            
            if (contenuImages.length > 0) {
              let updatedContenu = lesson.contenu || '';
              for (let i = 0; i < contenuImages.length; i++) {
                const img = contenuImages[i];
                if (img.base64Data) {
                  const imageUrl = await uploadBase64ImageToStorage(img.base64Data, lesson.id, img.concept || 'image', i);
                  if (imageUrl) {
                    updatedContenu += `\n\n<figure class="my-4"><img src="${imageUrl}" alt="${img.concept || 'Image explicative'}" class="rounded-lg max-w-full" /><figcaption class="text-sm text-muted-foreground mt-2">${img.concept || ''}</figcaption></figure>`;
                  }
                }
              }
              lessonUpdates.contenu = updatedContenu;
            }
            
            if (exemplesImages.length > 0) {
              // Fetch current exemples_exercices to append to
              const { data: currentLesson } = await supabase
                .from('lessons')
                .select('exemples_exercices')
                .eq('id', lesson.id)
                .single();
              
              let updatedExemples = currentLesson?.exemples_exercices || '';
              for (let i = 0; i < exemplesImages.length; i++) {
                const img = exemplesImages[i];
                if (img.base64Data) {
                  const imageUrl = await uploadBase64ImageToStorage(img.base64Data, lesson.id, img.concept || 'exemple', i);
                  if (imageUrl) {
                    updatedExemples += `\n\n<figure class="my-4"><img src="${imageUrl}" alt="${img.concept || 'Image explicative'}" class="rounded-lg max-w-full" /><figcaption class="text-sm text-muted-foreground mt-2">${img.concept || ''}</figcaption></figure>`;
                  }
                }
              }
              lessonUpdates.exemples_exercices = updatedExemples;
            }
            
            if (Object.keys(lessonUpdates).length > 0) {
              await supabase.from('lessons').update(lessonUpdates).eq('id', lesson.id);
            }
            
            setLessonStatuses(prev => prev.map((l, i) => {
              if (i === index) {
                return { 
                  ...l, 
                  sectionsGenerated: [...l.sectionsGenerated, 'images'],
                  generatedContent: { ...l.generatedContent, images: imageData.images } 
                };
              }
              return l;
            }));
          }
        } catch (e: any) {
          console.error('Image generation exception:', e);
          setLessonStatuses(prev => prev.map((l, i) =>
            i === index ? { ...l, error: (l.error || '') + ' Images: ' + e.message } : l
          ));
        }
      }

      // === AUDIO TTS (ElevenLabs) ===
      if (generateAudio) {
        const cleanForTTS = (htmlOrText: string) =>
          (htmlOrText || '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Fetch latest content (may have been updated by previous steps)
        const { data: latestLesson, error: latestError } = await supabase
          .from('lessons')
          .select('objectif, introduction, contenu, exemples_exercices')
          .eq('id', lesson.id)
          .single();

        if (latestError) {
          console.error('Audio TTS: failed to load lesson content:', latestError);
          setLessonStatuses(prev => prev.map((l, i) =>
            i === index ? { ...l, error: (l.error || '') + ' Audio: ' + latestError.message } : l
          ));
        } else {
          const audioPlan = [
            { sectionName: 'objectif' as const, sourceField: 'objectif' as const },
            { sectionName: 'introduction' as const, sourceField: 'introduction' as const },
            { sectionName: 'contenu' as const, sourceField: 'contenu' as const },
            { sectionName: 'exemples' as const, sourceField: 'exemples_exercices' as const },
          ];

          for (let ai = 0; ai < audioPlan.length; ai++) {
            const { sectionName, sourceField } = audioPlan[ai];
            const rawText = (latestLesson as any)?.[sourceField] || '';
            const cleanText = cleanForTTS(rawText);

            if (!cleanText) continue;

            try {
              const { error: ttsError } = await supabase.functions.invoke('elevenlabs-tts', {
                body: {
                  text: cleanText,
                  lessonId: lesson.id,
                  sectionName,
                }
              });

              if (ttsError) throw ttsError;

              setLessonStatuses(prev => prev.map((l, i) => {
                if (i === index) {
                  return {
                    ...l,
                    sectionsGenerated: [...l.sectionsGenerated, `audio_${sectionName}`],
                  };
                }
                return l;
              }));

              // Rate limiting: 3s between audio generations
              if (ai < audioPlan.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 3000));
              }
            } catch (e: any) {
              console.error('Audio TTS error:', e);
              setLessonStatuses(prev => prev.map((l, i) =>
                i === index ? { ...l, error: (l.error || '') + ` Audio(${sectionName}): ` + (e?.message || 'Erreur') } : l
              ));

              // Small backoff before next section
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }

          // Fetch final audio URLs and store in state
          const { data: lessonWithAudio } = await supabase
            .from('lessons')
            .select('audio_objectif_url, audio_introduction_url, audio_contenu_url, audio_exemples_url')
            .eq('id', lesson.id)
            .single();

          if (lessonWithAudio) {
            setLessonStatuses(prev => prev.map((l, i) => {
              if (i === index) {
                return {
                  ...l,
                  audioUrls: {
                    objectif: lessonWithAudio.audio_objectif_url || undefined,
                    introduction: lessonWithAudio.audio_introduction_url || undefined,
                    contenu: lessonWithAudio.audio_contenu_url || undefined,
                    exemples: lessonWithAudio.audio_exemples_url || undefined,
                  }
                };
              }
              return l;
            }));
          }
        }
      }

      // Mark lesson as completed with timing info
      const generationTime = Date.now() - startTime;
      setLessonStatuses(prev => prev.map((l, i) =>
        i === index ? { ...l, status: 'completed' as GenerationStatus, generationTime } : l
      ));
      setCompletedCount(prev => prev + 1);

    } catch (error: any) {
      setLessonStatuses(prev => prev.map((l, i) =>
        i === index ? { ...l, status: 'error' as GenerationStatus, error: error.message } : l
      ));
    }
  };

  /** Export generation results as CSV for review */
  const exportGenerationResults = useCallback(() => {
    const csv = [
      ['Leçon', 'Statut', 'Sections générées', 'Temps (ms)', 'Erreur'],
      ...lessonStatuses.map(l => [
        l.title,
        l.status,
        l.sectionsGenerated.join(', '),
        l.generationTime.toString(),
        l.error || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-generation-${new Date().toISOString()}.csv`;
    a.click();
  }, [lessonStatuses]);

  return {
    isGenerating,
    isPaused, setIsPaused,
    lessonStatuses, setLessonStatuses,
    totalLessons,
    completedCount,
    allLessons,
    currentBatch,
    totalBatches,
    handleStartGeneration,
    startGeneration,
    generateLessonSections,
    exportGenerationResults,
  };
};
