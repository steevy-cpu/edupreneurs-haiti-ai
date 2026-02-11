import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BookOpen, FileText, Gamepad2, Target, ArrowLeft, GraduationCap, Sparkles } from "lucide-react";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";

import { LessonAIPracticeSection } from "@/components/lesson/LessonAIPracticeSection";
import { LessonQuickStats } from "@/components/lesson/LessonQuickStats";
import { LessonNavigation } from "@/components/lesson/LessonNavigation";
import { LessonFeedback } from "@/components/lesson/LessonFeedback";
import { LessonAudioPlayerSimple } from "@/components/LessonAudioPlayerSimple";
import { MathContent, isMathSubject } from "@/components/MathContent";

// Lazy-loaded tab components for 3G optimization
import { 
  LessonIntroductionTab, 
  LessonContenuTab, 
  LessonActivitiesTab, 
  LessonQuizTab, 
  LessonNotesTab 
} from "@/features/matieres/components/tabs";

// Security: DOMPurify configuration for educational content
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 
                  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                  'table', 'tr', 'td', 'th', 'thead', 'tbody',
                  'img', 'a', 'span', 'div', 'code', 'pre', 'blockquote',
                  'sup', 'sub', 'hr'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'id'],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur']
};

// Helper to sanitize HTML content
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
};

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
  const [activeTab, setActiveTab] = useState("introduction");
  const [viewedTabs, setViewedTabs] = useState<Set<string>>(new Set(["introduction"]));
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [hasNotes, setHasNotes] = useState(false);

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
    checkLessonCompletion();
  }, [lessonSlug]);

  // Track viewed tabs
  useEffect(() => {
    setViewedTabs(prev => new Set([...prev, activeTab]));
  }, [activeTab]);

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

  // Tab completion indicator
  const getTabStatus = (tabId: string): 'complete' | 'viewed' | 'pending' => {
    if (tabId === 'notes' && hasNotes) return 'complete';
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
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.objectif) }}
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
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.objectif) }}
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
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-3 md:grid-cols-5 h-auto p-1 gap-1 [&>button[data-state=active]]:bg-emerald-600 [&>button[data-state=active]]:text-white [&>button[data-state=active]]:shadow-md">
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

        {/* Scrollable Content Container - Lazy-loaded tabs */}
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <TabsContent value="introduction" className="space-y-4 sm:space-y-6 mt-4">
            <LessonIntroductionTab
              introduction={lesson.introduction}
              audioUrl={lesson.audio_introduction_url}
              subjectName={subjectName}
            />
          </TabsContent>

          <TabsContent value="contenu" className="space-y-4 sm:space-y-6 mt-4">
            <LessonContenuTab
              lessonId={lesson.id}
              lessonTitle={lesson.title}
              contenu={lesson.contenu}
              exemplesExercices={lesson.exemples_exercices}
              youtubeUrl={lesson.youtube_url}
              audioContenuUrl={lesson.audio_contenu_url}
              audioExemplesUrl={lesson.audio_exemples_url}
              subjectName={subjectName}
              gradeLevel={gradeLevel}
              objectif={lesson.objectif}
            />
          </TabsContent>

          <TabsContent value="activites" className="space-y-4 sm:space-y-6 mt-4">
            <LessonActivitiesTab
              lessonId={lesson.id}
              subjectName={subjectName}
              gradeLevel={gradeLevel}
              lessonTitle={lesson.title}
              lessonContent={lesson.contenu}
              lessonExamples={lesson.exemples_exercices}
              legacyActivitiesHtml={lesson.activites_interactives}
            />
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4 sm:space-y-6 mt-4">
            <LessonQuizTab
              lessonId={lesson.id}
              lessonSlug={lessonSlug}
              subjectName={subjectName}
              subjectSlug={subjectSlug}
              gradeLevel={gradeLevel}
              lessonContent={lesson.contenu}
              lessonExamples={lesson.exemples_exercices}
              legacyQuizHtml={lesson.quiz_final}
            />
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 sm:space-y-6 mt-4">
            <LessonNotesTab
              lessonSlug={lessonSlug}
              onNotesChange={(notesExist) => {
                setHasNotes(notesExist);
                if (notesExist) {
                  setViewedTabs(prev => new Set([...prev, 'notes']));
                }
              }}
            />
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

        {/* Lesson Feedback */}
        <div className="mt-6 sm:mt-8">
          <LessonFeedback lessonId={lesson.id} />
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

    </div>
  );
};
