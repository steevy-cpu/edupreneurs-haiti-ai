import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { PlayCircle, PauseCircle, Download, RefreshCw, Loader2, CheckCircle2, XCircle, Clock, Eye, Check, ChevronDown, AlertTriangle, BookOpen, HelpCircle, Gamepad2 } from "lucide-react";
import { DEFAULT_WORD_COUNTS, type SectionName } from "@/lib/lessonPrompts";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { createSanitizedMarkup } from "@/lib/sanitize";
import type { GenerationStatus, LessonGenerationStatus } from "@/types/batch-generation.types";

export const BatchLessonGenerator = () => {
  const navigate = useNavigate();
  const [gradeLevel, setGradeLevel] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [series, setSeries] = useState<string[]>([]);
  const [availableLessons, setAvailableLessons] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<SectionName[]>([
    'objectif', 'introduction', 'contenu', 'exemples_exercices', 'activites_interactives'
  ]);
  const [generateQuiz, setGenerateQuiz] = useState(false);
  const [generateVideos, setGenerateVideos] = useState(false);
  const [imageGenerationModel, setImageGenerationModel] = useState<'none' | 'openai' | 'lovable'>('none');
  const [onlyEmpty, setOnlyEmpty] = useState(false);
  const [wordCounts, setWordCounts] = useState(DEFAULT_WORD_COUNTS);
  const [globalContext, setGlobalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  // Guard to prevent useEffect from clearing cross-grade selection
  const crossGradeSelectionRef = useRef(false);
  // Track generation start time for elapsed/remaining estimates
  const generationStartTimeRef = useRef<number>(0);
  const [lessonStatuses, setLessonStatuses] = useState<LessonGenerationStatus[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [hasGeneratedOptionalContent, setHasGeneratedOptionalContent] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [previewLesson, setPreviewLesson] = useState<LessonGenerationStatus | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [isLoadingAllIncomplete, setIsLoadingAllIncomplete] = useState(false);
  // Content health dashboard counts
  const [healthCounts, setHealthCounts] = useState<{ missingContent: number; missingQuiz: number; missingActivities: number } | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);
  // Advanced settings collapsed state
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const isNS3OrNS4 = gradeLevel === "NS3" || gradeLevel === "NS4";

  const gradeLevels = [
    { value: "all", label: "Tous les niveaux" },
    { value: "7AF", label: "7AF" },
    { value: "8AF", label: "8AF" },
    { value: "9AF", label: "9AF" },
    { value: "NS1", label: "NS1" },
    { value: "NS2", label: "NS2" },
    { value: "NS3", label: "NS3" },
    { value: "NS4", label: "NS4" },
  ];

  const seriesOptions = [
    { value: "all", label: "Toutes les séries" },
    { value: "LLA", label: "LLA - Lettres, Langues et Arts" },
    { value: "SES", label: "SES - Sciences Économiques et Sociales" },
    { value: "SMP", label: "SMP - Sciences Mathématiques et Physiques" },
    { value: "SVT", label: "SVT - Sciences de la Vie et de la Terre" },
  ];

  // Fetch content health counts on mount for the dashboard
  useEffect(() => {
    fetchHealthCounts();
  }, []);

  // Load subjects when grade level or series changes
  useEffect(() => {
    loadSubjects();
  }, [gradeLevel, series]);

  // Fetch live counts of missing content, quiz, and activities across all published lessons
  const fetchHealthCounts = async () => {
    setIsLoadingHealth(true);
    try {
      // Three parallel count queries for content health dashboard
      const [contentRes, quizRes, activitiesRes] = await Promise.all([
        supabase.from('lessons').select('id', { count: 'exact', head: true })
          .eq('is_published', true)
          .or('contenu.is.null,contenu.eq.,introduction.is.null,introduction.eq.,exemples_exercices.is.null,exemples_exercices.eq.'),
        supabase.from('lessons').select('id', { count: 'exact', head: true })
          .eq('is_published', true)
          .or('quiz_final.is.null,quiz_final.eq.'),
        supabase.from('lessons').select('id', { count: 'exact', head: true })
          .eq('is_published', true)
          .or('activites_interactives.is.null,activites_interactives.eq.'),
      ]);
      setHealthCounts({
        missingContent: contentRes.count ?? 0,
        missingQuiz: quizRes.count ?? 0,
        missingActivities: activitiesRes.count ?? 0,
      });
    } catch (err) {
      console.error('Error fetching health counts:', err);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const loadSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      let query = supabase
        .from('subjects')
        .select('id, name, slug, grade_level, series')
        .order('name');

      // Filter by grade level if not "all"
      if (gradeLevel !== "all") {
        query = query.eq('grade_level', gradeLevel);
      }

      // Filter by series for NS3/NS4
      if (isNS3OrNS4 && series.length > 0) {
        query = query.in('series', series);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAvailableSubjects(data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error("Erreur lors du chargement des matières");
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const sections: { value: SectionName; label: string }[] = [
    { value: "objectif", label: "Objectif" },
    { value: "introduction", label: "Introduction" },
    { value: "contenu", label: "Contenu principal" },
    { value: "exemples_exercices", label: "Exemples & Exercices" },
    { value: "activites_interactives", label: "Activités Interactives" },
  ];

  const toggleSection = (section: SectionName) => {
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Section preset helpers for common combinations
  const PRESET_CORPS: SectionName[] = ['contenu', 'introduction', 'exemples_exercices'];
  const PRESET_ALL: SectionName[] = ['objectif', 'introduction', 'contenu', 'exemples_exercices', 'activites_interactives'];

  const applySectionPreset = (preset: SectionName[]) => {
    setSelectedSections(preset);
  };

  // Elapsed time formatter for progress display
  const formatElapsedTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSec = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSec}s` : `${remainingSec}s`;
  };

  // Estimate remaining time based on average per lesson
  const getEstimatedRemaining = () => {
    if (completedCount === 0 || !generationStartTimeRef.current) return null;
    const elapsed = Date.now() - generationStartTimeRef.current;
    const avgPerLesson = elapsed / completedCount;
    const remaining = avgPerLesson * (totalLessons - completedCount);
    return formatElapsedTime(remaining);
  };

  // Count total sections that will be generated for pre-gen summary
  const getTotalSectionsToGenerate = () => {
    const lessonCount = selectedLessonIds.length || 0;
    const sectionCount = selectedSections.length + (generateQuiz ? 1 : 0) + (generateVideos ? 1 : 0) + (imageGenerationModel !== 'none' ? 1 : 0);
    return { lessonCount, sectionCount, total: lessonCount * sectionCount };
  };

  // Helper function to extract image URLs from HTML content
  const extractImageUrls = (htmlContent: string): string[] => {
    const regex = /<img[^>]+src="([^">]+)"/g;
    const urls: string[] = [];
    let match;
    while ((match = regex.exec(htmlContent)) !== null) {
      const url = match[1];
      // Only extract URLs from lesson-images bucket
      if (url.includes('/storage/v1/object/public/lesson-images/')) {
        urls.push(url);
      }
    }
    return urls;
  };

  // Helper function to delete old images from storage
  const deleteOldImages = async (imageUrls: string[]) => {
    if (imageUrls.length === 0) return;

    console.log(`🗑️ Deleting ${imageUrls.length} old image(s)...`);
    
    for (const url of imageUrls) {
      try {
        // Extract the file path from the URL
        const urlParts = url.split('/lesson-images/');
        if (urlParts.length === 2) {
          const filePath = urlParts[1];
          const { error } = await supabase.storage
            .from('lesson-images')
            .remove([filePath]);
          
          if (error) {
            console.error(`Failed to delete ${filePath}:`, error);
          } else {
            console.log(`✅ Deleted: ${filePath}`);
          }
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };

  // Helper function to remove all image HTML from content
  const removeAllImageHtml = (htmlContent: string): string => {
    // Remove all <div class="my-6 flex justify-center">...</div> blocks containing images
    let cleaned = htmlContent.replace(/<div class="my-6 flex justify-center">[\s\S]*?<\/div>\s*<\/div>/g, '');
    
    // Also remove standalone <img> tags
    cleaned = cleaned.replace(/<img[^>]*>/g, '');
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
    
    return cleaned;
  };

  // Load lessons when grade level or subject changes
  useEffect(() => {
    // Skip clearing when cross-grade fetch just set the selection
    if (crossGradeSelectionRef.current) {
      crossGradeSelectionRef.current = false;
      return;
    }
    if (gradeLevel !== "all" || subject !== "all") {
      loadLessonsForSelection();
    } else {
      setAvailableLessons([]);
      setSelectedLessonIds([]);
    }
  }, [gradeLevel, subject]);

  const loadLessonsForSelection = async () => {
    setIsLoadingLessons(true);
    try {
      let query = supabase
        .from('lessons')
        .select('id, title, grade_level, subject_id, subjects(name)')
        .order('title');

      if (gradeLevel !== "all") {
        query = query.eq('grade_level', gradeLevel);
      }

      if (subject !== "all") {
        query = query.eq('subject_id', subject);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAvailableLessons(data || []);
    } catch (error) {
      console.error('Error loading lessons:', error);
      toast.error("Erreur lors du chargement des leçons");
    } finally {
      setIsLoadingLessons(false);
    }
  };

  // Fetch all incomplete lessons across all grades — bypasses grade/subject filters
  const fetchAllIncompleteLessons = async () => {
    setIsLoadingAllIncomplete(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title')
        .eq('is_published', true)
        .or('contenu.is.null,contenu.eq.,introduction.is.null,introduction.eq.,exemples_exercices.is.null,exemples_exercices.eq.');

      if (error) throw error;

      const ids = (data || []).map(l => l.id);
      // Guard FIRST: prevent the grade/subject useEffect from clearing the selection
      crossGradeSelectionRef.current = true;
      // Set filters to "all" before setting IDs — semantically clearer order
      setGradeLevel("all");
      setSubject("all");
      setSelectedLessonIds(ids);
      // Auto-enable onlyEmpty to preserve existing objectif/quiz_final
      setOnlyEmpty(true);

      toast.success(`${ids.length} leçons incomplètes sélectionnées`);
    } catch (error) {
      console.error('Error fetching incomplete lessons:', error);
      toast.error("Erreur lors de la récupération des leçons incomplètes");
    } finally {
      setIsLoadingAllIncomplete(false);
    }
  };

  const fetchLessons = async () => {
    try {
      console.log('🔍 Fetching lessons with:', {
        selectedLessonIds,
        gradeLevel,
        subject,
        onlyEmpty
      });

      // If specific lessons are selected, return only those lessons
      if (selectedLessonIds.length > 0) {
        const { data: selectedLessons, error } = await supabase
          .from('lessons')
          .select('id, title, grade_level, objectif, introduction, contenu, exemples_exercices, activites_interactives, subjects(name)')
          .in('id', selectedLessonIds);

        if (error) {
          console.error('❌ Error fetching selected lessons:', error);
          toast.error("Erreur lors de la récupération des leçons: " + error.message);
          return [];
        }
        console.log('✅ Selected lessons fetched:', selectedLessons?.length);
        return selectedLessons || [];
      }

      // Otherwise, fetch lessons based on filters
      let query = supabase.from('lessons').select('id, title, grade_level, objectif, introduction, contenu, exemples_exercices, activites_interactives, subjects(name)');

      if (gradeLevel !== "all") {
        query = query.eq('grade_level', gradeLevel);
      }

      if (subject !== "all") {
        query = query.eq('subject_id', subject);
      }

      console.log('📡 Executing query...');
      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching lessons:', error);
        toast.error("Erreur lors de la récupération des leçons: " + error.message);
        return [];
      }

      console.log('✅ Lessons fetched:', data?.length || 0);

      // Filter for empty sections if needed
      if (onlyEmpty && selectedLessonIds.length === 0) {
        const filtered = (data || []).filter(lesson =>
          selectedSections.some(section => !lesson[section] || lesson[section].trim() === '')
        );
        console.log('🔎 Filtered for empty sections:', filtered.length);
        return filtered;
      }

      return data || [];
    } catch (error: any) {
      console.error('💥 Unexpected error in fetchLessons:', error);
      toast.error("Erreur inattendue: " + error.message);
      return [];
    }
  };

  const startGeneration = async () => {
    if (selectedSections.length === 0 && !generateQuiz && !generateVideos && imageGenerationModel === 'none') {
      toast.error("Sélectionnez au moins une section ou fonctionnalité");
      return;
    }

    console.log('🚀 Starting generation with filters:', {
      gradeLevel,
      subject,
      selectedLessonIds,
      onlyEmpty
    });

    const lessons = await fetchLessons();
    
    console.log('📚 Fetched lessons:', lessons?.length || 0);
    
    if (!lessons || lessons.length === 0) {
      toast.error("Aucune leçon trouvée avec ces critères. Vérifiez qu'il existe des leçons.");
      return;
    }

    // Store all lessons and calculate batches
    setAllLessons(lessons);
    // Record start time for elapsed/remaining time estimates
    generationStartTimeRef.current = Date.now();
    const batchSize = 50;
    const numBatches = Math.ceil(lessons.length / batchSize);
    setTotalBatches(numBatches);
    setCurrentBatch(1);

    if (numBatches > 1) {
      toast.info(`${lessons.length} leçons trouvées. Génération par lots de ${batchSize} leçons.`);
    }

    // Process first batch
    await processBatch(lessons, 1, batchSize, numBatches);
  };

  const processBatch = async (allLessonsData: any[], batchNumber: number, batchSize: number, totalBatchCount: number) => {
    const startIdx = (batchNumber - 1) * batchSize;
    const endIdx = Math.min(startIdx + batchSize, allLessonsData.length);
    const batchLessons = allLessonsData.slice(startIdx, endIdx);

    console.log(`📦 Processing batch ${batchNumber}/${totalBatchCount}: lessons ${startIdx + 1}-${endIdx}`);
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
    // Fix: reset ref on new batch start
    isPausedRef.current = false;
    setIsPaused(false);

    let localCompleted = 0;

    for (let i = 0; i < batchLessons.length; i++) {
      // Fix: read from ref instead of stale state
      if (isPausedRef.current) break;

      const lesson = batchLessons[i];
      const didSucceed = await generateLessonSections(lesson, i);

      if (didSucceed) {
        localCompleted++;
        // Auto-publish immediately after each lesson succeeds
        await supabase
          .from('lessons')
          .update({ is_published: true, workflow_status: 'published' })
          .eq('id', lesson.id);
      }
      
      // 3 second pause between lessons
      if (i < batchLessons.length - 1 && !isPausedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    setIsGenerating(false);
    
    const hasMoreBatches = batchNumber < totalBatchCount;
    if (hasMoreBatches) {
      toast.success(`Lot ${batchNumber}/${totalBatchCount} terminé: ${localCompleted}/${batchLessons.length} leçons. Prêt pour le lot suivant.`);
    } else {
      toast.success(`Génération terminée: ${localCompleted}/${batchLessons.length} leçons du dernier lot.`);
      setAllLessons([]);
      setCurrentBatch(0);
      setTotalBatches(0);
    }
  };

  const continueNextBatch = async () => {
    if (currentBatch >= totalBatches || allLessons.length === 0) {
      toast.error("Aucun lot suivant à traiter");
      return;
    }

    const nextBatch = currentBatch + 1;
    setCurrentBatch(nextBatch);
    await processBatch(allLessons, nextBatch, 50, totalBatches);
  };

  const generateLessonSections = async (lesson: any, index: number): Promise<boolean> => {
    const startTime = Date.now();
    
    console.log('🟢 [Batch] Starting generation for lesson:', {
      id: lesson.id,
      title: lesson.title,
      gradeLevel: lesson.grade_level,
      subjects: lesson.subjects
    });
    
    setLessonStatuses(prev => prev.map((l, i) =>
      i === index ? { ...l, status: 'in_progress' as GenerationStatus } : l
    ));

    let retryCount = 0;
    const maxRetries = 3;
    let success = false;
    let errorMessage = "";

    // Fix: use ref for pause check in async loop
    while (retryCount < maxRetries && !success && !isPausedRef.current) {
      try {
        // Generate each selected section (only if sections are selected)
        if (selectedSections.length > 0) {
          for (const sectionName of selectedSections) {
          const shouldGenerate = onlyEmpty ? !lesson[sectionName] || lesson[sectionName].trim() === '' : true;
          
          if (!shouldGenerate) {
            console.log('🟡 [Batch] Skipping section (already has content):', sectionName);
            continue;
          }

          // Extract subject name from joined data
          const subjectName = lesson.subjects?.name || 'Général';

          let generatedContent: string;
          let generationData: any;

          // Special handling for activites_interactives section
          if (sectionName === 'activites_interactives') {
            console.log('🎮 [Batch] Generating interactive activities');
            
            // Combine both contenu and exemples_exercices to get all exercises
            const fullContent = [
              lesson.contenu || '',
              lesson.exemples_exercices || ''
            ].filter(Boolean).join('\n\n');
            
            const { data, error } = await supabase.functions.invoke('generate-interactive-activities', {
              body: {
                exercisesContent: fullContent,
                lessonTitle: lesson.title,
                gradeLevel: lesson.grade_level,
                subject: subjectName,
              }
            });

            if (error) {
              console.error('❌ [Batch] Edge function error:', error);
              throw error;
            }

            generatedContent = data.content;
            generationData = { content: data.content, wordCount: data.content.split(/\s+/).length };
          } else {
            // Standard generation for other sections
            console.log('🔵 [Batch] Calling edge function with:', {
              lessonId: lesson.id,
              sectionName,
              lessonTitle: lesson.title,
              subject: subjectName,
              gradeLevel: lesson.grade_level,
              targetWords: wordCounts[sectionName]
            });

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

            if (error) {
              console.error('❌ [Batch] Edge function error:', error);
              throw error;
            }

            generatedContent = data.content;
            generationData = data;
          }

          console.log('✅ [Batch] Section generated successfully:', {
            sectionName,
            wordCount: generationData?.wordCount,
            generationTime: generationData?.generationTime
          });

          // Store generated content in status
          setLessonStatuses(prev => prev.map((l, i) => {
            if (i === index) {
              return {
                ...l,
                sectionsGenerated: [...l.sectionsGenerated, sectionName],
                generatedContent: {
                  ...l.generatedContent,
                  [sectionName]: generatedContent
                }
              };
            }
            return l;
          }));

          // Update lesson in database (clear regeneration flag if applicable)
          const updatePayload: Record<string, any> = { [sectionName]: generatedContent };
          if (sectionName === 'activites_interactives') {
            updatePayload.needs_activities_regeneration = false;
            updatePayload.activities_alignment_score = null;
          }
          await supabase
            .from('lessons')
            .update(updatePayload)
            .eq('id', lesson.id);

          // Log successful generation to analytics
          const { data: { user } } = await supabase.auth.getUser();
          await supabase.from('ai_generation_logs').insert({
            lesson_id: lesson.id,
            section_name: sectionName,
            target_words: wordCounts[sectionName],
            additional_context: globalContext || null,
            response_content: generatedContent,
            word_count: generationData.wordCount || null,
            generation_time_ms: generationData.generationTimeMs || null,
            success: true,
            generated_by: user?.id,
          });
        }
        }  // End of sections loop and if block

        // Generate Quiz Final if selected (OUTSIDE the sections if block)
        if (generateQuiz) {
          try {
            console.log('📝 [Batch] Generating Quiz Final');
            
            const { data: quizData, error: quizError } = await supabase.functions.invoke('generate-quiz-final', {
              body: {
                lessonTitle: lesson.title,
                contenu: lesson.contenu || '',
                exemplesExercices: lesson.exemples_exercices || '',
                gradeLevel: lesson.grade_level,
                subject: lesson.subjects?.name || 'Matière',
              }
            });

            if (!quizError && quizData?.quizContent) {
              // Auto-save quiz to DB immediately (Fix 3)
              await supabase
                .from('lessons')
                .update({ quiz_final: quizData.quizContent })
                .eq('id', lesson.id);

              // Store in lesson status for preview buttons to show
              setLessonStatuses(prev => prev.map((l, i) => {
                if (i === index) {
                  return {
                    ...l,
                    generatedContent: {
                      ...l.generatedContent,
                      quiz_final: quizData.quizContent
                    }
                  };
                }
                return l;
              }));
              setHasGeneratedOptionalContent(true);
              
              console.log('✅ [Batch] Quiz Final generated and saved');
            }
          } catch (error) {
            console.error('❌ [Batch] Error generating quiz:', error);
          }
        }

        // Suggest YouTube videos if selected (OUTSIDE the sections if block)
        if (generateVideos) {
          try {
            console.log('🎥 [Batch] Suggesting YouTube videos');
            
            const { data: videoData, error: videoError } = await supabase.functions.invoke('suggest-youtube-videos', {
              body: {
                lessonTitle: lesson.title,
                contenu: lesson.contenu || '',
                exemplesExercices: lesson.exemples_exercices || '',
                gradeLevel: lesson.grade_level,
                subject: lesson.subjects?.name || 'Matière',
              }
            });

            // Store videos in lesson status (even if empty array) to show preview buttons
            const videos = videoData?.videos || [];
            setLessonStatuses(prev => prev.map((l, i) => {
              if (i === index) {
                return {
                  ...l,
                  generatedContent: {
                    ...l.generatedContent,
                    youtube_videos: videos
                  }
                };
              }
              return l;
            }));
            setHasGeneratedOptionalContent(true);
            
            if (videos.length > 0) {
              console.log('✅ [Batch] YouTube videos suggested:', videos.length);
            } else {
              console.log('ℹ️ [Batch] No YouTube videos found');
            }
          } catch (error) {
            console.error('❌ [Batch] Error suggesting videos:', error);
          }
        }

        // Generate explanatory images if selected
        if (imageGenerationModel !== 'none') {
          try {
            console.log('🎨 [Batch] Generating explanatory images');
            
            // Step 1: Clean up old images before generating new ones
            const oldContenuImages = extractImageUrls(lesson.contenu || '');
            const oldExemplesImages = extractImageUrls(lesson.exemples_exercices || '');
            const allOldImages = [...oldContenuImages, ...oldExemplesImages];
            
            if (allOldImages.length > 0) {
              console.log(`🗑️ Found ${allOldImages.length} old image(s) to clean up for lesson: ${lesson.title}`);
              await deleteOldImages(allOldImages);
            }
            
            // Step 2: Generate new images
            const { data: imagesData, error: imagesError } = await supabase.functions.invoke('generate-explanatory-images', {
              body: {
                lessonTitle: lesson.title,
                contenu: lesson.contenu || '',
                exemplesExercices: lesson.exemples_exercices || '',
                gradeLevel: lesson.grade_level,
                subject: lesson.subjects?.name || 'Matière',
              }
            });

            if (!imagesError && imagesData?.images && imagesData.images.length > 0) {
              // Store in lesson status for preview
              setLessonStatuses(prev => prev.map((l, i) => {
                if (i === index) {
                  return {
                    ...l,
                    generatedContent: {
                      ...l.generatedContent,
                      explanatory_images: imagesData.images
                    }
                  };
                }
                return l;
              }));
              setHasGeneratedOptionalContent(true);
              
              console.log('✅ [Batch] Generated', imagesData.images.length, 'explanatory images');
            }
          } catch (error) {
            console.error('❌ [Batch] Error generating images:', error);
          }
        }

        // Mark as success if any content was generated (sections or optional features)
        success = selectedSections.length > 0 || generateQuiz || generateVideos || imageGenerationModel !== 'none';
        const generationTime = Date.now() - startTime;
        
        setLessonStatuses(prev => prev.map((l, i) =>
          i === index ? { ...l, status: 'completed' as GenerationStatus, generationTime } : l
        ));
        setCompletedCount(prev => prev + 1);

      } catch (error: any) {
        retryCount++;
        errorMessage = error.message;
        
        console.error('❌ [Batch] Generation error:', {
          error: errorMessage,
          retryCount,
          lessonId: lesson.id
        });

        // Log failed generation to analytics
        if (retryCount === 1) {
          const { data: { user } } = await supabase.auth.getUser();
          await supabase.from('ai_generation_logs').insert({
            lesson_id: lesson.id,
            section_name: selectedSections[0], // Log first section attempted
            target_words: wordCounts[selectedSections[0]],
            additional_context: globalContext || null,
            success: false,
            error_message: errorMessage,
            generation_time_ms: Date.now() - startTime,
            retry_count: retryCount,
            generated_by: user?.id,
          });
        }
        
        if (error.message?.includes('429')) {
          console.log('⏱️ [Batch] Rate limited, waiting 10s...');
          await new Promise(resolve => setTimeout(resolve, 10000));
        } else if (retryCount >= maxRetries) {
          console.error('💥 [Batch] Max retries reached for lesson:', lesson.id);
          setLessonStatuses(prev => prev.map((l, i) =>
            i === index ? { ...l, status: 'error' as GenerationStatus, error: errorMessage } : l
          ));
        }
      }
    }
    return success;
  };

  const retryFailed = async () => {
    const failedLessons = lessonStatuses.filter(l => l.status === 'error');
    
    for (const lessonStatus of failedLessons) {
      if (isPausedRef.current) break;
      
      const { data: lesson } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonStatus.lessonId)
        .single();
        
      if (lesson) {
        const index = lessonStatuses.findIndex(l => l.lessonId === lessonStatus.lessonId);
        await generateLessonSections(lesson, index);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  };

  const exportResults = () => {
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
  };

  const handlePreviewLesson = (lesson: LessonGenerationStatus) => {
    setPreviewLesson(lesson);
    setIsPreviewOpen(true);
  };

  const handleRegenerateLesson = async (lessonId: string) => {
    try {
      // Find the lesson in statuses
      const lessonIndex = lessonStatuses.findIndex(l => l.lessonId === lessonId);
      if (lessonIndex === -1) return;

      // Fetch the full lesson data
      const { data: lesson, error } = await supabase
        .from('lessons')
        .select('id, title, grade_level, objectif, introduction, contenu, exemples_exercices, subjects(name)')
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      // Reset the lesson status
      setLessonStatuses(prev => prev.map((l, i) =>
        i === lessonIndex ? { ...l, status: 'pending', sectionsGenerated: [], generationTime: 0, error: undefined, generatedContent: {} } : l
      ));

      toast.info("Régénération en cours...");

      // Regenerate the lesson
      await generateLessonSections(lesson, lessonIndex);
      
      toast.success("Leçon régénérée avec succès!");
    } catch (error: any) {
      console.error('Error regenerating lesson:', error);
      toast.error("Erreur lors de la régénération: " + error.message);
    }
  };

  const handlePublishAllCompleted = async () => {
    const completedLessons = lessonStatuses.filter(l => l.status === 'completed');
    if (completedLessons.length === 0) {
      toast.error("Aucune leçon complétée à publier");
      return;
    }

    setIsApplying(true);
    let successCount = 0;
    let errorCount = 0;

    for (const lesson of completedLessons) {
      try {
        await handleApplyLesson(lesson.lessonId, true);
        successCount++;
      } catch (error) {
        console.error(`Error publishing lesson ${lesson.title}:`, error);
        errorCount++;
      }
    }

    setIsApplying(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} leçon(s) publiée(s) avec succès${errorCount > 0 ? `, ${errorCount} erreur(s)` : ''}`);
    } else {
      toast.error("Erreur lors de la publication des leçons");
    }
  };

  const handleApplyLesson = async (lessonId: string, shouldPublish: boolean = false) => {
    setIsApplying(true);
    try {
      console.log('🔄 Starting to apply lesson...');
      
      // Find the lesson status to get generated content
      const lessonStatus = lessonStatuses.find(l => l.lessonId === lessonId);
      if (!lessonStatus || !lessonStatus.generatedContent) {
        toast.error("Aucun contenu généré trouvé");
        return;
      }

      // Get current lesson data
      const { data: currentLesson } = await supabase
        .from('lessons')
        .select('contenu, exemples_exercices')
        .eq('id', lessonId)
        .single();

      const updates: any = {};
      const generatedContent = lessonStatus.generatedContent;
      
      console.log('Generated content:', generatedContent);
      
      // Start with generated or existing content
      let updatedContenu = generatedContent.contenu || currentLesson?.contenu || '';
      let updatedExemples = generatedContent.exemples_exercices || currentLesson?.exemples_exercices || '';
      
      // CRITICAL: Remove all existing image HTML before processing new images
      // This ensures old images are removed when regenerating
      if (generatedContent.explanatory_images) {
        console.log('🧹 Cleaning old images from content before inserting new ones...');
        updatedContenu = removeAllImageHtml(updatedContenu);
        updatedExemples = removeAllImageHtml(updatedExemples);
      }
      
      // Process explanatory images if they exist
      if (generatedContent.explanatory_images) {
        const images = generatedContent.explanatory_images;
        console.log(`📸 Processing ${images.length} images...`);
        
        // Separate images by their target section
        const contenuImages: any[] = [];
        const exemplesImages: any[] = [];
        
        for (const image of images) {
          if (image.insertAt === 'contenu') {
            contenuImages.push(image);
          } else if (image.insertAt === 'exemples_exercices') {
            exemplesImages.push(image);
          }
        }
        
        console.log(`📊 Distribution: ${contenuImages.length} for contenu, ${exemplesImages.length} for exemples`);
        
        for (const image of images) {
          try {
            console.log(`🖼️ Processing image: ${image.concept} (insertAt: ${image.insertAt})`);
            
            // Convert base64 to blob for WebP format
            const base64Data = image.base64Data;
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Create canvas to convert PNG to WebP
            const blob = new Blob([bytes], { type: 'image/png' });
            const imageBitmap = await createImageBitmap(blob);
            const canvas = document.createElement('canvas');
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(imageBitmap, 0, 0);
            
            // Convert to WebP with quality 85 for good compression
            const webpBlob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((blob) => resolve(blob!), 'image/webp', 0.85);
            });
            
            console.log(`✅ Converted to WebP, size: ${webpBlob.size} bytes (from ${blob.size} bytes)`);
            
            // Sanitize filename to remove special characters
            const sanitizedConcept = image.concept
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9\s-]/gi, '')
              .replace(/\s+/g, '-')
              .toLowerCase()
              .substring(0, 100);
            
            // Upload to Supabase Storage with WebP extension
            const fileName = `${lessonId}/${sanitizedConcept}-${Date.now()}.webp`;
            console.log(`📤 Uploading to: ${fileName}`);
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('lesson-images')
              .upload(fileName, webpBlob, {
                contentType: 'image/webp',
                upsert: true
              });
            
            if (uploadError) {
              console.error('❌ Error uploading image:', uploadError);
              toast.error(`Erreur lors de l'upload de l'image: ${image.concept}`);
              continue;
            }
            
            console.log('✅ Image uploaded successfully');
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('lesson-images')
              .getPublicUrl(fileName);
            
            console.log(`🔗 Public URL: ${publicUrl}`);
            
            // Create HTML for the image without the heading
            const imageHtml = `
<div class="my-6 flex justify-center">
  <div class="max-w-2xl">
    <img 
      src="${publicUrl}" 
      alt="${image.description}"
      class="w-full rounded-lg shadow-lg border border-border"
      loading="lazy"
    />
    <p class="text-sm text-center text-muted-foreground mt-2 italic">
      ${image.description}
    </p>
  </div>
</div>
`;
            
            // Add image to the appropriate section array for later insertion
            if (image.insertAt === 'contenu') {
              const paragraphs = updatedContenu.split('\n\n');
              const insertIndex = Math.floor(paragraphs.length / (contenuImages.length + 1)) * (contenuImages.indexOf(image) + 1);
              paragraphs.splice(insertIndex, 0, imageHtml);
              updatedContenu = paragraphs.join('\n\n');
              console.log(`➕ Added image ${contenuImages.indexOf(image) + 1}/${contenuImages.length} to contenu at position ${insertIndex}`);
            } else if (image.insertAt === 'exemples_exercices') {
              const paragraphs = updatedExemples.split('\n\n');
              const insertIndex = Math.floor(paragraphs.length / (exemplesImages.length + 1)) * (exemplesImages.indexOf(image) + 1);
              paragraphs.splice(insertIndex, 0, imageHtml);
              updatedExemples = paragraphs.join('\n\n');
              console.log(`➕ Added image ${exemplesImages.indexOf(image) + 1}/${exemplesImages.length} to exemples at position ${insertIndex}`);
            }
          } catch (imageError) {
            console.error('❌ Error processing image:', imageError);
            toast.error(`Erreur lors du traitement de l'image: ${image.concept}`);
          }
        }
        
        console.log('✅ All images processed and inserted');
      }
      
      // Function to remove AI-generated image description headings
      const cleanImageDescriptions = (text: string): string => {
        // Remove markdown headings that describe images (### followed by emoji and description)
        return text.replace(/###\s*[\u{1F300}-\u{1F9FF}]\s*[^\n]+\n\n?/gu, '');
      };
      
      // Clean the content before saving
      updatedContenu = cleanImageDescriptions(updatedContenu);
      updatedExemples = cleanImageDescriptions(updatedExemples);
      
      // Apply generated sections
      if (generatedContent.objectif) updates.objectif = generatedContent.objectif;
      if (generatedContent.introduction) updates.introduction = generatedContent.introduction;
      if (generatedContent.activites_interactives) updates.activites_interactives = generatedContent.activites_interactives;
      
      // Always update contenu and exemples if images were generated
      if (generatedContent.explanatory_images) {
        updates.contenu = updatedContenu;
        updates.exemples_exercices = updatedExemples;
        console.log('📝 Updating database with images included (descriptions cleaned)');
      } else {
        if (generatedContent.contenu) updates.contenu = generatedContent.contenu;
        if (generatedContent.exemples_exercices) updates.exemples_exercices = generatedContent.exemples_exercices;
      }
      
      // Apply Quiz Final
      if (generatedContent.quiz_final) {
        updates.quiz_final = generatedContent.quiz_final;
        console.log('✅ Applying Quiz Final:', generatedContent.quiz_final.substring(0, 100) + '...');
      }
      
      // Handle YouTube videos - pick the most relevant one (first in sorted list)
      if (generatedContent.youtube_videos && Array.isArray(generatedContent.youtube_videos)) {
        const videos = generatedContent.youtube_videos;
        if (videos.length > 0) {
          // Videos are already sorted by relevance in the edge function
          const bestVideo = videos[0];
          updates.youtube_url = `https://www.youtube.com/watch?v=${bestVideo.id}`;
          console.log('✅ Applying most relevant YouTube video:', bestVideo.title);
        }
      }
      
      if (shouldPublish) {
        updates.is_published = true;
        updates.workflow_status = 'published';
      }

      console.log('💾 Saving updates to database:', Object.keys(updates));

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('lessons')
          .update(updates)
          .eq('id', lessonId);

        if (error) {
          console.error('❌ Database update error:', error);
          throw error;
        }
      }

      console.log('✅ Database updated successfully');
      toast.success(shouldPublish ? "Leçon publiée avec succès (images incluses)!" : "Contenu appliqué avec succès (images incluses)!");
      setIsPreviewOpen(false);
    } catch (error: any) {
      console.error('Error applying lesson:', error);
      toast.error("Erreur lors de l'application: " + error.message);
    } finally {
      setIsApplying(false);
    }
  };

  const getSectionLabel = (sectionName: string) => {
    const labels: Record<string, string> = {
      objectif: "Objectif",
      introduction: "Introduction",
      contenu: "Contenu principal",
      exemples_exercices: "Exemples & Exercices",
      activites_interactives: "Activités Interactives",
      quiz_final: "Quiz Final",
      youtube_videos: "Vidéos YouTube"
    };
    return labels[sectionName] || sectionName;
  };

  const getStatusIcon = (status: GenerationStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'in_progress': return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* A. Content Health Dashboard — at-a-glance counts */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            📊 État du contenu
            {isLoadingHealth && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Button variant="ghost" size="sm" className="ml-auto h-7" onClick={fetchHealthCounts} disabled={isLoadingHealth}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        {healthCounts && (
          <CardContent className="pt-0 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Missing content count — clickable to auto-select */}
              <button
                onClick={fetchAllIncompleteLessons}
                disabled={isLoadingAllIncomplete || isGenerating}
                className="flex items-center gap-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors text-left"
              >
                <BookOpen className="h-5 w-5 text-destructive shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-destructive">{healthCounts.missingContent}</p>
                  <p className="text-xs text-muted-foreground">sans contenu complet</p>
                </div>
                {isLoadingAllIncomplete && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
              </button>
              {/* Missing quiz count */}
              <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <HelpCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-amber-600">{healthCounts.missingQuiz}</p>
                  <p className="text-xs text-muted-foreground">sans quiz</p>
                </div>
              </div>
              {/* Missing activities count */}
              <div className="flex items-center gap-3 p-3 rounded-lg border border-orange-500/20 bg-orange-500/5">
                <Gamepad2 className="h-5 w-5 text-orange-600 shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-orange-600">{healthCounts.missingActivities}</p>
                  <p className="text-xs text-muted-foreground">sans activités</p>
                </div>
              </div>
            </div>
            {/* Selection badge when cross-grade selection is active */}
            {selectedLessonIds.length > 0 && gradeLevel === "all" && subject === "all" && (
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="secondary">{selectedLessonIds.length} leçons sélectionnées</Badge>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedLessonIds([])}>
                  Effacer la sélection
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration de la génération par lot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grade, Subject, and Lesson Selection */}
          <div className={`grid grid-cols-1 gap-4 ${isNS3OrNS4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            <div className="space-y-2">
              <Label>Niveau scolaire</Label>
              <Select value={gradeLevel} onValueChange={(value) => {
                setGradeLevel(value);
                setSubject("all");
                setSeries([]);
                setSelectedLessonIds([]);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isNS3OrNS4 && (
              <div className="space-y-2">
                <Label>Série(s)</Label>
                <div className="border rounded-md p-3 space-y-2 bg-background">
                  {seriesOptions.filter(s => s.value !== "all").map((s) => (
                    <div key={s.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`series-${s.value}`}
                        checked={series.includes(s.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSeries([...series, s.value]);
                          } else {
                            setSeries(series.filter(v => v !== s.value));
                          }
                          setSubject("all");
                          setSelectedLessonIds([]);
                        }}
                      />
                      <label
                        htmlFor={`series-${s.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {s.label}
                      </label>
                    </div>
                  ))}
                  {series.length === 0 && (
                    <p className="text-sm text-muted-foreground">Sélectionnez une ou plusieurs séries</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Matière</Label>
              <Select 
                value={subject} 
                onValueChange={(value) => {
                  setSubject(value);
                  setSelectedLessonIds([]);
                }}
                disabled={isLoadingSubjects}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingSubjects ? "Chargement..." : "Toutes les matières"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les matières</SelectItem>
                  {availableSubjects.map(subj => (
                    <SelectItem key={subj.id} value={subj.id}>
                      {subj.name} {subj.series ? `(${subj.series})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Leçon spécifique (optionnel)</Label>
              {isLoadingLessons ? (
                <div className="text-sm text-muted-foreground">Chargement...</div>
              ) : availableLessons.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sélectionnez niveau/matière d'abord</div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLessonIds(availableLessons.map(l => l.id))}
                      disabled={selectedLessonIds.length === availableLessons.length}
                    >
                      Tout sélectionner
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLessonIds([])}
                      disabled={selectedLessonIds.length === 0}
                    >
                      Tout désélectionner
                    </Button>
                  </div>
                  <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                    {availableLessons.map(lesson => (
                      <div key={lesson.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lesson-${lesson.id}`}
                          checked={selectedLessonIds.includes(lesson.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLessonIds(prev => [...prev, lesson.id]);
                            } else {
                              setSelectedLessonIds(prev => prev.filter(id => id !== lesson.id));
                            }
                          }}
                        />
                        <label 
                          htmlFor={`lesson-${lesson.id}`} 
                          className="text-sm cursor-pointer flex-1"
                        >
                          {lesson.title}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedLessonIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {selectedLessonIds.length} leçon(s) sélectionnée(s)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section Selection + onlyEmpty toggle (D: moved here as linked concept) */}
          <div className="space-y-3">
            <div>
              <Label className="text-base">Sections de contenu</Label>
              {/* Section preset buttons for quick selection */}
              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applySectionPreset(PRESET_CORPS)}
                  className={selectedSections.length === PRESET_CORPS.length && PRESET_CORPS.every(s => selectedSections.includes(s)) ? 'border-primary bg-primary/10' : ''}
                >
                  📄 Corps de leçon
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applySectionPreset(PRESET_ALL)}
                  className={selectedSections.length === PRESET_ALL.length ? 'border-primary bg-primary/10' : ''}
                >
                  ✅ Tout sélectionner
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSections([])}
                  className={selectedSections.length === 0 ? 'border-primary bg-primary/10' : ''}
                >
                  ❌ Tout désélectionner
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sections.map(section => (
                  <div key={section.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={section.value}
                      checked={selectedSections.includes(section.value)}
                      onCheckedChange={() => toggleSection(section.value)}
                    />
                    <label htmlFor={section.value} className="text-sm cursor-pointer">
                      {section.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* D: onlyEmpty toggle moved here — directly linked to section selection */}
            <div className="flex items-start space-x-2 p-3 rounded-lg border border-border bg-muted/30">
              <Checkbox
                id="onlyEmpty"
                checked={onlyEmpty}
                onCheckedChange={(checked) => setOnlyEmpty(checked as boolean)}
                className="mt-0.5"
              />
              <div>
                <label htmlFor="onlyEmpty" className="text-sm font-medium cursor-pointer">
                  🛡️ Protéger le contenu existant (sections vides uniquement)
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ne remplit que les sections vides — ne touche pas au contenu déjà rédigé
                </p>
              </div>
            </div>

            <div className="border-t pt-3">
              <Label className="text-base">Fonctionnalités additionnelles</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="batch-quiz-final"
                    checked={generateQuiz}
                    onCheckedChange={(checked) => setGenerateQuiz(checked as boolean)}
                  />
                  <label htmlFor="batch-quiz-final" className="text-sm cursor-pointer">
                    📝 Quiz Final (10-15 questions)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="batch-video-suggest"
                    checked={generateVideos}
                    onCheckedChange={(checked) => setGenerateVideos(checked as boolean)}
                  />
                  <label htmlFor="batch-video-suggest" className="text-sm cursor-pointer">
                    🎥 Appliquer vidéos YouTube automatiquement
                  </label>
                </div>
                <div className="space-y-2">
                  <label htmlFor="batch-image-model" className="text-sm font-medium">
                    🖼️ Générer images explicatives
                  </label>
                  <Select value={imageGenerationModel} onValueChange={(value: 'none' | 'openai' | 'lovable') => setImageGenerationModel(value)}>
                    <SelectTrigger id="batch-image-model">
                      <SelectValue placeholder="Sélectionner un modèle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      <SelectItem value="openai">OpenAI (gpt-image-1)</SelectItem>
                      <SelectItem value="lovable">IA Edupreneurs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* B: Advanced settings — word counts + global context in collapsible */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-3 h-9 text-sm text-muted-foreground hover:text-foreground">
                <span>⚙️ Paramètres avancés (mots par section, contexte)</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2">
              {/* Word Count Sliders */}
              <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/20">
                <Label>Nombre de mots par section</Label>
                {sections.map(section => (
                  <div key={section.value} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{section.label}</span>
                      <span className="text-sm font-medium">{wordCounts[section.value]} mots</span>
                    </div>
                    <Slider
                      value={[wordCounts[section.value]]}
                      onValueChange={([value]) => setWordCounts(prev => ({ ...prev, [section.value]: value }))}
                      min={100}
                      max={2000}
                      step={50}
                    />
                  </div>
                ))}
              </div>

              {/* Global Context */}
              <div className="space-y-2">
                <Label>Contexte global (optionnel)</Label>
                <Textarea
                  placeholder="Ajoutez un contexte qui s'appliquera à toutes les générations..."
                  value={globalContext}
                  onChange={(e) => setGlobalContext(e.target.value)}
                  rows={3}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* C: Pre-generation summary — repositioned directly above action buttons */}
          {selectedLessonIds.length > 0 && (
            <div className={`rounded-lg p-4 space-y-2 ${onlyEmpty ? 'bg-primary/10 border border-primary/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
              <p className="text-sm font-medium">📋 Résumé avant génération</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <strong>{getTotalSectionsToGenerate().lessonCount}</strong> leçon(s) × <strong>{getTotalSectionsToGenerate().sectionCount}</strong> section(s)
                  {selectedSections.length > 0 && (
                    <span className="ml-1">
                      ({selectedSections.map(s => sections.find(sec => sec.value === s)?.label).filter(Boolean).join(', ')})
                    </span>
                  )}
                </p>
                <p className="flex items-center gap-1">
                  {onlyEmpty ? (
                    <>🛡️ Protéger le contenu existant</>
                  ) : (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-amber-600 font-medium">Regénérer toutes les sections (écrasement)</span>
                    </>
                  )}
                </p>
                <p className="text-xs">
                  ⏱️ Estimation : ~{Math.max(1, Math.round(getTotalSectionsToGenerate().lessonCount * 0.35))} minutes
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isGenerating ? (
              <>
                <Button onClick={startGeneration} className="flex-1">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Démarrer la génération
                </Button>
                {currentBatch > 0 && currentBatch < totalBatches && (
                  <Button onClick={continueNextBatch} variant="outline" className="flex-1">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Continuer le lot {currentBatch + 1}/{totalBatches}
                  </Button>
                )}
              </>
            ) : (
              <Button onClick={() => { isPausedRef.current = !isPaused; setIsPaused(!isPaused); }} variant="outline" className="flex-1">
                {isPaused ? <PlayCircle className="mr-2 h-4 w-4" /> : <PauseCircle className="mr-2 h-4 w-4" />}
                {isPaused ? 'Reprendre' : 'Pause'}
              </Button>
            )}
            
            {lessonStatuses.length > 0 && (
              <>
                <Button onClick={retryFailed} variant="outline" disabled={isGenerating}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réessayer les erreurs
                </Button>
                <Button onClick={exportResults} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter CSV
                </Button>
                {lessonStatuses.filter(l => l.status === 'completed').length > 0 && (
                  <Button 
                    onClick={handlePublishAllCompleted} 
                    variant="default"
                    disabled={isApplying}
                  >
                    {isApplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Publier toutes ({lessonStatuses.filter(l => l.status === 'completed').length})
                  </Button>
                )}
              </>
            )}
          </div>
          
          {/* Batch Progress Info */}
          {totalBatches > 1 && (
            <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium">
                Traitement par lots: Lot {currentBatch}/{totalBatches}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {allLessons.length} leçons au total seront traitées par lots de 50
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress — enhanced with lesson counter and time estimates */}
      {totalLessons > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{completedCount}/{totalLessons} leçons terminées</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>

            {/* Current lesson indicator + time estimates */}
            {isGenerating && (
              <div className="text-sm text-muted-foreground space-y-1">
                {(() => {
                  const currentLesson = lessonStatuses.find(l => l.status === 'in_progress');
                  if (currentLesson) {
                    return (
                      <p>
                        📖 Leçon {completedCount + 1}/{totalLessons} — <span className="font-medium text-foreground">{currentLesson.title}</span>
                      </p>
                    );
                  }
                  return null;
                })()}
                {generationStartTimeRef.current > 0 && (
                  <p className="text-xs">
                    ⏱️ Écoulé : {formatElapsedTime(Date.now() - generationStartTimeRef.current)}
                    {getEstimatedRemaining() && ` · Restant estimé : ~${getEstimatedRemaining()}`}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-4 text-sm">
              <Badge variant="secondary">
                {lessonStatuses.filter(l => l.status === 'completed').length} Réussis
              </Badge>
              <Badge variant="destructive">
                {lessonStatuses.filter(l => l.status === 'error').length} Erreurs
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      {lessonStatuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {lessonStatuses.map((lesson, index) => (
                <div key={lesson.lessonId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIcon(lesson.status)}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => navigate(`/content-editor?lesson=${lesson.lessonId}`)}
                        className="text-sm font-medium truncate hover:underline text-left"
                      >
                        {lesson.title}
                      </button>
                      {lesson.sectionsGenerated.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {lesson.sectionsGenerated.map(s => getSectionLabel(s)).join(', ')}
                        </p>
                      )}
                      {lesson.error && (
                        <p className="text-xs text-destructive">{lesson.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lesson.generationTime > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {(lesson.generationTime / 1000).toFixed(1)}s
                      </span>
                    )}
                    {lesson.status === 'completed' && lesson.generatedContent && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRegenerateLesson(lesson.lessonId)}
                          disabled={isGenerating}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreviewLesson(lesson)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Aperçu
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApplyLesson(lesson.lessonId, false)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Appliquer
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewLesson?.title}</DialogTitle>
          </DialogHeader>
          
          {previewLesson?.generatedContent && (
            <div className="space-y-6">
              {Object.entries(previewLesson.generatedContent).map(([sectionName, content]) => {
                // Handle YouTube videos specially
                if (sectionName === 'youtube_videos' && Array.isArray(content)) {
                  const videosList: any[] = content;
                  return (
                    <div key={sectionName} className="space-y-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        {getSectionLabel(sectionName)} ({videosList.length})
                      </h3>
                      {videosList.length > 0 ? (
                        <div className="space-y-3">
                          {videosList.slice(0, 2).map((video: any, idx: number) => (
                            <div key={idx} className="border rounded-lg p-3 bg-background/50 space-y-2">
                              <div className="flex items-start gap-3">
                                <img 
                                  src={video.thumbnail} 
                                  alt={video.title}
                                  className="w-32 h-24 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                                  <a 
                                    href={`https://www.youtube.com/watch?v=${video.id}`}
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs text-primary hover:underline mt-1 inline-block"
                                  >
                                    Voir la vidéo →
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
                          Aucune vidéo YouTube trouvée pour cette leçon
                        </div>
                      )}
                    </div>
                  );
                }
                
                // Handle explanatory images
                if (sectionName === 'explanatory_images' && Array.isArray(content)) {
                  const imagesList: any[] = content;
                  return (
                    <div key={sectionName} className="space-y-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Images Explicatives ({imagesList.length})
                      </h3>
                      {imagesList.length > 0 ? (
                        <div className="space-y-3">
                          {imagesList.map((image: any, idx: number) => (
                            <div key={idx} className="border rounded-lg p-3 bg-background/50 space-y-2">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm font-medium">{image.concept}</p>
                                    <p className="text-xs text-muted-foreground">{image.description}</p>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {image.insertAt === 'contenu' ? 'Contenu' : 'Exemples'}
                                  </Badge>
                                </div>
                                <div className="flex justify-center bg-background/80 rounded-lg p-2">
                                  <img 
                                    src={`data:image/png;base64,${image.base64Data}`}
                                    alt={image.description}
                                    className="max-w-full h-auto max-h-64 rounded shadow-md border border-border"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
                          Aucune image générée pour cette leçon
                        </div>
                      )}
                    </div>
                  );
                }
                
                // Handle other sections (strings only)
                if (typeof content === 'string') {
                  return (
                    <div key={sectionName} className="space-y-2">
                      <h3 className="text-lg font-semibold">{getSectionLabel(sectionName)}</h3>
                      {sectionName === 'activites_interactives' ? (
                        <div className="p-4 bg-muted rounded-lg">
                          <InteractiveActivitiesEnhanced 
                            content={content}
                            isLoading={false}
                          />
                        </div>
                      ) : (
                        <div 
                          className="prose prose-sm max-w-none p-4 bg-muted rounded-lg"
                          dangerouslySetInnerHTML={createSanitizedMarkup(content)}
                        />
                      )}
                    </div>
                  );
                }
                
                return null;
              })}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="outline"
              onClick={() => handleApplyLesson(previewLesson!.lessonId, false)}
              disabled={isApplying}
            >
              {isApplying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              Appliquer
            </Button>
            <Button
              onClick={() => handleApplyLesson(previewLesson!.lessonId, true)}
              disabled={isApplying}
            >
              {isApplying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              Appliquer et Publier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
