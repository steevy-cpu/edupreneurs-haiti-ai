import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { PlayCircle, PauseCircle, Download, RefreshCw, Loader2, CheckCircle2, XCircle, Clock, Eye, Check } from "lucide-react";
import { DEFAULT_WORD_COUNTS, type SectionName } from "@/lib/lessonPrompts";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";

type GenerationStatus = 'pending' | 'in_progress' | 'completed' | 'error';

interface LessonGenerationStatus {
  lessonId: string;
  title: string;
  status: GenerationStatus;
  sectionsGenerated: string[];
  generationTime: number;
  qualityScore?: number;
  error?: string;
  generatedContent?: Record<string, string>;
}

export const BatchLessonGenerator = () => {
  const navigate = useNavigate();
  const [gradeLevel, setGradeLevel] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [availableLessons, setAvailableLessons] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("all");
  const [selectedSections, setSelectedSections] = useState<SectionName[]>([
    'objectif', 'introduction', 'contenu', 'exemples_exercices', 'activites_interactives'
  ]);
  const [onlyEmpty, setOnlyEmpty] = useState(false);
  const [wordCounts, setWordCounts] = useState(DEFAULT_WORD_COUNTS);
  const [globalContext, setGlobalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lessonStatuses, setLessonStatuses] = useState<LessonGenerationStatus[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [previewLesson, setPreviewLesson] = useState<LessonGenerationStatus | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [allLessons, setAllLessons] = useState<any[]>([]);

  const gradeLevels = [
    { value: "all", label: "Tous les niveaux" },
    { value: "7AF", label: "7AF" },
    { value: "AF8", label: "AF8" },
  ];

  // Load subjects when grade level changes
  useEffect(() => {
    loadSubjects();
  }, [gradeLevel]);

  const loadSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      let query = supabase
        .from('subjects')
        .select('id, name, slug, grade_level')
        .order('name');

      // Filter by grade level if not "all"
      if (gradeLevel !== "all") {
        query = query.eq('grade_level', gradeLevel);
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

  // Load lessons when grade level or subject changes
  useEffect(() => {
    if (gradeLevel !== "all" || subject !== "all") {
      loadLessonsForSelection();
    } else {
      setAvailableLessons([]);
      setSelectedLessonId("all");
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

  const fetchLessons = async () => {
    try {
      console.log('🔍 Fetching lessons with:', {
        selectedLessonId,
        gradeLevel,
        subject,
        onlyEmpty
      });

      // If a specific lesson is selected, return only that lesson
      if (selectedLessonId !== "all") {
        const selectedLesson = availableLessons.find(l => l.id === selectedLessonId);
        if (selectedLesson) {
          const { data: fullLesson, error } = await supabase
            .from('lessons')
            .select('id, title, grade_level, objectif, introduction, contenu, exemples_exercices, activites_interactives, subjects(name)')
            .eq('id', selectedLessonId)
            .single();

          if (error) {
            console.error('❌ Error fetching single lesson:', error);
            toast.error("Erreur lors de la récupération de la leçon: " + error.message);
            return [];
          }
          console.log('✅ Single lesson fetched:', fullLesson);
          return [fullLesson];
        }
        console.warn('⚠️ Selected lesson not found in availableLessons');
        return [];
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
      if (onlyEmpty && selectedLessonId === "all") {
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
    if (selectedSections.length === 0) {
      toast.error("Sélectionnez au moins une section");
      return;
    }

    console.log('🚀 Starting generation with filters:', {
      gradeLevel,
      subject,
      selectedLessonId,
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
    setIsPaused(false);

    for (let i = 0; i < batchLessons.length; i++) {
      if (isPaused) break;

      const lesson = batchLessons[i];
      await generateLessonSections(lesson, i);
      
      // 3 second pause between lessons
      if (i < batchLessons.length - 1 && !isPaused) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    setIsGenerating(false);
    
    const hasMoreBatches = batchNumber < totalBatchCount;
    if (hasMoreBatches) {
      toast.success(`Lot ${batchNumber}/${totalBatchCount} terminé: ${completedCount}/${batchLessons.length} leçons. Prêt pour le lot suivant.`);
    } else {
      toast.success(`Génération terminée: ${completedCount}/${batchLessons.length} leçons du dernier lot.`);
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

  const generateLessonSections = async (lesson: any, index: number) => {
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

    while (retryCount < maxRetries && !success && !isPaused) {
      try {
        // Generate each selected section
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
            
            const { data, error } = await supabase.functions.invoke('generate-interactive-activities', {
              body: {
                exercisesContent: lesson.exemples_exercices || '',
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

          // Update lesson in database
          await supabase
            .from('lessons')
            .update({ [sectionName]: generatedContent })
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

        success = true;
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
  };

  const retryFailed = async () => {
    const failedLessons = lessonStatuses.filter(l => l.status === 'error');
    
    for (const lessonStatus of failedLessons) {
      if (isPaused) break;
      
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

  const handleApplyLesson = async (lessonId: string, shouldPublish: boolean = false) => {
    setIsApplying(true);
    try {
      const updates: any = {};
      
      if (shouldPublish) {
        updates.is_published = true;
        updates.workflow_status = 'published';
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('lessons')
          .update(updates)
          .eq('id', lessonId);

        if (error) throw error;
      }

      toast.success(shouldPublish ? "Leçon publiée avec succès!" : "Contenu appliqué avec succès!");
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
      exemples_exercices: "Exemples & Exercices"
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
      <Card>
        <CardHeader>
          <CardTitle>Configuration de la génération par lot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Grade, Subject, and Lesson Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Niveau scolaire</Label>
              <Select value={gradeLevel} onValueChange={(value) => {
                setGradeLevel(value);
                setSubject("all");
                setSelectedLessonId("all");
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

            <div className="space-y-2">
              <Label>Matière</Label>
              <Select 
                value={subject} 
                onValueChange={(value) => {
                  setSubject(value);
                  setSelectedLessonId("all");
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
                      {subj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Leçon spécifique (optionnel)</Label>
              <Select 
                value={selectedLessonId} 
                onValueChange={setSelectedLessonId}
                disabled={isLoadingLessons || availableLessons.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    isLoadingLessons 
                      ? "Chargement..." 
                      : availableLessons.length === 0 
                        ? "Sélectionnez niveau/matière" 
                        : "Toutes les leçons"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les leçons</SelectItem>
                  {availableLessons.map(lesson => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedLessonId !== "all" && (
                <p className="text-xs text-muted-foreground">
                  Mode: Génération d'une seule leçon
                </p>
              )}
            </div>
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <Label>Sections à générer</Label>
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

          {/* Only Empty Sections Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="onlyEmpty"
              checked={onlyEmpty}
              onCheckedChange={(checked) => setOnlyEmpty(checked as boolean)}
            />
            <label htmlFor="onlyEmpty" className="text-sm cursor-pointer">
              Générer uniquement les sections vides
            </label>
          </div>

          {/* Info message for single lesson mode */}
          {selectedLessonId !== "all" && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm">
                <strong>Mode leçon unique:</strong> Vous allez générer le contenu pour "{availableLessons.find(l => l.id === selectedLessonId)?.title}". 
                Toutes les sections sélectionnées seront générées avec vos paramètres personnalisés.
              </p>
            </div>
          )}

          {/* Word Count Sliders */}
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
              <Button onClick={() => setIsPaused(!isPaused)} variant="outline" className="flex-1">
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

      {/* Progress */}
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
              {Object.entries(previewLesson.generatedContent).map(([sectionName, content]) => (
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
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  )}
                </div>
              ))}
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