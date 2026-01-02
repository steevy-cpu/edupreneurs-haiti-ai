import { useState, useEffect, useRef, useCallback } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  PlayCircle, PauseCircle, Download, RefreshCw, Loader2, CheckCircle2, XCircle, Clock, Eye, Check, X,
  ChevronDown, ChevronUp, Sparkles, FileText, Gamepad2, Wand2, AlertTriangle, Zap, RotateCcw
} from "lucide-react";
import { DEFAULT_WORD_COUNTS, type SectionName } from "@/lib/lessonPrompts";
import {
  parseQuizQuestions,
  parseActivities,
  type ParsedQuestion,
  type ParsedActivity,
  type ParsedQuizActivity,
  type ParsedTrueFalseActivity,
  type ParseResult,
} from "@/utils/quizActivityParsing";

// Types
type GenerationStatus = 'pending' | 'in_progress' | 'completed' | 'error';

interface LessonGenerationStatus {
  lessonId: string;
  title: string;
  status: GenerationStatus;
  sectionsGenerated: string[];
  generationTime: number;
  qualityScore?: number;
  error?: string;
  generatedContent?: Record<string, any>;
}

interface LessonValidation {
  lesson: {
    id: string;
    title: string;
    slug: string;
    grade_level: string;
    subject_name: string;
  };
  quizParsed: ParsedQuestion[];
  quizErrors: string[];
  activitiesParsed: ParsedActivity[];
  activityErrors: string[];
  originalActivityContent?: string;
  originalQuizContent?: string;
  aiValidation?: {
    confidence: number;
    issues: Array<{ questionIndex: number; issue: string; suggestedFix?: string }>;
  };
  activityAIValidation?: {
    confidence: number;
    issues: Array<{ activityIndex: number; issue: string; suggestedFix?: string }>;
  };
}

interface ValidationStats {
  total: number;
  quizValid: number;
  quizInvalid: number;
  activitiesValid: number;
  activitiesInvalid: number;
}

interface RegenerationPreview {
  lessonId: string;
  lessonTitle: string;
  type: 'quiz' | 'activity';
  correctedItems: any[];
  newContent: string;
  issuesFixed: number;
}

