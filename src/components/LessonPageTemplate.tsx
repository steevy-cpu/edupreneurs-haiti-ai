import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BookOpen, FileText, Gamepad2, Target, Lightbulb, ArrowLeft, Save, GraduationCap, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { HTMLQuizParser } from "@/components/HTMLQuizParser";
import { JudeChatbot } from "@/components/JudeChatbot";
import { LessonAIPracticeSection } from "@/components/lesson/LessonAIPracticeSection";
import { LessonQuickStats } from "@/components/lesson/LessonQuickStats";
import { LessonNavigation } from "@/components/lesson/LessonNavigation";
import { LessonAudioPlayerSimple } from "@/components/LessonAudioPlayerSimple";
import { MathContent, isMathSubject } from "@/components/MathContent";

interface LessonData {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  youtube_url?: string;
  grade_level: string;
  activites_interactives?: string;
  quiz_final?: string;
  // Pre-generated audio URLs
  audio_objectif_url?: string | null;
  audio_introduction_url?: string | null;
  audio_contenu_url?: string | null;
  audio_exemples_url?: string | null;
}

interface SiblingLesson {
  slug: string;
  title: string;
}

interface LessonPageTemplateProps {
  lesson: LessonData;
  lessonSlug: string;
  subjectName: string;
  subjectSlug: string;
  gradeLevel: string;
  judeImage: string;
  // Navigation props
  currentLessonIndex?: number;
  totalLessons?: number;
  previousLesson?: SiblingLesson | null;
  nextLesson?: SiblingLesson | null;
  // Audio enabled for first lessons only
  isFirstLesson?: boolean;
}

// Motivational messages based on progress
const MOTIVATIONAL_MESSAGES = [
  "Tu fais du bon travail! Continue comme ça! 💪",
  "Chaque leçon te rapproche de ton objectif! 🎯",
  "L'apprentissage est une aventure, profites-en! 🚀",
  "Tu es sur la bonne voie! 🌟",
  "Bravo pour ta persévérance! 👏"
];

