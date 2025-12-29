import { useState, useEffect } from "react";
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
  ChevronDown, ChevronUp, Sparkles, FileText, Gamepad2, Wand2, AlertTriangle, Zap
} from "lucide-react";
import { DEFAULT_WORD_COUNTS, type SectionName } from "@/lib/lessonPrompts";

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

interface ParsedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ParsedQuizActivity {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  activityType: 'QUIZ';
}

interface ParsedTrueFalseActivity {
  statement: string;
  isTrue: boolean;
  explanation: string;
  activityType: 'TRUE_FALSE';
}

type ParsedActivity = ParsedQuizActivity | ParsedTrueFalseActivity;

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
  type: 'activity' | 'quiz';
  correctedItems: Array<{
    originalIndex: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    wasFixed: boolean;
    fixApplied?: string;
  }>;
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
  const [imageGenerationModel, setImageGenerationModel] = useState<'none' | 'openai' | 'lovable'>('none');
  const [onlyEmpty, setOnlyEmpty] = useState(false);
  const [wordCounts, setWordCounts] = useState(DEFAULT_WORD_COUNTS);
  const [globalContext, setGlobalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
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
  const [isValidatingAI, setIsValidatingAI] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [validationStats, setValidationStats] = useState<ValidationStats>({
    total: 0, quizValid: 0, quizInvalid: 0, activitiesValid: 0, activitiesInvalid: 0,
  });
  const [validationPreviewData, setValidationPreviewData] = useState<RegenerationPreview | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Active inner tab
  const [activeInnerTab, setActiveInnerTab] = useState<'generation' | 'validation'>('generation');

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

  // Load subjects when grade level or series changes
  useEffect(() => {
    loadSubjects();
  }, [gradeLevel, series]);

  // Load lessons when grade level or subject changes
  useEffect(() => {
    if (gradeLevel !== "all" || subject !== "all") {
      loadLessonsForSelection();
    } else {
      setAvailableLessons([]);
      setSelectedLessonIds([]);
    }
  }, [gradeLevel, subject]);

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

      let query = supabase.from('lessons').select('id, title, grade_level, objectif, introduction, contenu, exemples_exercices, activites_interactives, subjects(name)');

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

      if (onlyEmpty && selectedLessonIds.length === 0) {
        return (data || []).filter(lesson =>
          selectedSections.some(section => !lesson[section] || lesson[section].trim() === '')
        );
      }

      return data || [];
    } catch (error: any) {
      toast.error("Erreur inattendue: " + error.message);
      return [];
    }
  };

  const startGeneration = async () => {
    if (selectedSections.length === 0 && !generateQuiz && !generateVideos && imageGenerationModel === 'none') {
      toast.error("Sélectionnez au moins une section ou fonctionnalité");
      return;
    }

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

    for (let i = 0; i < batchLessons.length; i++) {
      if (isPaused) break;

      const lesson = batchLessons[i];
      await generateLessonSections(lesson, i);
      
      if (i < batchLessons.length - 1 && !isPaused) {
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

      // Generate Quiz if selected
      if (generateQuiz) {
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
          setLessonStatuses(prev => prev.map((l, i) => {
            if (i === index) {
              return { ...l, generatedContent: { ...l.generatedContent, quiz_final: quizData.quizContent } };
            }
            return l;
          }));
        }
      }

      // Suggest YouTube videos if selected
      if (generateVideos) {
        const { data: videoData } = await supabase.functions.invoke('suggest-youtube-videos', {
          body: {
            lessonTitle: lesson.title,
            contenu: lesson.contenu || '',
            exemplesExercices: lesson.exemples_exercices || '',
            gradeLevel: lesson.grade_level,
            subject: lesson.subjects?.name || 'Matière',
          }
        });

        const videos = videoData?.videos || [];
        setLessonStatuses(prev => prev.map((l, i) => {
          if (i === index) {
            return { ...l, generatedContent: { ...l.generatedContent, youtube_videos: videos } };
          }
          return l;
        }));
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

  // ===== VALIDATION LOGIC =====
  const parseQuizQuestions = (content: string): { questions: ParsedQuestion[], errors: string[] } => {
    const questions: ParsedQuestion[] = [];
    const errors: string[] = [];

    if (!content || content.trim().length === 0) {
      return { questions, errors: ['Contenu vide'] };
    }

    if (content.includes('<div class="quiz-question"')) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const questionDivs = doc.querySelectorAll('.quiz-question');
        
        questionDivs.forEach((questionDiv, idx) => {
          const questionText = questionDiv.querySelector('p')?.textContent?.trim() || '';
          const options: string[] = [];
          const optionDivs = questionDiv.querySelectorAll('.option');
          
          optionDivs.forEach((optionDiv) => {
            const text = optionDiv.textContent?.trim() || '';
            const cleanText = text.replace(/^[A-D]\)\s*/, '').trim();
            if (cleanText) options.push(cleanText);
          });
          
          const correctAnswerDiv = questionDiv.querySelector('.correct-answer');
          const correctAnswerText = correctAnswerDiv?.querySelector('strong')?.textContent?.trim() || '';
          const correctMatch = correctAnswerText.match(/Réponse\s+correcte\s*:\s*([A-D])/i);
          const correctLetter = correctMatch ? correctMatch[1].toUpperCase() : 'A';
          const correctIndex = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
          
          const explanationParagraphs = correctAnswerDiv?.querySelectorAll('p');
          let explanation = '';
          if (explanationParagraphs && explanationParagraphs.length > 1) {
            explanation = Array.from(explanationParagraphs).slice(1).map(p => p.textContent?.trim() || '').join(' ');
          }
          
          if (questionText && options.length === 4 && explanation) {
            questions.push({ question: questionText, options, correctAnswer: correctIndex, explanation });
          } else {
            errors.push(`Question ${idx + 1}: ${!questionText ? 'texte manquant' : options.length !== 4 ? `${options.length}/4 options` : 'explication manquante'}`);
          }
        });
      } catch {
        errors.push('Erreur de parsing HTML');
      }
    } else {
      let sections = content.split(/#{2,3}\s*✅?\s*Question\s+\d+/i);
      if (sections.length <= 1) {
        sections = content.split(/Question\s+\d+/i);
      }
      
      sections.slice(1).forEach((section, idx) => {
        const questionMatch = section.match(/^\s*(.+?)(?=\n\s*[A-D][\):\.])/is);
        if (!questionMatch) {
          errors.push(`Question ${idx + 1}: texte non trouvé`);
          return;
        }
        
        const questionText = questionMatch[1].trim().replace(/\*\*/g, '').replace(/#{1,3}/g, '');
        
        const optionMatches = section.matchAll(/([A-D])[\):\.]\s*(.+?)(?=\n\s*[A-D][\):\.]|\n\s*#{2,3}|\n\n|$)/gis);
        const options: string[] = [];
        Array.from(optionMatches).forEach(match => {
          const optionText = match[2]?.trim().replace(/\*\*/g, '');
          if (optionText && optionText.length > 0 && optionText.length < 300) {
            options.push(optionText);
          }
        });
        
        let correctMatch = section.match(/#{2,3}\s*Réponse\s+correcte\s*:?\s*([A-D])/i);
        if (!correctMatch) correctMatch = section.match(/Réponse\s*:?\s*([A-D])/i);
        if (!correctMatch) correctMatch = section.match(/Correct[e]?\s*:?\s*([A-D])/i);
        
        if (!correctMatch) {
          errors.push(`Question ${idx + 1}: réponse correcte non trouvée`);
          return;
        }
        
        if (options.length !== 4) {
          errors.push(`Question ${idx + 1}: ${options.length}/4 options`);
          return;
        }
        
        const correctLetter = correctMatch[1].toUpperCase();
        const correctIndex = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
        
        const explanationMatch = section.match(/#{2,3}\s*Explication\s*:?\s*\n?\s*(.+?)(?=#{2,3}|$)/is);
        const explanation = explanationMatch ? explanationMatch[1].trim().replace(/\*\*/g, '') : "";
        
        if (questionText && options.length === 4 && correctIndex >= 0 && correctIndex < 4) {
          questions.push({ question: questionText, options, correctAnswer: correctIndex, explanation: explanation || 'Pas d\'explication' });
        }
      });
    }

    return { questions, errors };
  };

  const parseActivities = (content: string): { activities: ParsedActivity[], errors: string[] } => {
    const activities: ParsedActivity[] = [];
    const errors: string[] = [];

    if (!content || content.trim().length === 0) {
      return { activities, errors: ['Contenu vide'] };
    }

    const normalizedContent = content
      .replace(/^-\s*([A-D]\))/gm, '$1')
      .replace(/^\*\s*([A-D]\))/gm, '$1')
      .replace(/^([A-D])\.\s+/gm, '$1) ')
      .replace(/^([A-D]):\s+/gm, '$1) ');

    // Parse TRUE_FALSE activities
    const trueFalseSections = normalizedContent.split(/\*\*TYPE:\s*TRUE_FALSE\*\*/i);
    
    if (trueFalseSections.length > 1) {
      trueFalseSections.slice(1).forEach((section, sectionIdx) => {
        const affirmationBlocks = section.split(/(?:^|\n)---\s*\n|\*\*Affirmation\s*\d*:?\s*\*\*/i);
        
        affirmationBlocks.forEach((block, idx) => {
          if (block.trim().length < 10) return;
          if (/\*\*TYPE:\s*QUIZ\*\*/i.test(block)) return;
          
          const parsed = parseTrueFalseBlock(block, sectionIdx * 10 + idx);
          if (parsed.activity) {
            const exists = activities.some(a => 
              a.activityType === 'TRUE_FALSE' && 
              (a as ParsedTrueFalseActivity).statement === parsed.activity!.statement
            );
            if (!exists) activities.push(parsed.activity);
          }
          if (parsed.error) errors.push(parsed.error);
        });
      });
    }

    // Parse QUIZ activities
    const quizSections = normalizedContent.split(/\*\*TYPE:\s*QUIZ\*\*/i);
    
    if (quizSections.length > 1) {
      quizSections.slice(1).forEach((section, sectionIdx) => {
        const nextTypeIdx = section.search(/\*\*TYPE:\s*(TRUE_FALSE|QUIZ)\*\*/i);
        const sectionContent = nextTypeIdx > 0 ? section.substring(0, nextTypeIdx) : section;
        
        const questionBlocks = sectionContent.split(/(?:^|\n)---\s*\n|\*\*Question\s*\d*:?\s*\*\*/i);
        
        questionBlocks.forEach((block, idx) => {
          if (block.trim().length < 20) return;
          const parsed = parseActivityBlock(block, sectionIdx * 10 + idx);
          if (parsed.activity) {
            const quizActivity: ParsedQuizActivity = { ...parsed.activity, activityType: 'QUIZ' };
            const exists = activities.some(a => 
              a.activityType === 'QUIZ' && (a as ParsedQuizActivity).question === quizActivity.question
            );
            if (!exists) activities.push(quizActivity);
          }
          if (parsed.error) errors.push(parsed.error);
        });
      });
    }

    return { activities, errors };
  };

  const parseTrueFalseBlock = (block: string, idx: number): { activity?: ParsedTrueFalseActivity, error?: string } => {
    let statementMatch = block.match(/^[\s\n]*(.+?)(?=\n\s*\*\*Réponse)/is);
    if (!statementMatch) statementMatch = block.match(/^[\s\n]*(.+?)(?=\nRéponse\s*:)/is);
    
    if (!statementMatch) return { error: `Affirmation ${idx + 1}: texte non trouvé` };

    const statement = statementMatch[1].trim().replace(/\*\*/g, '').replace(/#{1,3}/g, '').replace(/^Affirmation\s*\d*:?\s*/i, '').substring(0, 500);

    if (statement.length < 10) return { error: `Affirmation ${idx + 1}: texte trop court` };

    let answerMatch = block.match(/\*\*Réponse\s*:?\s*\*?\*?\s*(VRAI|FAUX)/i);
    if (!answerMatch) answerMatch = block.match(/Réponse\s*:?\s*(VRAI|FAUX)/i);
    
    if (!answerMatch) return { error: `Affirmation ${idx + 1}: réponse VRAI/FAUX non trouvée` };

    const isTrue = answerMatch[1].toUpperCase() === 'VRAI';

    let explanationMatch = block.match(/\*\*Explication\s*:?\s*\*\*\s*\n?\s*(.+?)(?=\*\*TYPE|\*\*Affirmation|#{2,3}|---|\n\n\*\*|$)/is);
    if (!explanationMatch) explanationMatch = block.match(/Explication\s*:?\s*\n?\s*(.+?)(?=\*\*TYPE|\*\*Affirmation|#{2,3}|---|\n\n|$)/is);
    
    const explanation = explanationMatch 
      ? explanationMatch[1].trim().replace(/\*\*/g, '').replace(/---/g, '').substring(0, 500)
      : 'Pas d\'explication fournie';

    return { activity: { statement, isTrue, explanation, activityType: 'TRUE_FALSE' } };
  };

  const parseActivityBlock = (block: string, idx: number): { activity?: Omit<ParsedQuizActivity, 'activityType'>, error?: string } => {
    const normalizedBlock = block
      .replace(/^-\s*([A-D]\))/gm, '$1')
      .replace(/^\*\s*([A-D]\))/gm, '$1')
      .replace(/^([A-D])\.\s+/gm, '$1) ')
      .replace(/^([A-D]):\s+/gm, '$1) ');

    let questionMatch = normalizedBlock.match(/^[\s\n]*(.+?)(?=\n\s*[A-D]\))/is);
    if (!questionMatch) questionMatch = normalizedBlock.match(/^[\s\n]*(.+?)(?=\n\s*\*?\*?[A-D][\):\.])/is);
    
    if (!questionMatch) return { error: `Activité ${idx + 1}: texte de question non trouvé` };

    const questionText = questionMatch[1].trim().replace(/\*\*/g, '').replace(/#{1,3}/g, '').replace(/^Question\s*\d*:?\s*/i, '').substring(0, 500);

    if (questionText.length < 5) return { error: `Activité ${idx + 1}: texte de question trop court` };

    const optionRegex = /^([A-D])\)\s*(.+?)$/gm;
    const optionMatches = Array.from(normalizedBlock.matchAll(optionRegex));
    
    const seenLetters = new Set<string>();
    const options: string[] = [];
    
    for (const match of optionMatches) {
      const letter = match[1].toUpperCase();
      const optionText = match[2]?.trim().replace(/\*\*/g, '').replace(/\n/g, ' ');
      
      if (!seenLetters.has(letter) && optionText && optionText.length > 0 && optionText.length < 500) {
        seenLetters.add(letter);
        options.push(optionText);
      }
      
      if (options.length >= 4) break;
    }

    if (options.length !== 4) return { error: `Activité ${idx + 1}: ${options.length}/4 options trouvées` };

    let correctMatch = normalizedBlock.match(/\*\*Réponse\s+correcte\s*:?\s*\*?\*?\s*([A-D])/i);
    if (!correctMatch) correctMatch = normalizedBlock.match(/Réponse\s+correcte\s*:?\s*([A-D])/i);
    if (!correctMatch) correctMatch = normalizedBlock.match(/Réponse\s*:?\s*([A-D])/i);

    if (!correctMatch) return { error: `Activité ${idx + 1}: réponse correcte non trouvée` };

    const correctLetter = correctMatch[1].toUpperCase();
    const correctIndex = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);

    let explanationMatch = normalizedBlock.match(/\*\*Explication\s*:?\s*\*\*\s*\n?\s*(.+?)(?=\*\*TYPE|\*\*Question|#{2,3}|---|\n\n\*\*|$)/is);
    if (!explanationMatch) explanationMatch = normalizedBlock.match(/Explication\s*:?\s*\n?\s*(.+?)(?=\*\*TYPE|\*\*Question|#{2,3}|---|\n\n|$)/is);
    
    const explanation = explanationMatch 
      ? explanationMatch[1].trim().replace(/\*\*/g, '').replace(/---/g, '').substring(0, 500)
      : 'Pas d\'explication fournie';

    return { activity: { question: questionText, options, correctAnswer: correctIndex, explanation } };
  };

  const runValidation = async () => {
    setIsValidating(true);
    setValidations([]);
    setActiveInnerTab('validation');

    try {
      let query = supabase
        .from('lessons')
        .select('id, title, slug, grade_level, quiz_final, activites_interactives, subjects(id, name)')
        .or('quiz_final.neq.null,activites_interactives.neq.null');

      if (gradeLevel !== 'all') {
        query = query.eq('grade_level', gradeLevel);
      }

      if (subject !== 'all') {
        query = query.eq('subject_id', subject);
      }

      const { data: lessonsData, error } = await query.order('title');

      if (error) throw error;

      const results: LessonValidation[] = [];
      let quizValid = 0, quizInvalid = 0, activitiesValid = 0, activitiesInvalid = 0;

      for (const lesson of lessonsData || []) {
        const quizResult = lesson.quiz_final ? parseQuizQuestions(lesson.quiz_final) : { questions: [], errors: [] };
        const activityResult = lesson.activites_interactives ? parseActivities(lesson.activites_interactives) : { activities: [], errors: [] };

        if (lesson.quiz_final) {
          if (quizResult.questions.length > 0 && quizResult.errors.length === 0) quizValid++;
          else quizInvalid++;
        }

        if (lesson.activites_interactives) {
          if (activityResult.activities.length > 0 && activityResult.errors.length === 0) activitiesValid++;
          else activitiesInvalid++;
        }

        results.push({
          lesson: {
            id: lesson.id,
            title: lesson.title,
            slug: lesson.slug,
            grade_level: lesson.grade_level,
            subject_name: lesson.subjects?.name || 'N/A',
          },
          quizParsed: quizResult.questions,
          quizErrors: quizResult.errors,
          activitiesParsed: activityResult.activities,
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
                          if (checked) setSeries([...series, s.value]);
                          else setSeries(series.filter(v => v !== s.value));
                          setSubject("all");
                          setSelectedLessonIds([]);
                        }}
                      />
                      <label htmlFor={`series-${s.value}`} className="text-sm cursor-pointer">{s.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Matière</Label>
              <Select value={subject} onValueChange={(value) => { setSubject(value); setSelectedLessonIds([]); }} disabled={isLoadingSubjects}>
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
              <Label>Leçon(s) spécifique(s)</Label>
              {isLoadingLessons ? (
                <div className="text-sm text-muted-foreground">Chargement...</div>
              ) : availableLessons.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sélectionnez niveau/matière</div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectedLessonIds(availableLessons.map(l => l.id))} disabled={selectedLessonIds.length === availableLessons.length}>
                      Tout sélectionner
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectedLessonIds([])} disabled={selectedLessonIds.length === 0}>
                      Désélectionner
                    </Button>
                  </div>
                  <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                    {availableLessons.map(lesson => (
                      <div key={lesson.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lesson-${lesson.id}`}
                          checked={selectedLessonIds.includes(lesson.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedLessonIds(prev => [...prev, lesson.id]);
                            else setSelectedLessonIds(prev => prev.filter(id => id !== lesson.id));
                          }}
                        />
                        <label htmlFor={`lesson-${lesson.id}`} className="text-sm cursor-pointer flex-1">{lesson.title}</label>
                      </div>
                    ))}
                  </div>
                  {selectedLessonIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">{selectedLessonIds.length} leçon(s) sélectionnée(s)</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={startGeneration} disabled={isGenerating || isValidating}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
              Lancer génération
            </Button>
            <Button onClick={runValidation} variant="outline" disabled={isGenerating || isValidating}>
              {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Lancer validation
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
                        {lessonStatus.error && (
                          <Badge variant="destructive" className="text-xs">{lessonStatus.error.substring(0, 30)}...</Badge>
                        )}
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
                <Button variant="outline" size="sm" onClick={exportValidationCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
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
}

const ValidationItem = ({ validation, isExpanded, onToggle }: ValidationItemProps) => {
  const hasQuizErrors = validation.quizErrors.length > 0;
  const hasActivityErrors = validation.activityErrors.length > 0;
  const hasAnyContent = validation.quizParsed.length > 0 || validation.activitiesParsed.length > 0;

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

            {/* Parsed Questions Preview */}
            {validation.quizParsed.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Questions du Quiz ({validation.quizParsed.length})
                </h4>
                <div className="space-y-2 pl-4 border-l-2 border-muted">
                  {validation.quizParsed.slice(0, 3).map((q, idx) => (
                    <div key={idx} className="text-sm p-2 bg-muted/30 rounded">
                      <p className="font-medium">Q{idx + 1}: {q.question.substring(0, 80)}...</p>
                      <p className="text-muted-foreground">Réponse: {String.fromCharCode(65 + q.correctAnswer)}) {q.options[q.correctAnswer]?.substring(0, 40)}...</p>
                    </div>
                  ))}
                  {validation.quizParsed.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{validation.quizParsed.length - 3} autres questions</p>
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
                <div className="space-y-2 pl-4 border-l-2 border-muted">
                  {validation.activitiesParsed.slice(0, 3).map((a, idx) => (
                    <div key={idx} className="text-sm p-2 bg-muted/30 rounded">
                      {a.activityType === 'QUIZ' ? (
                        <p className="font-medium">Quiz: {(a as ParsedQuizActivity).question.substring(0, 80)}...</p>
                      ) : (
                        <p className="font-medium">Vrai/Faux: {(a as ParsedTrueFalseActivity).statement.substring(0, 80)}...</p>
                      )}
                    </div>
                  ))}
                  {validation.activitiesParsed.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{validation.activitiesParsed.length - 3} autres activités</p>
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