export const BatchGenerationValidation = () => {
  // Shared filter states
  const [gradeLevel, setGradeLevel] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [series, setSeries] = useState<string[]>([]);
  const [availableLessons, setAvailableLessons] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  // Generation states
  const [selectedSections, setSelectedSections] = useState<SectionName[]>([
    'objectif', 'introduction', 'contenu', 'exemples_exercices', 'activites_interactives'
  ]);
  const [generateQuiz, setGenerateQuiz] = useState(false);
  const [generateVideos, setGenerateVideos] = useState(false);
  const [generateAudio, setGenerateAudio] = useState(false);
  const [imageGenerationModel, setImageGenerationModel] = useState<'none' | 'openai' | 'lovable'>('none');
  const [onlyEmpty, setOnlyEmpty] = useState(false);
  const [wordCounts, setWordCounts] = useState(DEFAULT_WORD_COUNTS);
  const [globalContext, setGlobalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const [lessonStatuses, setLessonStatuses] = useState<LessonGenerationStatus[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [previewLesson, setPreviewLesson] = useState<LessonGenerationStatus | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);

  // Validation states
  const [validations, setValidations] = useState<LessonValidation[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [validationStats, setValidationStats] = useState<ValidationStats>({
    total: 0, quizValid: 0, quizInvalid: 0, activitiesValid: 0, activitiesInvalid: 0,
  });

  // Generate then validate state
  const [isGeneratingThenValidating, setIsGeneratingThenValidating] = useState(false);

  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'generate' | 'validate' | 'generateThenValidate' | null>(null);
  const [pendingLessonCount, setPendingLessonCount] = useState(0);

  // Active inner tab
  const [activeInnerTab, setActiveInnerTab] = useState<'generation' | 'validation'>('generation');

  // Regeneration states
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [regenerationPreview, setRegenerationPreview] = useState<RegenerationPreview | null>(null);
  const [isSavingRegeneration, setIsSavingRegeneration] = useState(false);

  // Publishing states
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [publishedLessons, setPublishedLessons] = useState<Set<string>>(new Set());

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
    { value: "LLA", label: "LLA - Lettres, Langues et Arts" },
    { value: "SES", label: "SES - Sciences Économiques et Sociales" },
    { value: "SMP", label: "SMP - Sciences Mathématiques et Physiques" },
    { value: "SVT", label: "SVT - Sciences de la Vie et de la Terre" },
  ];

  const sections: { value: SectionName; label: string }[] = [
    { value: "objectif", label: "Objectif" },
    { value: "introduction", label: "Introduction" },
    { value: "contenu", label: "Contenu principal" },
    { value: "exemples_exercices", label: "Exemples & Exercices" },
    { value: "activites_interactives", label: "Activités Interactives" },
  ];

  // Fix #2: Sync ref with state
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Load subjects when grade level or series changes
  useEffect(() => {
    loadSubjects();
  }, [gradeLevel, series]);

  // Load lessons when grade level, subject, or series changes
  useEffect(() => {
    if (gradeLevel !== "all" || subject !== "all") {
      loadLessonsForSelection();
    } else {
      setAvailableLessons([]);
      setSelectedLessonIds([]);
    }
  }, [gradeLevel, subject, series]);

  const loadSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      let query = supabase
        .from('subjects')
        .select('id, name, slug, grade_level, series')
        .order('name');

      if (gradeLevel !== "all") {
        query = query.eq('grade_level', gradeLevel);
      }

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

  // Fix #4: Apply series filter in loadLessonsForSelection
  const loadLessonsForSelection = async () => {
    setIsLoadingLessons(true);
    try {
      let query = supabase
        .from('lessons')
        .select('id, title, grade_level, subject_id, subjects(name, series)')
        .order('title');

      if (gradeLevel !== "all") {
        query = query.eq('grade_level', gradeLevel);
      }

      if (subject !== "all") {
        query = query.eq('subject_id', subject);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Fix #4: Filter by series on client side for NS3/NS4
      let filteredData = data || [];
      if (isNS3OrNS4 && series.length > 0 && subject === "all") {
        filteredData = filteredData.filter(lesson => 
          lesson.subjects && series.includes((lesson.subjects as any).series)
        );
      }
      
      setAvailableLessons(filteredData);
    } catch (error) {
      console.error('Error loading lessons:', error);
      toast.error("Erreur lors du chargement des leçons");
    } finally {
      setIsLoadingLessons(false);
    }
  };

  const toggleSection = (section: SectionName) => {
    setSelectedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // ===== GENERATION LOGIC =====
  const fetchLessons = async () => {
    try {
      if (selectedLessonIds.length > 0) {
        const { data: selectedLessons, error } = await supabase
          .from('lessons')
          .select('id, title, grade_level, objectif, introduction, contenu, exemples_exercices, activites_interactives, subjects(name)')
          .in('id', selectedLessonIds);

        if (error) {
          toast.error("Erreur lors de la récupération des leçons: " + error.message);
          return [];
        }
        return selectedLessons || [];
      }

      let query = supabase.from('lessons').select('id, title, grade_level, objectif, introduction, contenu, exemples_exercices, activites_interactives, subjects(name, series)');

      if (gradeLevel !== "all") {
        query = query.eq('grade_level', gradeLevel);
      }

      if (subject !== "all") {
        query = query.eq('subject_id', subject);
      }

      const { data, error } = await query;

      if (error) {
        toast.error("Erreur lors de la récupération des leçons: " + error.message);
        return [];
      }

      let filteredData = data || [];
      
      // Fix #4: Apply series filter
      if (isNS3OrNS4 && series.length > 0 && subject === "all") {
        filteredData = filteredData.filter(lesson => 
          lesson.subjects && series.includes((lesson.subjects as any).series)
        );
      }

      if (onlyEmpty && selectedLessonIds.length === 0) {
        return filteredData.filter(lesson =>
          selectedSections.some(section => !lesson[section] || lesson[section].trim() === '')
        );
      }

      return filteredData;
    } catch (error: any) {
      toast.error("Erreur inattendue: " + error.message);
      return [];
    }
  };

  // Fix #8: Add confirmation for large batches
  const handleStartGeneration = async () => {
    if (selectedSections.length === 0 && !generateQuiz && !generateVideos && imageGenerationModel === 'none') {
      toast.error("Sélectionnez au moins une section ou fonctionnalité");
      return;
    }

    const lessons = await fetchLessons();
    
    if (!lessons || lessons.length === 0) {
      toast.error("Aucune leçon trouvée avec ces critères");
      return;
    }

    // Fix #9: Rate limiting warning for large batches
    if (lessons.length >= 50) {
      toast.warning(`Attention: ${lessons.length} leçons à traiter. Cela peut prendre du temps et être limité par le rate limiting.`);
    }

    // Fix #8: Confirmation for 10+ lessons
    if (lessons.length > 10) {
      setPendingLessonCount(lessons.length);
      setPendingAction('generate');
      setShowConfirmDialog(true);
      return;
    }

    await startGeneration();
  };

  const startGeneration = async () => {
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
  };

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
      // Fix #2: Use ref instead of state for immediate check
      if (isPausedRef.current) break;

      const lesson = batchLessons[i];
      await generateLessonSections(lesson, i);
      
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

  const generateLessonSections = async (lesson: any, index: number) => {
    const startTime = Date.now();
    
    setLessonStatuses(prev => prev.map((l, i) =>
      i === index ? { ...l, status: 'in_progress' as GenerationStatus } : l
    ));

    try {
      if (selectedSections.length > 0) {
        for (const sectionName of selectedSections) {
          const shouldGenerate = onlyEmpty ? !lesson[sectionName] || lesson[sectionName].trim() === '' : true;
          
          if (!shouldGenerate) continue;

          const subjectName = lesson.subjects?.name || 'Général';

          let generatedContent: string;

          if (sectionName === 'activites_interactives') {
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

          await supabase
            .from('lessons')
            .update({ [sectionName]: generatedContent })
            .eq('id', lesson.id);
        }
      }

      // Fix #3: Generate Quiz with proper error handling
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
            await supabase.from('lessons').update({ quiz_final: quizData.quizContent }).eq('id', lesson.id);
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

      // Fix #3: Suggest YouTube videos with proper error handling
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

      // Generate explanatory images
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
            // Append generated images to contenu
            let updatedContenu = lesson.contenu || '';
            for (const img of imageData.images) {
              if (img.imageData) {
                updatedContenu += `\n\n<figure class="my-4"><img src="${img.imageData}" alt="${img.concept || 'Image explicative'}" class="rounded-lg max-w-full" /><figcaption class="text-sm text-muted-foreground mt-2">${img.concept || ''}</figcaption></figure>`;
              }
            }
            await supabase.from('lessons').update({ contenu: updatedContenu }).eq('id', lesson.id);
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

  const exportGenerationResults = () => {
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

  // ===== VALIDATION LOGIC (using imported utilities) =====
  const runValidation = async () => {
    setIsValidating(true);
    setValidations([]);
    setActiveInnerTab('validation');

    try {
      let query = supabase
        .from('lessons')
        .select('id, title, slug, grade_level, quiz_final, activites_interactives, subjects(id, name, series)')
        .or('quiz_final.neq.null,activites_interactives.neq.null');

      if (gradeLevel !== 'all') {
        query = query.eq('grade_level', gradeLevel);
      }

      if (subject !== 'all') {
        query = query.eq('subject_id', subject);
      }

      const { data: lessonsData, error } = await query.order('title');

      if (error) throw error;

      // Fix #4: Filter by series for NS3/NS4
      let filteredLessons = lessonsData || [];
      if (isNS3OrNS4 && series.length > 0 && subject === "all") {
        filteredLessons = filteredLessons.filter(lesson => 
          lesson.subjects && series.includes((lesson.subjects as any).series)
        );
      }

      const results: LessonValidation[] = [];
      let quizValid = 0, quizInvalid = 0, activitiesValid = 0, activitiesInvalid = 0;

      for (const lesson of filteredLessons) {
        // Fix #1: Use imported parsing functions
        const quizResult = lesson.quiz_final ? parseQuizQuestions(lesson.quiz_final) : { items: [], errors: [] };
        const activityResult = lesson.activites_interactives ? parseActivities(lesson.activites_interactives) : { items: [], errors: [] };

        if (lesson.quiz_final) {
          if (quizResult.items.length > 0 && quizResult.errors.length === 0) quizValid++;
          else quizInvalid++;
        }

        if (lesson.activites_interactives) {
          if (activityResult.items.length > 0 && activityResult.errors.length === 0) activitiesValid++;
          else activitiesInvalid++;
        }

        results.push({
          lesson: {
            id: lesson.id,
            title: lesson.title,
            slug: lesson.slug,
            grade_level: lesson.grade_level,
            subject_name: (lesson.subjects as any)?.name || 'N/A',
          },
          quizParsed: quizResult.items,
          quizErrors: quizResult.errors,
          activitiesParsed: activityResult.items,
          activityErrors: activityResult.errors,
          originalActivityContent: lesson.activites_interactives,
          originalQuizContent: lesson.quiz_final,
        });
      }

      setValidations(results);
      setValidationStats({ total: results.length, quizValid, quizInvalid, activitiesValid, activitiesInvalid });
      toast.success(`Validation terminée: ${results.length} leçons analysées`);
    } catch (error) {
      console.error('Validation error:', error);
      toast.error("Erreur lors de la validation");
    } finally {
      setIsValidating(false);
    }
  };

  // Fix #7: Generate then validate function
  const generateThenValidate = async () => {
    setIsGeneratingThenValidating(true);
    try {
      await startGeneration();
      // Wait a bit for generation to complete fully
      await new Promise(resolve => setTimeout(resolve, 2000));
      await runValidation();
      toast.success("Génération et validation terminées!");
    } catch (error) {
      console.error('Generate then validate error:', error);
      toast.error("Erreur lors de l'opération");
    } finally {
      setIsGeneratingThenValidating(false);
    }
  };

  const handleGenerateThenValidate = async () => {
    const lessons = await fetchLessons();
    
    if (!lessons || lessons.length === 0) {
      toast.error("Aucune leçon trouvée avec ces critères");
      return;
    }

    if (lessons.length > 10) {
      setPendingLessonCount(lessons.length);
      setPendingAction('generateThenValidate');
      setShowConfirmDialog(true);
      return;
    }

    await generateThenValidate();
  };

  const handleConfirmAction = async () => {
    setShowConfirmDialog(false);
    
    if (pendingAction === 'generate') {
      await startGeneration();
    } else if (pendingAction === 'validate') {
      await runValidation();
    } else if (pendingAction === 'generateThenValidate') {
      await generateThenValidate();
    }
    
    setPendingAction(null);
    setPendingLessonCount(0);
  };

  const exportValidationCSV = () => {
    const headers = ['Leçon', 'Matière', 'Niveau', 'Quiz Questions', 'Quiz Erreurs', 'Activités', 'Erreurs Activités'];
    const rows = validations.map(v => [
      v.lesson.title,
      v.lesson.subject_name,
      v.lesson.grade_level,
      v.quizParsed.length,
      v.quizErrors.join('; '),
      v.activitiesParsed.length,
      v.activityErrors.join('; '),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-quiz-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  };

  const toggleExpanded = (lessonId: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  // Section labels for preview
  const sectionLabels: Record<string, string> = {
    objectif: 'Objectif',
    introduction: 'Introduction',
    contenu: 'Contenu principal',
    exemples_exercices: 'Exemples & Exercices',
    activites_interactives: 'Activités Interactives',
    quiz_final: 'Quiz Final',
  };

  // Preview handlers for generated content
  const handlePreviewLesson = useCallback((lesson: LessonGenerationStatus) => {
    setPreviewLesson(lesson);
    setIsPreviewOpen(true);
  }, []);

  const handleRegenerateSingleLesson = useCallback(async (lessonId: string) => {
    const lesson = allLessons.find(l => l.id === lessonId) || lessonStatuses.find(l => l.lessonId === lessonId);
    if (!lesson) {
      toast.error("Leçon non trouvée");
      return;
    }

    // Find the index in lessonStatuses
    const index = lessonStatuses.findIndex(l => l.lessonId === lessonId);
    if (index === -1) return;

    // Re-run generation for this single lesson
    const lessonData = allLessons.find(l => l.id === lessonId);
    if (lessonData) {
      await generateLessonSections(lessonData, index);
      toast.success("Régénération terminée");
    }
  }, [allLessons, lessonStatuses]);

  // Regeneration functions for invalid quiz/activities
  const regenerateQuiz = useCallback(async (lessonId: string) => {
    setIsRegenerating(lessonId);
    
    const validation = validations.find(v => v.lesson.id === lessonId);
    if (!validation) {
      toast.error("Leçon non trouvée");
      setIsRegenerating(null);
      return;
    }

    try {
      // Use AI validation issues if available, otherwise create issues from parsing errors
      const issues = validation.aiValidation?.issues || 
        validation.quizParsed.map((_, idx) => ({
          questionIndex: idx,
          issue: validation.quizErrors[0] || "Format ou contenu à vérifier"
        })).slice(0, Math.max(validation.quizErrors.length, 1));

      const { data, error } = await supabase.functions.invoke('fix-invalid-quiz', {
        body: {
          lessonId,
          lessonTitle: validation.lesson.title,
          originalContent: validation.originalQuizContent,
          questions: validation.quizParsed,
          issues,
          needsFullRegeneration: validation.quizParsed.length === 0,
          subject: validation.lesson.subject_name,
          gradeLevel: validation.lesson.grade_level,
          parsingErrors: validation.quizErrors,
        }
      });

      if (error) throw error;

      setRegenerationPreview({
        lessonId,
        lessonTitle: validation.lesson.title,
        type: 'quiz',
        correctedItems: data.correctedQuestions || [],
        newContent: data.newContent || data.newMarkdownContent || '',
        issuesFixed: data.issuesFixed || data.correctedQuestions?.filter((q: any) => q.wasFixed)?.length || 0,
      });

      toast.success("Corrections générées - vérifiez avant de sauvegarder");
    } catch (error: any) {
      console.error('Quiz regeneration error:', error);
      toast.error("Erreur lors de la régénération: " + error.message);
    } finally {
      setIsRegenerating(null);
    }
  }, [validations]);

  const regenerateActivities = useCallback(async (lessonId: string) => {
    setIsRegenerating(lessonId);
    
    const validation = validations.find(v => v.lesson.id === lessonId);
    if (!validation) {
      toast.error("Leçon non trouvée");
      setIsRegenerating(null);
      return;
    }

    try {
      // Use AI validation issues if available, otherwise create issues from parsing errors
      const issues = validation.activityAIValidation?.issues || 
        validation.activitiesParsed.map((_, idx) => ({
          activityIndex: idx,
          issue: validation.activityErrors[0] || "Format ou contenu à vérifier"
        })).slice(0, Math.max(validation.activityErrors.length, 1));

      const { data, error } = await supabase.functions.invoke('fix-invalid-activities', {
        body: {
          lessonId,
          lessonTitle: validation.lesson.title,
          originalContent: validation.originalActivityContent,
          activities: validation.activitiesParsed,
          issues,
          needsFullRegeneration: validation.activitiesParsed.length === 0,
          subject: validation.lesson.subject_name,
          gradeLevel: validation.lesson.grade_level,
          parsingErrors: validation.activityErrors,
        }
      });

      if (error) throw error;

      setRegenerationPreview({
        lessonId,
        lessonTitle: validation.lesson.title,
        type: 'activity',
        correctedItems: data.correctedActivities || [],
        newContent: data.newContent || data.newMarkdownContent || '',
        issuesFixed: data.issuesFixed || data.correctedActivities?.filter((a: any) => a.wasFixed)?.length || 0,
      });

      toast.success("Corrections générées - vérifiez avant de sauvegarder");
    } catch (error: any) {
      console.error('Activity regeneration error:', error);
      toast.error("Erreur lors de la régénération: " + error.message);
    } finally {
      setIsRegenerating(null);
    }
  }, [validations]);

  const saveRegeneratedContent = useCallback(async () => {
    if (!regenerationPreview) return;

    setIsSavingRegeneration(true);
    try {
      const updateField = regenerationPreview.type === 'quiz' ? 'quiz_final' : 'activites_interactives';
      
      const { error } = await supabase
        .from('lessons')
        .update({ [updateField]: regenerationPreview.newContent })
        .eq('id', regenerationPreview.lessonId);

      if (error) throw error;

      // Update local validation state
      setValidations(prev => prev.map(v => {
        if (v.lesson.id !== regenerationPreview.lessonId) return v;

        if (regenerationPreview.type === 'quiz') {
          const parsed = parseQuizQuestions(regenerationPreview.newContent);
          return {
            ...v,
            quizParsed: parsed.items,
            quizErrors: parsed.errors,
            originalQuizContent: regenerationPreview.newContent,
          };
        } else {
          const parsed = parseActivities(regenerationPreview.newContent);
          return {
            ...v,
            activitiesParsed: parsed.items,
            activityErrors: parsed.errors,
            originalActivityContent: regenerationPreview.newContent,
          };
        }
      }));

      toast.success("Contenu corrigé sauvegardé avec succès");
      setRegenerationPreview(null);
    } catch (error: any) {
      console.error('Save regeneration error:', error);
      toast.error("Erreur lors de la sauvegarde: " + error.message);
    } finally {
      setIsSavingRegeneration(false);
    }
  }, [regenerationPreview]);

  // Publishing functions
  const publishLesson = useCallback(async (lessonId: string) => {
    setIsPublishing(lessonId);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ is_published: true, workflow_status: 'published' })
        .eq('id', lessonId);
      
      if (error) throw error;
      
      setPublishedLessons(prev => new Set([...prev, lessonId]));
      toast.success("Leçon publiée avec succès");
    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error("Erreur lors de la publication: " + error.message);
    } finally {
      setIsPublishing(null);
    }
  }, []);

  const publishAllValidLessons = useCallback(async () => {
    const validLessonIds = validations
      .filter(v => v.quizErrors.length === 0 && v.activityErrors.length === 0 && 
                   (v.quizParsed.length > 0 || v.activitiesParsed.length > 0) &&
                   !publishedLessons.has(v.lesson.id))
      .map(v => v.lesson.id);
    
    if (validLessonIds.length === 0) {
      toast.error("Aucune leçon valide à publier");
      return;
    }
    
    setIsPublishing('bulk');
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ is_published: true, workflow_status: 'published' })
        .in('id', validLessonIds);
      
      if (error) throw error;
      
      setPublishedLessons(prev => new Set([...prev, ...validLessonIds]));
      toast.success(`${validLessonIds.length} leçon(s) publiée(s)`);
    } catch (error: any) {
      console.error('Bulk publish error:', error);
      toast.error("Erreur lors de la publication: " + error.message);
    } finally {
      setIsPublishing(null);
    }
  }, [validations, publishedLessons]);

  const validLessonsCount = validations.filter(
    v => v.quizErrors.length === 0 && v.activityErrors.length === 0 && 
         (v.quizParsed.length > 0 || v.activitiesParsed.length > 0) &&
         !publishedLessons.has(v.lesson.id)
  ).length;

  const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  const getStatusIcon = (status: GenerationStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'in_progress': return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'opération</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de {pendingAction === 'generate' ? 'générer du contenu' : pendingAction === 'validate' ? 'valider' : 'générer et valider'} pour <strong>{pendingLessonCount}</strong> leçons.
              {pendingLessonCount >= 50 && (
                <span className="block mt-2 text-warning">⚠️ Attention: Cette opération peut prendre du temps et être limitée par le rate limiting.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Annuler</Button>
            <Button onClick={handleConfirmAction}>Continuer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generation Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu du contenu généré</DialogTitle>
            <DialogDescription>{previewLesson?.title}</DialogDescription>
          </DialogHeader>
          {previewLesson?.generatedContent && (
            <ScrollArea className="max-h-[55vh]">
              <div className="space-y-4">
                {Object.entries(previewLesson.generatedContent).map(([section, content]) => (
                  <Card key={section}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">{sectionLabels[section] || section}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Special handling for images array */}
                      {section === 'images' && Array.isArray(content) ? (
                        <div className="grid grid-cols-2 gap-4">
                          {content.map((img: any, idx: number) => (
                            <div key={idx} className="space-y-2">
                              {img.imageData && (
                                <img 
                                  src={img.imageData} 
                                  alt={img.concept || `Image ${idx + 1}`}
                                  className="w-full rounded-lg border"
                                />
                              )}
                              {img.concept && (
                                <p className="text-xs text-muted-foreground text-center">{img.concept}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div 
                          className="prose prose-sm max-w-none dark:prose-invert text-sm"
                          dangerouslySetInnerHTML={{ __html: String(content).substring(0, 2000) + (String(content).length > 2000 ? '...' : '') }} 
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Fermer</Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsPreviewOpen(false);
                if (previewLesson) handleRegenerateSingleLesson(previewLesson.lessonId);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Régénérer
            </Button>
            <Button 
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              disabled={isApplying}
              onClick={async () => {
                if (!previewLesson) return;
                setIsApplying(true);
                try {
                  const updates: Record<string, string> = {};
                  const content = previewLesson.generatedContent;
                  
                  // Map generated content to database columns
                  if (content.introduction) updates.introduction = content.introduction;
                  if (content.objectif) updates.objectif = content.objectif;
                  if (content.contenu) updates.contenu = content.contenu;
                  if (content.exemples_exercices) updates.exemples_exercices = content.exemples_exercices;
                  if (content.quiz_final) updates.quiz_final = content.quiz_final;
                  if (content.activites_interactives) updates.activites_interactives = content.activites_interactives;
                  
                  // Handle images - append to contenu
                  if (content.images && Array.isArray(content.images)) {
                    const { data: currentLesson } = await supabase
                      .from('lessons')
                      .select('contenu')
                      .eq('id', previewLesson.lessonId)
                      .single();
                    
                    let updatedContenu = updates.contenu || currentLesson?.contenu || '';
                    for (const img of content.images) {
                      if (img.imageData) {
                        updatedContenu += `\n\n<figure class="my-4"><img src="${img.imageData}" alt="${img.concept || 'Image explicative'}" class="rounded-lg max-w-full" /><figcaption class="text-sm text-muted-foreground mt-2">${img.concept || ''}</figcaption></figure>`;
                      }
                    }
                    updates.contenu = updatedContenu;
                  }

                  if (Object.keys(updates).length > 0) {
                    const { error } = await supabase
                      .from('lessons')
                      .update({ ...updates, is_published: true, workflow_status: 'published' })
                      .eq('id', previewLesson.lessonId);
                    
                    if (error) throw error;
                    toast.success("Contenu publié avec succès!");
                    setIsPreviewOpen(false);
                  }
                } catch (error: any) {
                  console.error('Error publishing:', error);
                  toast.error("Erreur lors de la publication: " + error.message);
                } finally {
                  setIsApplying(false);
                }
              }}
            >
              {isApplying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Publier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regeneration Preview Dialog */}
      <Dialog open={!!regenerationPreview} onOpenChange={(open) => !open && setRegenerationPreview(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aperçu des corrections - {regenerationPreview?.lessonTitle}</DialogTitle>
            <DialogDescription>
              {regenerationPreview?.issuesFixed || 0} éléments corrigés. Vérifiez avant de sauvegarder.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[55vh]">
            <div className="space-y-4">
              {regenerationPreview?.correctedItems.map((item, idx) => (
                <Card key={idx} className={item.wasFixed ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={item.wasFixed ? 'default' : 'secondary'}>
                        {item.wasFixed ? 'Corrigé' : 'Inchangé'}
                      </Badge>
                      {regenerationPreview.type === 'quiz' && (
                        <Badge variant="outline">Q{idx + 1}</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">
                      {regenerationPreview.type === 'quiz' ? item.question : item.statement}
                    </p>
                    {item.wasFixed && item.originalIssue && (
                      <p className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded">
                        Problème corrigé: {item.originalIssue}
                      </p>
                    )}
                    {regenerationPreview.type === 'quiz' && item.options && (
                      <div className="mt-2 text-xs space-y-1">
                        {item.options.map((opt: string, optIdx: number) => (
                          <div key={optIdx} className={optIdx === item.correctAnswer ? 'text-green-600 font-medium' : ''}>
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegenerationPreview(null)}>Annuler</Button>
            <Button onClick={saveRegeneratedContent} disabled={isSavingRegeneration}>
              {isSavingRegeneration && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sauvegarder les corrections
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shared Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Génération & Validation en Masse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filter Section */}
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
                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isNS3OrNS4 && (
              <div className="space-y-2">
                <Label>Série(s)</Label>
                <div className="border rounded-md p-3 space-y-2 bg-background">
                  {seriesOptions.map((s) => (
                    <div key={s.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`series-${s.value}`}
                        checked={series.includes(s.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSeries([...series, s.value]);
                          } else {
                            setSeries(series.filter(x => x !== s.value));
                          }
                        }}
                      />
                      <label htmlFor={`series-${s.value}`} className="text-xs cursor-pointer">{s.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Matière</Label>
              <Select value={subject} onValueChange={setSubject} disabled={isLoadingSubjects}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingSubjects ? "Chargement..." : "Sélectionner"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les matières</SelectItem>
                  {availableSubjects.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Leçons spécifiques (optionnel)</Label>
              <Select
                value={selectedLessonIds.length > 0 ? "selected" : "all"}
                onValueChange={(value) => {
                  if (value === "all") setSelectedLessonIds([]);
                }}
                disabled={isLoadingLessons || availableLessons.length === 0}
              >
                <SelectTrigger>
                  <SelectValue>
                    {isLoadingLessons ? "Chargement..." : 
                     selectedLessonIds.length > 0 ? `${selectedLessonIds.length} sélectionnée(s)` : 
                     availableLessons.length > 0 ? `${availableLessons.length} disponibles` : "Sélectionner un niveau/matière"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les leçons du filtre</SelectItem>
                </SelectContent>
              </Select>
              {availableLessons.length > 0 && (
                <ScrollArea className="h-32 border rounded-md mt-2">
                  <div className="p-2 space-y-1">
                    {/* Select All checkbox */}
                    <div className="flex items-center space-x-2 pb-1 mb-1 border-b border-border">
                      <Checkbox
                        id="select-all-lessons"
                        checked={selectedLessonIds.length === availableLessons.length && availableLessons.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedLessonIds(availableLessons.map(l => l.id));
                          } else {
                            setSelectedLessonIds([]);
                          }
                        }}
                      />
                      <label htmlFor="select-all-lessons" className="text-xs cursor-pointer font-medium">
                        Tout sélectionner ({availableLessons.length})
                      </label>
                    </div>
                    {availableLessons.map(lesson => (
                      <div key={lesson.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lesson-${lesson.id}`}
                          checked={selectedLessonIds.includes(lesson.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLessonIds([...selectedLessonIds, lesson.id]);
                            } else {
                              setSelectedLessonIds(selectedLessonIds.filter(id => id !== lesson.id));
                            }
                          }}
                        />
                        <label htmlFor={`lesson-${lesson.id}`} className="text-xs cursor-pointer truncate">
                          {lesson.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleStartGeneration} disabled={isGenerating || isValidating || isGeneratingThenValidating}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Lancer génération
            </Button>
            <Button onClick={runValidation} variant="outline" disabled={isGenerating || isValidating || isGeneratingThenValidating}>
              {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Lancer validation
            </Button>
            {/* Fix #7: New "Générer puis valider" button */}
            <Button onClick={handleGenerateThenValidate} variant="secondary" disabled={isGenerating || isValidating || isGeneratingThenValidating}>
              {isGeneratingThenValidating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Générer puis valider
            </Button>
            {isGenerating && (
              <Button onClick={() => setIsPaused(!isPaused)} variant="outline">
                {isPaused ? <PlayCircle className="mr-2 h-4 w-4" /> : <PauseCircle className="mr-2 h-4 w-4" />}
                {isPaused ? 'Reprendre' : 'Pause'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inner Tabs for Results */}
      <Tabs value={activeInnerTab} onValueChange={(v) => setActiveInnerTab(v as 'generation' | 'validation')}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="generation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Génération {lessonStatuses.length > 0 && `(${completedCount}/${totalLessons})`}
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Validation {validations.length > 0 && `(${validations.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Generation Results Tab */}
        <TabsContent value="generation" className="space-y-4 mt-4">
          {/* Generation Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Options de génération</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base">Sections de contenu</Label>
                <div className="flex flex-wrap gap-2">
                  {sections.map(section => (
                    <div key={section.value} className="flex items-center space-x-2">
                      <Checkbox id={section.value} checked={selectedSections.includes(section.value)} onCheckedChange={() => toggleSection(section.value)} />
                      <label htmlFor={section.value} className="text-sm cursor-pointer">{section.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <Label className="text-base">Fonctionnalités additionnelles</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="batch-quiz-final" checked={generateQuiz} onCheckedChange={(checked) => setGenerateQuiz(checked as boolean)} />
                    <label htmlFor="batch-quiz-final" className="text-sm cursor-pointer">📝 Quiz Final</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="batch-video-suggest" checked={generateVideos} onCheckedChange={(checked) => setGenerateVideos(checked as boolean)} />
                    <label htmlFor="batch-video-suggest" className="text-sm cursor-pointer">🎥 Vidéos YouTube</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="onlyEmpty" checked={onlyEmpty} onCheckedChange={(checked) => setOnlyEmpty(checked as boolean)} />
                    <label htmlFor="onlyEmpty" className="text-sm cursor-pointer">Sections vides uniquement</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="batch-audio-tts" checked={generateAudio} onCheckedChange={(checked) => setGenerateAudio(checked as boolean)} />
                    <label htmlFor="batch-audio-tts" className="text-sm cursor-pointer">🔊 Audio TTS (ElevenLabs)</label>
                  </div>
                </div>
                <div className="mt-3 max-w-xs">
                  <Label htmlFor="batch-image-model" className="text-sm">🖼️ Générer images explicatives</Label>
                  <Select 
                    value={imageGenerationModel} 
                    onValueChange={(value: 'none' | 'openai' | 'lovable') => setImageGenerationModel(value)}
                  >
                    <SelectTrigger id="batch-image-model" className="mt-1">
                      <SelectValue placeholder="Sélectionner un modèle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      <SelectItem value="openai">OpenAI (gpt-image-1)</SelectItem>
                      <SelectItem value="lovable">Lovable AI (Nano banana)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto">
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Paramètres avancés
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="space-y-4">
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
                          min={100} max={2000} step={50}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Contexte global (optionnel)</Label>
                    <Textarea placeholder="Ajoutez un contexte..." value={globalContext} onChange={(e) => setGlobalContext(e.target.value)} rows={2} />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {/* Generation Progress */}
          {totalLessons > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progression</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{completedCount}/{totalLessons} leçons terminées</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
                <div className="flex gap-4 text-sm">
                  <Badge variant="secondary">{lessonStatuses.filter(l => l.status === 'completed').length} Réussis</Badge>
                  <Badge variant="destructive">{lessonStatuses.filter(l => l.status === 'error').length} Erreurs</Badge>
                </div>
                {lessonStatuses.length > 0 && (
                  <Button onClick={exportGenerationResults} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Exporter CSV
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Generation Results List */}
          {lessonStatuses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Résultats de génération</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {lessonStatuses.map((lessonStatus) => (
                      <div key={lessonStatus.lessonId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(lessonStatus.status)}
                          <div>
                            <p className="font-medium text-sm">{lessonStatus.title}</p>
                            {lessonStatus.sectionsGenerated.length > 0 && (
                              <p className="text-xs text-muted-foreground">{lessonStatus.sectionsGenerated.length} sections</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lessonStatus.status === 'completed' && lessonStatus.generatedContent && (
                            <>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handlePreviewLesson(lessonStatus)}
                                title="Aperçu"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleRegenerateSingleLesson(lessonStatus.lessonId)}
                                title="Régénérer"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {lessonStatus.error && (
                            <Badge variant="destructive" className="text-xs">{lessonStatus.error.substring(0, 30)}...</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Validation Results Tab */}
        <TabsContent value="validation" className="space-y-4 mt-4">
          {/* Validation Stats */}
          {validations.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{validationStats.total}</div>
                  <div className="text-sm text-muted-foreground">Leçons analysées</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{validationStats.quizValid}</div>
                  <div className="text-sm text-muted-foreground">Quiz valides</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-destructive">{validationStats.quizInvalid}</div>
                  <div className="text-sm text-muted-foreground">Quiz invalides</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{validationStats.activitiesValid}</div>
                  <div className="text-sm text-muted-foreground">Activités valides</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-destructive">{validationStats.activitiesInvalid}</div>
                  <div className="text-sm text-muted-foreground">Activités invalides</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Validation Loading */}
          {isValidating && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Analyse en cours...</p>
                  <Progress value={33} className="animate-pulse" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Results */}
          {validations.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Résultats de validation</CardTitle>
                <div className="flex gap-2">
                  {validLessonsCount > 0 && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={publishAllValidLessons}
                      disabled={isPublishing === 'bulk'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isPublishing === 'bulk' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Publier toutes les valides ({validLessonsCount})
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={exportValidationCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">Tous ({validations.length})</TabsTrigger>
                    <TabsTrigger value="errors">Avec erreurs ({validations.filter(v => v.quizErrors.length > 0 || v.activityErrors.length > 0).length})</TabsTrigger>
                    <TabsTrigger value="valid">Valides ({validations.filter(v => v.quizErrors.length === 0 && v.activityErrors.length === 0 && (v.quizParsed.length > 0 || v.activitiesParsed.length > 0)).length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-4">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {validations.map(validation => (
                          <ValidationItem
                            key={validation.lesson.id}
                            validation={validation}
                            isExpanded={expandedLessons.has(validation.lesson.id)}
                            onToggle={() => toggleExpanded(validation.lesson.id)}
                            onRegenerateQuiz={regenerateQuiz}
                            onRegenerateActivities={regenerateActivities}
                            isRegenerating={isRegenerating}
                            onPublish={publishLesson}
                            isPublishing={isPublishing}
                            isPublished={publishedLessons.has(validation.lesson.id)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="errors" className="mt-4">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {validations.filter(v => v.quizErrors.length > 0 || v.activityErrors.length > 0).map(validation => (
                          <ValidationItem
                            key={validation.lesson.id}
                            validation={validation}
                            isExpanded={expandedLessons.has(validation.lesson.id)}
                            onToggle={() => toggleExpanded(validation.lesson.id)}
                            onRegenerateQuiz={regenerateQuiz}
                            onRegenerateActivities={regenerateActivities}
                            isRegenerating={isRegenerating}
                            onPublish={publishLesson}
                            isPublishing={isPublishing}
                            isPublished={publishedLessons.has(validation.lesson.id)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="valid" className="mt-4">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {validations.filter(v => v.quizErrors.length === 0 && v.activityErrors.length === 0 && (v.quizParsed.length > 0 || v.activitiesParsed.length > 0)).map(validation => (
                          <ValidationItem
                            key={validation.lesson.id}
                            validation={validation}
                            isExpanded={expandedLessons.has(validation.lesson.id)}
                            onToggle={() => toggleExpanded(validation.lesson.id)}
                            onRegenerateQuiz={regenerateQuiz}
                            onRegenerateActivities={regenerateActivities}
                            isRegenerating={isRegenerating}
                            onPublish={publishLesson}
                            isPublishing={isPublishing}
                            isPublished={publishedLessons.has(validation.lesson.id)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isValidating && validations.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Cliquez sur "Lancer validation" pour analyser les quiz et activités</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Validation Item Component
interface ValidationItemProps {
  validation: LessonValidation;
  isExpanded: boolean;
  onToggle: () => void;
  onRegenerateQuiz: (lessonId: string) => void;
  onRegenerateActivities: (lessonId: string) => void;
  isRegenerating: string | null;
  onPublish: (lessonId: string) => void;
  isPublishing: string | null;
  isPublished: boolean;
}

const ValidationItem = ({ 
  validation, 
  isExpanded, 
  onToggle,
  onRegenerateQuiz,
  onRegenerateActivities,
  isRegenerating,
  onPublish,
  isPublishing,
  isPublished
}: ValidationItemProps) => {
  const hasQuizErrors = validation.quizErrors.length > 0;
  const hasActivityErrors = validation.activityErrors.length > 0;
  const hasAnyContent = validation.quizParsed.length > 0 || validation.activitiesParsed.length > 0;
  const isCurrentlyRegenerating = isRegenerating === validation.lesson.id;
  const isCurrentlyPublishing = isPublishing === validation.lesson.id;
  const isValid = !hasQuizErrors && !hasActivityErrors && hasAnyContent;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className={`border ${hasQuizErrors || hasActivityErrors ? 'border-destructive/50' : hasAnyContent ? 'border-green-500/50' : 'border-muted'}`}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hasQuizErrors || hasActivityErrors ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : hasAnyContent ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
                <div>
                  <p className="font-medium">{validation.lesson.title}</p>
                  <p className="text-sm text-muted-foreground">{validation.lesson.subject_name} • {validation.lesson.grade_level}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isPublished && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Publiée
                  </Badge>
                )}
                {isValid && !isPublished && (
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPublish(validation.lesson.id);
                    }}
                    disabled={isCurrentlyPublishing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isCurrentlyPublishing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Publier
                  </Button>
                )}
                {validation.quizParsed.length > 0 && (
                  <Badge variant={hasQuizErrors ? "destructive" : "default"}>Quiz: {validation.quizParsed.length}Q</Badge>
                )}
                {validation.activitiesParsed.length > 0 && (
                  <Badge variant={hasActivityErrors ? "destructive" : "secondary"}>Activités: {validation.activitiesParsed.length}</Badge>
                )}
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Quiz Errors */}
            {validation.quizErrors.length > 0 && (
              <div className="p-3 bg-destructive/10 rounded-lg">
                <p className="font-medium text-destructive mb-2">Erreurs Quiz:</p>
                <ul className="text-sm space-y-1">
                  {validation.quizErrors.map((err, idx) => (
                    <li key={idx} className="text-destructive">{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Activity Errors */}
            {validation.activityErrors.length > 0 && (
              <div className="p-3 bg-destructive/10 rounded-lg">
                <p className="font-medium text-destructive mb-2">Erreurs Activités:</p>
                <ul className="text-sm space-y-1">
                  {validation.activityErrors.map((err, idx) => (
                    <li key={idx} className="text-destructive">{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Regeneration Buttons */}
            {(hasQuizErrors || hasActivityErrors) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {hasQuizErrors && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegenerateQuiz(validation.lesson.id);
                    }}
                    disabled={isCurrentlyRegenerating}
                  >
                    {isCurrentlyRegenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Régénérer Quiz
                  </Button>
                )}
                {hasActivityErrors && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegenerateActivities(validation.lesson.id);
                    }}
                    disabled={isCurrentlyRegenerating}
                  >
                    {isCurrentlyRegenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Régénérer Activités
                  </Button>
                )}
              </div>
            )}

            {/* Parsed Questions Preview */}
            {validation.quizParsed.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Questions du Quiz ({validation.quizParsed.length})
                </h4>
                <div className="space-y-2">
                  {validation.quizParsed.slice(0, 3).map((q, idx) => (
                    <div key={idx} className="p-2 bg-muted rounded text-sm">
                      <p className="font-medium">Q{idx + 1}: {q.question.substring(0, 80)}...</p>
                      <p className="text-xs text-muted-foreground">
                        Réponse: {String.fromCharCode(65 + q.correctAnswer)} - {q.options[q.correctAnswer]?.substring(0, 40)}...
                      </p>
                    </div>
                  ))}
                  {validation.quizParsed.length > 3 && (
                    <p className="text-xs text-muted-foreground">+ {validation.quizParsed.length - 3} autres questions</p>
                  )}
                </div>
              </div>
            )}

            {/* Parsed Activities Preview */}
            {validation.activitiesParsed.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Activités ({validation.activitiesParsed.length})
                </h4>
                <div className="space-y-2">
                  {validation.activitiesParsed.slice(0, 3).map((activity, idx) => (
                    <div key={idx} className="p-2 bg-muted rounded text-sm">
                      <Badge variant="outline" className="mb-1">{activity.activityType}</Badge>
                      <p className="font-medium">
                        {activity.activityType === 'QUIZ' 
                          ? (activity as ParsedQuizActivity).question.substring(0, 80) + '...'
                          : (activity as ParsedTrueFalseActivity).statement.substring(0, 80) + '...'
                        }
                      </p>
                    </div>
                  ))}
                  {validation.activitiesParsed.length > 3 && (
                    <p className="text-xs text-muted-foreground">+ {validation.activitiesParsed.length - 3} autres activités</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
