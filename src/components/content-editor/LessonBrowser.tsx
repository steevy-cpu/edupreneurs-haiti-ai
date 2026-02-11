import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { Search, ChevronDown, ChevronRight, BookOpen, Calculator, FlaskConical, Book, RefreshCw, AlertCircle, RotateCcw, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  BatchQuizValidator, 
  BatchActivitiesValidator,
  BatchQuizRegenerator,
  BatchActivitiesRegenerator,
  BatchQuizGeneratorNew,
  BatchContentGenerator,
  isLessonMissingContent,
} from "@/features/content-editor/batch-operations";
import { ValidationDetailsPanel } from "./ValidationDetailsPanel";

interface LessonBrowserProps {
  onSelectLesson: (lesson: any) => void;
  selectedLesson: any;
  refreshKey?: number;
  onDashboardRefresh?: () => void;
}

// Helper function to check if a lesson has a valid quiz (uses content flags)
const hasValidQuiz = (lesson: any): boolean => {
  return !!lesson.has_quiz;
};

// Helper function to check if a lesson has valid activities (uses content flags)
const hasValidActivities = (lesson: any): boolean => {
  return !!lesson.has_activities;
};

// Helper function to extract validation details from lesson
const extractValidationDetails = (lesson: any) => {
  const details = lesson.validation_details_json;
  if (!details) return { quiz: [], activities: [] };
  
  return {
    quiz: details.quiz?.offContentQuestions || [],
activities: (details.activities?.offContentActivities || []).map((issue: any) => ({
      ...issue,
      question: issue.content, // Transform "content" key to "question" for ValidationDetailsPanel
    })),
  };
};

