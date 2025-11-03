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
import { toast } from "sonner";
import { PlayCircle, PauseCircle, Download, RefreshCw, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { DEFAULT_WORD_COUNTS, type SectionName } from "@/lib/lessonPrompts";

type GenerationStatus = 'pending' | 'in_progress' | 'completed' | 'error';

interface LessonGenerationStatus {
  lessonId: string;
  title: string;
  status: GenerationStatus;
  sectionsGenerated: string[];
  generationTime: number;
  qualityScore?: number;
  error?: string;
}

export const BatchLessonGenerator = () => {
  const [gradeLevel, setGradeLevel] = useState<string>("all");
  const [subject, setSubject] = useState<string>("all");
  const [availableLessons, setAvailableLessons] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("all");
  const [selectedSections, setSelectedSections] = useState<SectionName[]>([
    'objectif', 'introduction', 'contenu', 'exemples_exercices'
  ]);
  const [onlyEmpty, setOnlyEmpty] = useState(true);
  const [wordCounts, setWordCounts] = useState(DEFAULT_WORD_COUNTS);
  const [globalContext, setGlobalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lessonStatuses, setLessonStatuses] = useState<LessonGenerationStatus[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  const gradeLevels = [
    { value: "all", label: "Tous les niveaux" },
    { value: "7AF", label: "7ème AF" },
    { value: "8AF", label: "8ème AF" },
    { value: "9AF", label: "9ème AF" },
    { value: "NS1", label: "NS1" },
    { value: "NS2", label: "NS2" },
    { value: "NS3", label: "NS3" },
    { value: "NS4", label: "NS4" },
  ];

  // Load subjects on component mount
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, slug')
        .order('name');

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
    // If a specific lesson is selected, return only that lesson
    if (selectedLessonId !== "all") {
      const selectedLesson = availableLessons.find(l => l.id === selectedLessonId);
      if (selectedLesson) {
        const { data: fullLesson, error } = await supabase
          .from('lessons')
          .select('id, title, grade_level, objectif, introduction, contenu, exemples_exercices, subjects(name)')
          .eq('id', selectedLessonId)
          .single();

        if (error) {
          toast.error("Erreur lors de la récupération de la leçon");
          return [];
        }
        return [fullLesson];
      }
      return [];
    }

    // Otherwise, fetch lessons based on filters
    let query = supabase.from('lessons').select('id, title, grade_level, objectif, introduction, contenu, exemples_exercices, subjects(name)')
      .eq('is_published', false);

    if (gradeLevel !== "all") {
      query = query.eq('grade_level', gradeLevel);
    }

    if (subject !== "all") {
      query = query.eq('subject_id', subject);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Erreur lors de la récupération des leçons");
      return [];
    }

    // Filter for empty sections if needed
    if (onlyEmpty && selectedLessonId === "all") {
      return (data || []).filter(lesson =>
        selectedSections.some(section => !lesson[section] || lesson[section].trim() === '')
      );
    }

    return data || [];
  };

  const startGeneration = async () => {
    if (selectedSections.length === 0) {
      toast.error("Sélectionnez au moins une section");
      return;
    }

    const lessons = await fetchLessons();
    
    if (lessons.length === 0) {
      toast.error("Aucune leçon trouvée avec ces critères");
      return;
    }

    if (lessons.length > 50) {
      toast.error(`${lessons.length} leçons trouvées. Limitez à 50 max pour éviter les erreurs.`);
      return;
    }

    setTotalLessons(lessons.length);
    setCompletedCount(0);
    setLessonStatuses(lessons.map(l => ({
      lessonId: l.id,
      title: l.title,
      status: 'pending',
      sectionsGenerated: [],
      generationTime: 0,
    })));
    setIsGenerating(true);
    setIsPaused(false);

    for (let i = 0; i < lessons.length; i++) {
      if (isPaused) break;

      const lesson = lessons[i];
      await generateLessonSections(lesson, i);
      
      // 3 second pause between lessons
      if (i < lessons.length - 1 && !isPaused) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    setIsGenerating(false);
    toast.success(`Génération terminée: ${completedCount}/${totalLessons} leçons`);
  };

  const generateLessonSections = async (lesson: any, index: number) => {
    const startTime = Date.now();
    
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
          
          if (!shouldGenerate) continue;

          const { data, error } = await supabase.functions.invoke('generate-lesson-section', {
            body: {
              lessonId: lesson.id,
              sectionName,
              lessonTitle: lesson.title,
              gradeLevel: lesson.grade_level,
              targetWords: wordCounts[sectionName],
              context: globalContext,
            }
          });

          if (error) throw error;

          // Update lesson in database
          await supabase
            .from('lessons')
            .update({ [sectionName]: data.content })
            .eq('id', lesson.id);

          setLessonStatuses(prev => prev.map((l, i) =>
            i === index ? { ...l, sectionsGenerated: [...l.sectionsGenerated, sectionName] } : l
          ));
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
        
        if (error.message?.includes('429')) {
          await new Promise(resolve => setTimeout(resolve, 10000));
        } else if (retryCount >= maxRetries) {
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

          {/* Only Empty Sections Option - Hidden when specific lesson selected */}
          {selectedLessonId === "all" && (
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
          )}

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
              <Button onClick={startGeneration} className="flex-1">
                <PlayCircle className="mr-2 h-4 w-4" />
                Démarrer la génération
              </Button>
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
                      <p className="text-sm font-medium truncate">{lesson.title}</p>
                      {lesson.sectionsGenerated.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {lesson.sectionsGenerated.join(', ')}
                        </p>
                      )}
                      {lesson.error && (
                        <p className="text-xs text-destructive">{lesson.error}</p>
                      )}
                    </div>
                  </div>
                  {lesson.generationTime > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {(lesson.generationTime / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};