// Helper to count activities and quiz questions
const countActivities = (activitiesHtml?: string): number => {
  if (!activitiesHtml) return 0;
  // Count activity blocks (data-activity-type attributes or activity markers)
  const activityMatches = activitiesHtml.match(/data-activity-type|class="activity-|<div[^>]*activity/gi);
  return activityMatches ? Math.min(activityMatches.length, 10) : 0;
};

const countQuizQuestions = (quizHtml?: string): number => {
  if (!quizHtml) return 0;
  // Count question blocks
  const questionMatches = quizHtml.match(/data-question|class="quiz-question|<div[^>]*question/gi);
  return questionMatches ? Math.min(questionMatches.length, 20) : 0;
};

const estimateReadingTime = (content: string, intro: string, examples: string): number => {
  const totalText = `${intro || ''} ${content || ''} ${examples || ''}`;
  const wordCount = totalText.split(/\s+/).filter(Boolean).length;
  // Average reading speed: 200 words per minute, add time for activities
  return Math.max(5, Math.ceil(wordCount / 200) + 5);
};

export const LessonPageTemplate = ({
  lesson,
  lessonSlug,
  subjectName,
  subjectSlug,
  gradeLevel,
  judeImage,
  currentLessonIndex = 1,
  totalLessons = 1,
  previousLesson = null,
  nextLesson = null,
  isFirstLesson = false
}: LessonPageTemplateProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [personalNotes, setPersonalNotes] = useState("");
  const [viewedTabs, setViewedTabs] = useState<Set<string>>(new Set(["introduction"]));
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  

  // Get random motivational message (stable per session)
  const [motivationalMessage] = useState(() => 
    MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
  );

  // Calculate stats
  const activitiesCount = countActivities(lesson.activites_interactives) || 
    (lesson.activites_interactives ? 3 : 0); // Default to 3 if has content
  const quizQuestionsCount = countQuizQuestions(lesson.quiz_final) || 
    (lesson.quiz_final ? 5 : 0); // Default to 5 if has content
  const estimatedMinutes = estimateReadingTime(lesson.contenu, lesson.introduction, lesson.exemples_exercices);

  useEffect(() => {
    loadPersonalNotes();
    checkLessonCompletion();
  }, [lessonSlug]);

  // Track viewed tabs
  useEffect(() => {
    setViewedTabs(prev => new Set([...prev, activeTab]));
  }, [activeTab]);

  const loadPersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lesson_notes')
        .select('notes')
        .eq('lesson_id', lessonSlug)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPersonalNotes(data.notes || '');
        if (data.notes) {
          setViewedTabs(prev => new Set([...prev, 'notes']));
        }
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const checkLessonCompletion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('lesson_completions')
        .select('id')
        .eq('lesson_slug', lessonSlug)
        .eq('user_id', user.id)
        .maybeSingle();

      setIsLessonCompleted(!!data);
    } catch (error) {
      console.error('Error checking completion:', error);
    }
  };

  const savePersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour sauvegarder des notes",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('lesson_notes')
        .upsert({
          lesson_id: lessonSlug,
          user_id: user.id,
          notes: personalNotes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'lesson_id,user_id'
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Notes sauvegardées avec succès",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes",
        variant: "destructive",
      });
    }
  };

  // Tab completion indicator
  const getTabStatus = (tabId: string): 'complete' | 'viewed' | 'pending' => {
    if (tabId === 'notes' && personalNotes.length > 0) return 'complete';
    if (isLessonCompleted && (tabId === 'activites' || tabId === 'quiz')) return 'complete';
    if (viewedTabs.has(tabId)) return 'viewed';
    return 'pending';
  };

  const TabIndicator = ({ status }: { status: 'complete' | 'viewed' | 'pending' }) => (
    <span className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ${
      status === 'complete' ? 'bg-green-500' :
      status === 'viewed' ? 'bg-primary/60' :
      'bg-muted-foreground/30'
    }`} />
  );

  // Subject-specific gradient
  const getSubjectGradient = () => {
    const subjectLower = subjectName.toLowerCase();
    if (subjectLower.includes('anglais')) return 'from-blue-600/20 via-cyan-500/10 to-background';
    if (subjectLower.includes('espagnol')) return 'from-orange-500/20 via-amber-500/10 to-background';
    if (subjectLower.includes('français')) return 'from-indigo-500/20 via-violet-500/10 to-background';
    if (subjectLower.includes('math')) return 'from-purple-500/20 via-pink-500/10 to-background';
    if (subjectLower.includes('science')) return 'from-emerald-500/20 via-teal-500/10 to-background';
    return 'from-primary/10 via-primary/5 to-background';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Enhanced Header */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${getSubjectGradient()} border-b border-border/50`}>
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative">
          <Button
            variant="ghost"
            onClick={() => navigate(`/course/${subjectSlug}`)}
            className="mb-4 sm:mb-6 hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-base">Retour au cours</span>
          </Button>

          <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-8 max-w-6xl mx-auto">
            {/* Mobile/Tablet: Jude inline with title */}
            <div className="flex items-start gap-4 w-full lg:hidden">
              <div className="flex-1 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs sm:text-sm">{gradeLevel}</Badge>
                  <Badge variant="outline" className="text-xs sm:text-sm">{subjectName}</Badge>
                  {isLessonCompleted && (
                    <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs sm:text-sm">
                      ✓ Terminée
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent break-words">
                  {lesson.title}
                </h1>
              </div>
              {/* Jude image for mobile/tablet */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl" />
                <img
                  src={judeImage}
                  alt="Jude - Professeur"
                  className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain drop-shadow-xl"
                />
              </div>
            </div>

            {/* Mobile/Tablet: Rest of content below */}
            <div className="space-y-2 sm:space-y-3 w-full lg:hidden">
              {isMathSubject(subjectName) ? (
                <MathContent content={lesson.objectif} className="text-muted-foreground text-sm sm:text-base" />
              ) : (
                <div 
                  className="text-muted-foreground lesson-content text-sm sm:text-base" 
                  dangerouslySetInnerHTML={{ __html: lesson.objectif }}
                />
              )}
              
              {/* Motivational message */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 rounded-lg px-3 py-2">
                <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{motivationalMessage}</span>
              </div>

              {/* Audio Player - Only show if audio URL exists */}
              {lesson.audio_objectif_url && (
                <LessonAudioPlayerSimple
                  audioUrl={lesson.audio_objectif_url}
                  label="Écouter l'objectif"
                  className="w-full"
                />
              )}

              <div className="flex gap-2 flex-wrap">
                <DownloadLessonButton 
                  subjectName={subjectName}
                  lessonData={{
                    title: lesson.title,
                    objectif: lesson.objectif,
                    introduction: lesson.introduction,
                    contenu: lesson.contenu,
                    exemples_exercices: lesson.exemples_exercices,
                    youtube_url: lesson.youtube_url,
                    grade_level: lesson.grade_level
                  }} 
                />
              </div>
            </div>

            {/* Desktop: Original side-by-side layout */}
            <div className="hidden lg:block flex-1 space-y-4 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-sm">{gradeLevel}</Badge>
                <Badge variant="outline" className="text-sm">{subjectName}</Badge>
                {isLessonCompleted && (
                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-sm">
                    ✓ Terminée
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent break-words">
                {lesson.title}
              </h1>
              {isMathSubject(subjectName) ? (
                <MathContent content={lesson.objectif} className="text-muted-foreground text-base" />
              ) : (
                <div 
                  className="text-muted-foreground lesson-content text-base" 
                  dangerouslySetInnerHTML={{ __html: lesson.objectif }}
                />
              )}
              
              {/* Motivational message */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 rounded-lg px-3 py-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>{motivationalMessage}</span>
              </div>

              {/* Audio Player - Only show if audio URL exists */}
              {lesson.audio_objectif_url && (
                <LessonAudioPlayerSimple
                  audioUrl={lesson.audio_objectif_url}
                  label="Écouter l'objectif"
                  className="w-full max-w-md"
                />
              )}

              <div className="flex gap-2 flex-wrap">
                <DownloadLessonButton 
                  subjectName={subjectName}
                  lessonData={{
                    title: lesson.title,
                    objectif: lesson.objectif,
                    introduction: lesson.introduction,
                    contenu: lesson.contenu,
                    exemples_exercices: lesson.exemples_exercices,
                    youtube_url: lesson.youtube_url,
                    grade_level: lesson.grade_level
                  }} 
                />
              </div>
            </div>

            {/* Desktop: Jude image */}
            <div className="relative hidden lg:block flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl" />
              <img
                src={judeImage}
                alt="Jude - Professeur"
                className="relative w-48 h-48 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Navigation & Stats */}
      <div className="container mx-auto px-2 sm:px-4 py-4 space-y-4">
        {/* Navigation */}
        {totalLessons > 1 && (
          <LessonNavigation
            currentIndex={currentLessonIndex}
            totalLessons={totalLessons}
            previousLesson={previousLesson}
            nextLesson={nextLesson}
            subjectSlug={subjectSlug}
          />
        )}

        {/* Quick Stats */}
        <LessonQuickStats
          estimatedMinutes={estimatedMinutes}
          activitiesCount={activitiesCount}
          quizQuestionsCount={quizQuestionsCount}
          isCompleted={isLessonCompleted}
        />
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Sticky Tabs Navigation */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b shadow-sm">
          <div className="container mx-auto px-2 sm:px-4 py-2">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-3 md:grid-cols-5 h-auto p-1 gap-1">
            <TabsTrigger value="introduction" className="relative flex-col sm:flex-row py-2 sm:py-3 text-xs sm:text-sm gap-1">
              <TabIndicator status={getTabStatus('introduction')} />
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Introduction</span>
              <span className="sm:hidden text-[10px]">Intro</span>
            </TabsTrigger>
            <TabsTrigger value="contenu" className="relative flex-col sm:flex-row py-2 sm:py-3 text-xs sm:text-sm gap-1">
              <TabIndicator status={getTabStatus('contenu')} />
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Contenu & Exemples</span>
              <span className="sm:hidden text-[10px]">Cours</span>
            </TabsTrigger>
            <TabsTrigger value="activites" className="relative flex-col sm:flex-row py-2 sm:py-3 text-xs sm:text-sm gap-1">
              <TabIndicator status={getTabStatus('activites')} />
              <Gamepad2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Activités</span>
              <span className="sm:hidden text-[10px]">Act</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="relative flex-col sm:flex-row py-2 sm:py-3 text-xs sm:text-sm gap-1">
              <TabIndicator status={getTabStatus('quiz')} />
              <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Quiz</span>
              <span className="sm:hidden text-[10px]">Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="relative flex-col sm:flex-row py-2 sm:py-3 text-xs sm:text-sm gap-1">
              <TabIndicator status={getTabStatus('notes')} />
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Mes notes</span>
              <span className="sm:hidden text-[10px]">Notes</span>
            </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <TabsContent value="introduction" className="space-y-4 sm:space-y-6 mt-4">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 space-y-4">
                {lesson.audio_introduction_url && (
                  <LessonAudioPlayerSimple
                    audioUrl={lesson.audio_introduction_url}
                    label="Écouter l'introduction"
                    className="w-full"
                  />
                )}
                {lesson.introduction ? (
                  isMathSubject(subjectName) ? (
                    <MathContent content={lesson.introduction} />
                  ) : (
                    <div className="lesson-content prose prose-sm sm:prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: lesson.introduction }} />
                  )
                ) : (
                  <p className="text-muted-foreground text-sm sm:text-base">Pas d'introduction disponible</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contenu" className="space-y-4 sm:space-y-6 mt-4">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  Contenu du cours
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 space-y-4">
                {lesson.audio_contenu_url && (
                  <LessonAudioPlayerSimple
                    audioUrl={lesson.audio_contenu_url}
                    label="Écouter le contenu"
                    className="w-full"
                  />
                )}
                {lesson.contenu ? (
                  isMathSubject(subjectName) ? (
                    <MathContent content={lesson.contenu} className="overflow-x-auto" />
                  ) : (
                    <div className="lesson-content prose prose-sm sm:prose-lg max-w-none overflow-x-auto" dangerouslySetInnerHTML={{ __html: lesson.contenu }} />
                  )
                ) : (
                  <p className="text-muted-foreground text-sm sm:text-base">Pas de contenu disponible</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
                  Exemples et Exercices
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 space-y-4">
                {lesson.audio_exemples_url && (
                  <LessonAudioPlayerSimple
                    audioUrl={lesson.audio_exemples_url}
                    label="Écouter les exemples"
                    className="w-full"
                  />
                )}
                {lesson.exemples_exercices ? (
                  isMathSubject(subjectName) ? (
                    <MathContent content={lesson.exemples_exercices} className="overflow-x-auto" />
                  ) : (
                    <div className="lesson-content prose prose-sm sm:prose-lg max-w-none overflow-x-auto" dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }} />
                  )
                ) : (
                  <p className="text-muted-foreground text-sm sm:text-base">Pas d'exemples disponibles</p>
                )}
              </CardContent>
            </Card>

            <YouTubeVideoSection 
              lessonId={lesson.id}
              lessonTitle={lesson.title}
              objectives={lesson.objectif}
              gradeLevel={gradeLevel}
              subject={subjectName.toLowerCase()}
              customYoutubeUrl={lesson.youtube_url}
            />
          </TabsContent>

          <TabsContent value="activites" className="space-y-4 sm:space-y-6 mt-4">
            {lesson.activites_interactives ? (
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                    <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    Activités Interactives
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <InteractiveActivitiesEnhanced 
                    content={lesson.activites_interactives}
                    isLoading={false}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-3 sm:p-6">
                  <p className="text-muted-foreground text-sm sm:text-base">Aucune activité interactive disponible</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4 sm:space-y-6 mt-4">
            {lesson.quiz_final ? (
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                    <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
                    Quiz Final
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <HTMLQuizParser 
                    htmlContent={lesson.quiz_final}
                    lessonSlug={lessonSlug}
                    subject={subjectName.toLowerCase()}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-3 sm:p-6">
                  <p className="text-muted-foreground text-sm sm:text-base">Aucun quiz disponible pour le moment</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 sm:space-y-6 mt-4">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  Mes Notes Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-3 sm:p-6">
                <Textarea
                  placeholder="Écris tes notes ici..."
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  className="min-h-[200px] sm:min-h-[300px] resize-none text-sm sm:text-base"
                />
                <Button onClick={savePersonalNotes} className="w-full">
                  <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Sauvegarder mes notes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
      
      {/* AI Practice Section for Language Subjects */}
      <div className="container mx-auto px-2 sm:px-4">
        <div className="mt-6 sm:mt-8">
          <LessonAIPracticeSection
            subjectName={subjectName}
            lessonTitle={lesson.title}
            lessonObjective={lesson.objectif}
            lessonSlug={lessonSlug}
            gradeLevel={gradeLevel}
          />
        </div>

        {/* Next Lesson CTA when completed */}
        {isLessonCompleted && nextLesson && (
          <Card className="mt-6 sm:mt-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-lg flex items-center gap-2 justify-center sm:justify-start">
                  <Sparkles className="h-5 w-5 text-green-500" />
                  Félicitations! Leçon terminée!
                </h3>
                <p className="text-muted-foreground text-sm">
                  Continue ton apprentissage avec la prochaine leçon
                </p>
              </div>
              <Button 
                onClick={() => navigate(`/course/${subjectSlug}/${nextLesson.slug}`)}
                className="bg-green-600 hover:bg-green-700"
              >
                Prochaine leçon →
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Jude Chatbot */}
      <JudeChatbot />
    </div>
  );
};