export const LessonBrowser = ({ onSelectLesson, selectedLesson, refreshKey, onDashboardRefresh }: LessonBrowserProps) => {
  const [gradeLevel, setGradeLevel] = useState<string>("all");
  const [series, setSeries] = useState<string>("all");
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [lessonsBySubject, setLessonsBySubject] = useState<Record<string, any[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [openSubjects, setOpenSubjects] = useState<Set<string>>(new Set());
  const [showOnlyMissingQuiz, setShowOnlyMissingQuiz] = useState(false);
  const [showOnlyMissingContent, setShowOnlyMissingContent] = useState(false);
  const [regeneratingLessonId, setRegeneratingLessonId] = useState<string | null>(null);
  const [activeBatchOperation, setActiveBatchOperation] = useState<string | null>(null);

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
    { value: "LLA", label: "LLA" },
    { value: "SES", label: "SES" },
    { value: "SMP", label: "SMP" },
    { value: "SVT", label: "SVT" },
  ];

  const isNS3OrNS4 = gradeLevel === "NS3" || gradeLevel === "NS4";

  // Load subjects when grade level, series, or refreshKey changes
  useEffect(() => {
    loadSubjects();
  }, [gradeLevel, series, refreshKey]);

  // Auto-expand subjects when lessons are loaded
  useEffect(() => {
    if (Object.keys(lessonsBySubject).length > 0) {
      setOpenSubjects(new Set(Object.keys(lessonsBySubject)));
    }
  }, [lessonsBySubject]);

  const loadSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      let query = supabase
        .from('subjects')
        .select('id, name, slug, grade_level, icon_name, series')
        .order('name');

      // Filter by grade level if not "all"
      if (gradeLevel !== "all") {
        query = query.eq('grade_level', gradeLevel);
      }

      // Filter by series for NS3/NS4
      if ((gradeLevel === "NS3" || gradeLevel === "NS4") && series !== "all") {
        query = query.eq('series', series);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAvailableSubjects(data || []);
      
      // Load lessons for these subjects
      if (data && data.length > 0) {
        await loadLessons(data.map(s => s.id));
      } else {
        setLessonsBySubject({});
        setOpenSubjects(new Set());
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error("Erreur lors du chargement des matières");
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const loadLessons = async (subjectIds: string[]) => {
    setIsLoading(true);
    try {
      // Load lessons in smaller batches to prevent timeout
      const batchSize = 5;
      const allLessons: any[] = [];
      
      for (let i = 0; i < subjectIds.length; i += batchSize) {
        const batch = subjectIds.slice(i, i + batchSize);
        const { data: lessonsData, error } = await supabase
           .from('lessons')
           .select('id, title, slug, subject_id, order_index, workflow_status, grade_level, youtube_url, needs_quiz_regeneration, needs_activities_regeneration, last_content_validated_at, last_activities_validated_at, validation_details_json, content_alignment_score, activities_alignment_score, subjects(id, name)')
          .in('subject_id', batch)
          .order('order_index');

        if (error) throw error;
        if (lessonsData) allLessons.push(...lessonsData);
      }

      // Fetch lightweight content flags from the view
      const lessonIds = allLessons.map(l => l.id);
      const flagsBatchSize = 50;
      const allFlags: Record<string, any> = {};
      
      for (let i = 0; i < lessonIds.length; i += flagsBatchSize) {
        const batch = lessonIds.slice(i, i + flagsBatchSize);
        const { data: flagsData } = await supabase
          .from('lesson_content_flags' as any)
          .select('id, has_objectif, has_introduction, has_contenu, has_exemples, has_quiz, has_activities')
          .in('id', batch);
        
        if (flagsData) {
          (flagsData as any[]).forEach((f: any) => { allFlags[f.id] = f; });
        }
      }

      // Merge flags into lessons
      const mergedLessons = allLessons.map(lesson => ({
        ...lesson,
        has_objectif: allFlags[lesson.id]?.has_objectif ?? false,
        has_introduction: allFlags[lesson.id]?.has_introduction ?? false,
        has_contenu: allFlags[lesson.id]?.has_contenu ?? false,
        has_exemples: allFlags[lesson.id]?.has_exemples ?? false,
        has_quiz: allFlags[lesson.id]?.has_quiz ?? false,
        has_activities: allFlags[lesson.id]?.has_activities ?? false,
      }));

      // Group lessons by subject
      const grouped: Record<string, any[]> = {};
      mergedLessons.forEach(lesson => {
        if (!grouped[lesson.subject_id]) {
          grouped[lesson.subject_id] = [];
        }
        grouped[lesson.subject_id].push(lesson);
      });

      setLessonsBySubject(grouped);
    } catch (error) {
      console.error('Error loading lessons:', error);
      toast.error("Erreur lors du chargement des leçons");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubject = (subjectId: string) => {
    const newOpenSubjects = new Set(openSubjects);
    if (newOpenSubjects.has(subjectId)) {
      newOpenSubjects.delete(subjectId);
    } else {
      newOpenSubjects.add(subjectId);
    }
    setOpenSubjects(newOpenSubjects);
  };

  const regenerateQuiz = async (lesson: any) => {
    if (!lesson?.id) return;
    
    setRegeneratingLessonId(lesson.id);
    try {
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

      if (data?.quizContent) {
        await supabase
          .from('lessons')
          .update({ 
            quiz_final: data.quizContent,
            needs_quiz_regeneration: false,
            content_alignment_score: null,
            last_content_validated_at: null
          })
          .eq('id', lesson.id);

        toast.success("Quiz régénéré avec succès");
        await loadSubjects();
        onDashboardRefresh?.();
      }
    } catch (error) {
      console.error('Regeneration error:', error);
      toast.error("Erreur lors de la régénération");
    } finally {
      setRegeneratingLessonId(null);
    }
  };

  const regenerateActivities = async (lesson: any) => {
    if (!lesson?.id) return;
    
    setRegeneratingLessonId(lesson.id);
    try {
      const { data, error } = await supabase.functions.invoke('generate-interactive-activities', {
        body: {
          exercisesContent: lesson.exemples_exercices || lesson.contenu || '',
          lessonTitle: lesson.title,
          gradeLevel: lesson.grade_level,
          subject: lesson.subjects?.name || 'Matière',
        }
      });

      if (error) throw error;

      if (data?.content) {
        await supabase
          .from('lessons')
          .update({ 
            activites_interactives: data.content,
            needs_activities_regeneration: false,
            activities_alignment_score: null,
            last_activities_validated_at: null
          })
          .eq('id', lesson.id);

        toast.success("Activités régénérées avec succès");
        await loadSubjects();
        onDashboardRefresh?.();
      }
    } catch (error) {
      console.error('Regeneration error:', error);
      toast.error("Erreur lors de la régénération");
    } finally {
      setRegeneratingLessonId(null);
    }
  };

  const getSubjectIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="h-4 w-4" />;
      case 'Calculator':
        return <Calculator className="h-4 w-4" />;
      case 'flask-conical':
        return <FlaskConical className="h-4 w-4" />;
      default:
        return <Book className="h-4 w-4" />;
    }
  };

  // Calculate quiz stats for the current grade level
  const allLessons = Object.values(lessonsBySubject).flat();
  const totalLessons = allLessons.length;
  const lessonsWithQuiz = allLessons.filter(hasValidQuiz).length;
  const missingQuizzesTotal = totalLessons - lessonsWithQuiz;
  const quizPercentage = totalLessons > 0 ? Math.round((lessonsWithQuiz / totalLessons) * 100) : 0;

  // Calculate content stats using flags
  const lessonsWithContent = allLessons.filter(l => !isLessonMissingContent(l)).length;
  const missingContentTotal = totalLessons - lessonsWithContent;
  const contentPercentage = totalLessons > 0 ? Math.round((lessonsWithContent / totalLessons) * 100) : 0;
  const lessonsMissingContent = allLessons.filter(l => isLessonMissingContent(l));

  // Get all lessons missing quizzes for batch generation
  const lessonsMissingQuiz = allLessons.filter(lesson => !hasValidQuiz(lesson));
  
  // Get all lessons WITH valid quizzes for content validation
  const lessonsWithValidQuiz = allLessons.filter(lesson => hasValidQuiz(lesson));
  
  // Get all lessons WITH valid activities for content validation
  const lessonsWithValidActivities = allLessons.filter(lesson => hasValidActivities(lesson));

  const filteredSubjects = availableSubjects.map(subject => {
    const subjectLessons = lessonsBySubject[subject.id] || [];
    
    // Calculate quiz stats from ALL lessons in this subject (not filtered)
    const quizCount = subjectLessons.filter(hasValidQuiz).length;
    const missingQuizzes = subjectLessons.length - quizCount;
    
    // Apply search filter
    let filteredLessons = subjectLessons.filter(lesson =>
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Apply missing quiz filter
    if (showOnlyMissingQuiz) {
      filteredLessons = filteredLessons.filter(lesson => !hasValidQuiz(lesson));
    }
    
    // Apply missing content filter
    if (showOnlyMissingContent) {
      filteredLessons = filteredLessons.filter(lesson => isLessonMissingContent(lesson));
    }
    
    return {
      ...subject,
      lessons: filteredLessons,
      quizCount,
      missingQuizzes,
      totalLessons: subjectLessons.length
    };
  }).filter(subject => {
    // When showing only missing quizzes or content, hide subjects with no matching lessons
    if ((showOnlyMissingQuiz || showOnlyMissingContent) && subject.lessons.length === 0) {
      return false;
    }
    // Otherwise, show subjects that match search or have lessons
    return searchQuery === "" || 
      subject.lessons.length > 0 || 
      subject.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Parcourir les Leçons</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadSubjects}
            disabled={isLoadingSubjects || isLoading}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${(isLoadingSubjects || isLoading) ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Grade Level Filter */}
        <div className="mt-4 space-y-2">
          <Label>Niveau scolaire</Label>
          <Select value={gradeLevel} onValueChange={(value) => {
            setGradeLevel(value);
            // Reset series when changing grade
            if (value !== "NS3" && value !== "NS4") {
              setSeries("all");
            }
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

        {/* Series Filter for NS3/NS4 */}
        {isNS3OrNS4 && (
          <div className="mt-4 space-y-2">
            <Label>Série</Label>
            <Select value={series} onValueChange={setSeries}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {seriesOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filter Checkboxes */}
        <div className="space-y-2 mt-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="missing-quiz" 
              checked={showOnlyMissingQuiz}
              onCheckedChange={(checked) => setShowOnlyMissingQuiz(checked === true)}
            />
            <Label htmlFor="missing-quiz" className="text-sm text-muted-foreground cursor-pointer">
              Quizzes manquants uniquement
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="missing-content" 
              checked={showOnlyMissingContent}
              onCheckedChange={(checked) => setShowOnlyMissingContent(checked === true)}
            />
            <Label htmlFor="missing-content" className="text-sm text-muted-foreground cursor-pointer">
              Contenu manquant uniquement
            </Label>
          </div>
        </div>

        {/* Coverage Stats */}
        {gradeLevel !== "all" && totalLessons > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 space-y-3">
            {/* Content Coverage */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-1">
                {missingContentTotal > 0 && <FileX className="h-3.5 w-3.5 text-blue-600" />}
                {gradeLevel}: {lessonsWithContent}/{totalLessons} contenu
              </span>
              <span className={missingContentTotal > 0 ? "text-blue-600 font-medium" : "text-muted-foreground"}>
                {contentPercentage}%
              </span>
            </div>
            <Progress 
              value={contentPercentage} 
              className={`h-2 ${missingContentTotal > 50 ? "[&>div]:bg-blue-600" : missingContentTotal > 0 ? "[&>div]:bg-blue-500" : ""}`}
            />
            {missingContentTotal > 0 && (
              <p className="text-xs text-blue-600">
                {missingContentTotal} leçon{missingContentTotal > 1 ? 's' : ''} sans contenu
              </p>
            )}

            {/* Quiz Coverage */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-1">
                {missingQuizzesTotal > 0 && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                {gradeLevel}: {lessonsWithQuiz}/{totalLessons} quizzes
              </span>
              <span className={missingQuizzesTotal > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>
                {quizPercentage}%
              </span>
            </div>
            <Progress 
              value={quizPercentage} 
              className={`h-2 ${missingQuizzesTotal > 50 ? "[&>div]:bg-destructive" : missingQuizzesTotal > 0 ? "[&>div]:bg-amber-500" : ""}`}
            />
            {missingQuizzesTotal > 0 && (
              <p className="text-xs text-destructive">
                {missingQuizzesTotal} leçon{missingQuizzesTotal > 1 ? 's' : ''} sans quiz
              </p>
            )}

            {/* Generation Section */}
            {(missingContentTotal > 0 || missingQuizzesTotal > 0) && (
              <div className="space-y-1.5 pt-1">
                <Label className="text-xs text-muted-foreground">Génération</Label>
                {missingContentTotal > 0 && (
                  <BatchContentGenerator 
                    lessons={lessonsMissingContent}
                    gradeLevel={gradeLevel}
                    onComplete={() => {
                      setActiveBatchOperation(null);
                      loadSubjects();
                    }}
                    onStart={() => setActiveBatchOperation('content-generate')}
                    onDashboardRefresh={onDashboardRefresh}
                    disabled={activeBatchOperation !== null && activeBatchOperation !== 'content-generate'}
                  />
                )}
                {missingQuizzesTotal > 0 && (
                  <BatchQuizGeneratorNew 
                    lessons={lessonsMissingQuiz}
                    gradeLevel={gradeLevel}
                    onComplete={() => {
                      setActiveBatchOperation(null);
                      loadSubjects();
                    }}
                    onStart={() => setActiveBatchOperation('quiz-generate')}
                    onDashboardRefresh={onDashboardRefresh}
                    disabled={activeBatchOperation !== null && activeBatchOperation !== 'quiz-generate'}
                  />
                )}
              </div>
            )}

            {/* Validation Section */}
            {(lessonsWithValidQuiz.length > 0 || lessonsWithValidActivities.length > 0) && (
              <div className="space-y-1.5 pt-1">
                <Label className="text-xs text-muted-foreground">Validation</Label>
                <div className="space-y-1.5">
                  {lessonsWithValidQuiz.length > 0 && (
                    <BatchQuizValidator 
                      lessons={lessonsWithValidQuiz}
                      gradeLevel={gradeLevel}
                      onComplete={() => {
                        setActiveBatchOperation(null);
                        loadSubjects();
                      }}
                      onStart={() => setActiveBatchOperation('quiz-validate')}
                      onDashboardRefresh={onDashboardRefresh}
                      disabled={activeBatchOperation !== null && activeBatchOperation !== 'quiz-validate'}
                    />
                  )}
                  {lessonsWithValidActivities.length > 0 && (
                    <BatchActivitiesValidator 
                      lessons={lessonsWithValidActivities}
                      gradeLevel={gradeLevel}
                      onComplete={() => {
                        setActiveBatchOperation(null);
                        loadSubjects();
                      }}
                      onStart={() => setActiveBatchOperation('activities-validate')}
                      onDashboardRefresh={onDashboardRefresh}
                      disabled={activeBatchOperation !== null && activeBatchOperation !== 'activities-validate'}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Regeneration Section - only shows if flagged items exist */}
            <BatchQuizRegenerator 
              lessons={lessonsWithValidQuiz}
              gradeLevel={gradeLevel}
              onComplete={() => {
                setActiveBatchOperation(null);
                loadSubjects();
              }}
              onStart={() => setActiveBatchOperation('quiz-regenerate')}
              onDashboardRefresh={onDashboardRefresh}
              disabled={activeBatchOperation !== null && activeBatchOperation !== 'quiz-regenerate'}
            />
            <BatchActivitiesRegenerator 
              lessons={lessonsWithValidActivities}
              gradeLevel={gradeLevel}
              onComplete={() => {
                setActiveBatchOperation(null);
                loadSubjects();
              }}
              onStart={() => setActiveBatchOperation('activities-regenerate')}
              onDashboardRefresh={onDashboardRefresh}
              disabled={activeBatchOperation !== null && activeBatchOperation !== 'activities-regenerate'}
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          {isLoadingSubjects || isLoading ? (
            <div className="text-center text-muted-foreground py-8">Chargement...</div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucun résultat trouvé
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSubjects.map((subject) => (
                <Collapsible
                  key={subject.id}
                  open={openSubjects.has(subject.id)}
                  onOpenChange={() => toggleSubject(subject.id)}
                >
                  <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded-md transition-colors">
                    {openSubjects.has(subject.id) ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="flex-shrink-0">{getSubjectIcon(subject.icon_name)}</span>
                    <span className="flex-1 text-left font-medium text-sm leading-tight">
                      {subject.name}
                    </span>
                    <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                      <Badge variant="secondary">
                        {subject.lessons.length}
                      </Badge>
                      {subject.missingQuizzes > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          -{subject.missingQuizzes}
                        </Badge>
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-6 mt-1 space-y-1">
                       {subject.lessons.map((lesson: any) => {
                         const isSelected = selectedLesson?.id === lesson.id;
                         const { quiz: quizIssues, activities: activityIssues } = extractValidationDetails(lesson);
                         
                         return (
                           <div key={lesson.id}>
                             <div
                               onClick={() => onSelectLesson(lesson)}
                               className={`p-2 rounded-md cursor-pointer transition-colors ${
                                 selectedLesson?.id === lesson.id
                                   ? "bg-primary/10 border border-primary"
                                   : "hover:bg-muted"
                               }`}
                             >
                               <div className="flex items-start justify-between gap-2">
                                 <span className="text-sm font-medium flex-1 line-clamp-2">
                                   {lesson.title}
                                 </span>
                                 <div className="flex items-center gap-1 flex-shrink-0">
                                   {lesson.needs_quiz_regeneration && (
                                     <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                                       <RotateCcw className="h-3 w-3 mr-0.5" />
                                       Quiz
                                     </Badge>
                                   )}
                                   {lesson.needs_activities_regeneration && (
                                     <Badge variant="outline" className="text-xs border-purple-500 text-purple-600">
                                       <RotateCcw className="h-3 w-3 mr-0.5" />
                                       Activités
                                     </Badge>
                                   )}
                                    {isLessonMissingContent(lesson) && (
                                      <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                                        <FileX className="h-3 w-3 mr-0.5" />
                                        Vide
                                      </Badge>
                                    )}
                                    {!hasValidQuiz(lesson) && (
                                     <Badge variant="destructive" className="text-xs flex items-center gap-0.5">
                                       <AlertCircle className="h-3 w-3" />
                                       Quiz
                                     </Badge>
                                   )}
                                   <Badge 
                                     variant={lesson.workflow_status === 'published' ? "default" : lesson.workflow_status === 'approved' ? "secondary" : "outline"}
                                     className="text-xs"
                                   >
                                     {lesson.workflow_status === 'published' ? 'Publié' : 
                                      lesson.workflow_status === 'approved' ? 'Approuvé' :
                                      lesson.workflow_status === 'in_review' ? 'En révision' :
                                      lesson.workflow_status === 'rejected' ? 'Rejeté' : 'Brouillon'}
                                   </Badge>
                                 </div>
                               </div>
                               <div className="mt-1">
                                 <Badge variant="outline" className="text-xs">
                                   {lesson.grade_level}
                                 </Badge>
                               </div>
                             </div>
                             
                              {/* Validation Details Panel - shown only for selected lesson with issues */}
                              {isSelected && (quizIssues.length > 0 || activityIssues.length > 0) && (
                                <div className="mt-2 ml-2 space-y-2">
                                  {quizIssues.length > 0 && (
                                    <ValidationDetailsPanel
                                      lessonTitle={lesson.title}
                                      validationType="quiz"
                                      offContentQuestions={quizIssues}
                                      aligned={false}
                                      confidence={lesson.content_alignment_score || 0}
                                      onRegenerate={() => regenerateQuiz(lesson)}
                                      isRegenerating={regeneratingLessonId === lesson.id}
                                    />
                                  )}
                                  {activityIssues.length > 0 && (
                                    <ValidationDetailsPanel
                                      lessonTitle={lesson.title}
                                      validationType="activities"
                                      offContentQuestions={activityIssues}
                                      aligned={false}
                                      confidence={lesson.activities_alignment_score || 0}
                                      onRegenerate={() => regenerateActivities(lesson)}
                                      isRegenerating={regeneratingLessonId === lesson.id}
                                    />
                                  )}
                                </div>
                              )}
                           </div>
                         );
                       })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
