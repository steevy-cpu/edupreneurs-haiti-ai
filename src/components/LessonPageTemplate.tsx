import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BookOpen, FileText, Gamepad2, Target, GraduationCap, Sparkles, WifiOff, Layers } from "lucide-react";
import { useUserProfile, useInvalidateUserProfile } from "@/hooks/useUserProfile";

import { LessonHeader } from "@/features/matieres/components/LessonHeader";
import { TabErrorBoundary } from "@/features/matieres/components/TabErrorBoundary";
import { LessonAIPracticeSection } from "@/components/lesson/LessonAIPracticeSection";
import { LessonQuickStats } from "@/components/lesson/LessonQuickStats";
import { LessonNavigation } from "@/components/lesson/LessonNavigation";
import { LessonFeedback } from "@/components/lesson/LessonFeedback";
import {
  countActivities,
  countQuizQuestions,
  estimateReadingTime,
} from "@/features/matieres/utils/lesson-stats";
import type { LessonPageTemplateProps } from "@/features/matieres/types/lesson.types";

// Lazy-loaded tab components for 3G optimization
import {
  LessonIntroductionTab,
  LessonContenuTab,
  LessonStudygramTab,
  LessonActivitiesTab,
  LessonQuizTab,
  LessonNotesTab,
} from "@/features/matieres/components/tabs";

// Tab completion indicator dot
const TabIndicator = ({ status }: { status: 'complete' | 'viewed' | 'pending' }) => (
  <span className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ${
    status === 'complete' ? 'bg-green-500' :
    status === 'viewed' ? 'bg-primary/60' :
    'bg-muted-foreground/30'
  }`} />
);

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
  isOfflineMode = false,
}: LessonPageTemplateProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("introduction");
  const [viewedTabs, setViewedTabs] = useState<Set<string>>(new Set(["introduction"]));
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [hasNotes, setHasNotes] = useState(false);

  // Gold balance from cached profile — no extra query
  const { profile } = useUserProfile();
  const invalidateUserProfile = useInvalidateUserProfile();

  // Callback for child components (quiz/activities) when gold is awarded
  const handleGoldUpdate = useCallback(() => {
    // Invalidate profile cache to pick up new gold_earned from DB
    invalidateUserProfile();
  }, [invalidateUserProfile]);

  // Calculate stats
  const activitiesCount = countActivities(lesson.activites_interactives) ||
    (lesson.activites_interactives ? 3 : 0);
  const quizQuestionsCount = countQuizQuestions(lesson.quiz_final) ||
    (lesson.quiz_final ? 5 : 0);
  const estimatedMinutes = estimateReadingTime(lesson.contenu, lesson.introduction, lesson.exemples_exercices);

  useEffect(() => {
    checkLessonCompletion();
  }, [lessonSlug]);

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

  const getTabStatus = (tabId: string): 'complete' | 'viewed' | 'pending' => {
    if (tabId === 'notes' && hasNotes) return 'complete';
    if (isLessonCompleted && (tabId === 'activites' || tabId === 'quiz')) return 'complete';
    if (viewedTabs.has(tabId)) return 'viewed';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Header */}
      <LessonHeader
        lesson={lesson}
        subjectName={subjectName}
        subjectSlug={subjectSlug}
        gradeLevel={gradeLevel}
        judeImage={judeImage}
        isLessonCompleted={isLessonCompleted}
        goldEarned={profile.goldEarned}
        onGoldUpdate={handleGoldUpdate}
      />

      {/* Offline mode banner — shown when serving cached content */}
      {isOfflineMode && (
        <div className="container mx-auto px-2 sm:px-4 pt-3">
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
            <WifiOff className="h-4 w-4 shrink-0" />
            <p>Mode hors-ligne — contenu mis en cache. Certaines fonctionnalités sont indisponibles.</p>
          </div>
        </div>
      )}

      {/* Navigation & Stats */}
      <div className="container mx-auto px-2 sm:px-4 py-4 space-y-4">
        {totalLessons > 1 && (
          <LessonNavigation
            currentIndex={currentLessonIndex}
            totalLessons={totalLessons}
            previousLesson={previousLesson}
            nextLesson={nextLesson}
            subjectSlug={subjectSlug}
          />
        )}
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
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto p-1 gap-1 [&>button[data-state=active]]:bg-emerald-600 [&>button[data-state=active]]:text-white [&>button[data-state=active]]:shadow-md">
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
              <TabsTrigger value="studygram" className="relative flex-col sm:flex-row py-2 sm:py-3 text-xs sm:text-sm gap-1">
                <TabIndicator status={getTabStatus('studygram')} />
                <Layers className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Studygram</span>
                <span className="sm:hidden text-[10px]">Study</span>
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

        {/* Tab Content */}
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <TabsContent value="introduction" className="space-y-4 sm:space-y-6 mt-4">
            <TabErrorBoundary tabName="Introduction">
              <LessonIntroductionTab
                introduction={lesson.introduction}
                audioUrl={lesson.audio_introduction_url}
                subjectName={subjectName}
              />
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="contenu" className="space-y-4 sm:space-y-6 mt-4">
            <TabErrorBoundary tabName="Contenu">
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
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="studygram" className="space-y-4 sm:space-y-6 mt-4">
            <TabErrorBoundary tabName="Studygram">
              <LessonStudygramTab
                lessonId={lesson.id}
                lessonTitle={lesson.title}
                contenu={lesson.contenu}
                exemplesExercices={lesson.exemples_exercices}
                objectif={lesson.objectif}
                gradeLevel={gradeLevel}
                subjectName={subjectName}
              />
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="activites" className="space-y-4 sm:space-y-6 mt-4">
            <TabErrorBoundary tabName="Activités">
              <LessonActivitiesTab
                lessonId={lesson.id}
                subjectName={subjectName}
                gradeLevel={gradeLevel}
                lessonTitle={lesson.title}
                lessonContent={lesson.contenu}
                lessonExamples={lesson.exemples_exercices}
                legacyActivitiesHtml={lesson.activites_interactives}
                onGoldUpdate={handleGoldUpdate}
                isOfflineMode={isOfflineMode}
              />
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4 sm:space-y-6 mt-4">
            <TabErrorBoundary tabName="Quiz">
              <LessonQuizTab
                lessonId={lesson.id}
                lessonSlug={lessonSlug}
                subjectName={subjectName}
                subjectSlug={subjectSlug}
                gradeLevel={gradeLevel}
                lessonContent={lesson.contenu}
                lessonExamples={lesson.exemples_exercices}
                legacyQuizHtml={lesson.quiz_final}
                isOfflineMode={isOfflineMode}
                onGoldUpdate={handleGoldUpdate}
              />
            </TabErrorBoundary>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 sm:space-y-6 mt-4">
            <TabErrorBoundary tabName="Notes">
              <LessonNotesTab
                lessonSlug={lessonSlug}
                onNotesChange={(notesExist) => {
                  setHasNotes(notesExist);
                  if (notesExist) {
                    setViewedTabs(prev => new Set([...prev, 'notes']));
                  }
                }}
              />
            </TabErrorBoundary>
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer sections */}
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

        <div className="mt-6 sm:mt-8">
          <LessonFeedback lessonId={lesson.id} />
        </div>

        {/* Next Lesson CTA */}
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
