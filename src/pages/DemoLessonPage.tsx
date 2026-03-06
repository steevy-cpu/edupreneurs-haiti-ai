/**
 * DemoLessonPage — Public visitor demo showing a real lesson without auth.
 * Fetches lesson data from DB, renders 4 tabs (Intro, Points Clés, Studygram, Quiz).
 * Disabled features: notes, activities, completion tracking, gold, Jude chat, feedback.
 * Sticky top banner + fixed bottom CTA drive signup conversion.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Target, Lightbulb, Layers, GraduationCap, ArrowRight, AlertCircle } from 'lucide-react';

// Reuse existing tab components — no rebuilding
import { LessonIntroductionTab } from '@/features/matieres/components/tabs/LessonIntroductionTab';
import { LessonPointsClesTab } from '@/features/matieres/components/tabs/LessonPointsClesTab';
import { LessonStudygramTab } from '@/features/matieres/components/tabs/LessonStudygramTab';
import { LessonQuizTab } from '@/features/matieres/components/tabs/LessonQuizTab';

// Hardcoded demo lesson — English 8AF "Physical and Emotional Descriptions"
const DEMO_LESSON_ID = '201daf11-e7bc-4fb9-bcf5-ca17475a1d3c';
const DEMO_LESSON_SLUG = 'descriptions-physiques-emotives';
const DEMO_SUBJECT_SLUG = 'anglais-8af';
const DEMO_SUBJECT_NAME = 'Anglais';
const DEMO_GRADE_LEVEL = '8AF';

interface DemoLesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  quiz_final: string | null;
  grade_level: string;
  audio_introduction_url: string | null;
}

export default function DemoLessonPage() {
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<DemoLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch demo lesson data on mount — single query, no auth required
  useEffect(() => {
    async function fetchLesson() {
      try {
        const { data, error: fetchError } = await supabase
          .from('lessons')
          .select('id, title, slug, objectif, introduction, contenu, exemples_exercices, quiz_final, grade_level, audio_introduction_url')
          .eq('id', DEMO_LESSON_ID)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Lesson not found');

        setLesson(data as DemoLesson);
      } catch (err) {
        console.error('[DemoLesson] Fetch error:', err);
        setError('Impossible de charger la leçon de démonstration.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchLesson();
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-primary text-primary-foreground py-2 px-4">
          <Skeleton className="h-5 w-64 bg-primary-foreground/20" />
        </div>
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-muted-foreground">{error ?? 'Leçon introuvable'}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO meta — indexable demo page for organic discovery */}
      <Helmet>
        <title>{lesson.title} — Leçon gratuite | Edupreneurs Haiti</title>
        <meta
          name="description"
          content={`Découvrez gratuitement la leçon "${lesson.title}" en ${DEMO_SUBJECT_NAME} (${DEMO_GRADE_LEVEL}). Points clés, studygram et quiz inclus.`}
        />
        <link rel="canonical" href="https://mon-edupreneur.com/demo/lesson" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-24">
        {/* Sticky top banner — promotes free trial */}
        <div className="sticky top-0 z-50 bg-primary text-primary-foreground py-2 px-4 flex items-center justify-between text-sm">
          <span className="truncate">👀 Mode aperçu — Vous explorez une leçon gratuite</span>
          <Button
            size="sm"
            variant="secondary"
            className="shrink-0 ml-2"
            onClick={() => navigate('/auth/signup/step-1')}
          >
            Accès complet gratuit — 7 jours 🎉
          </Button>
        </div>

        {/* Simple nav bar with theme toggle */}
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 text-sm">
              ← Accueil
            </Button>
            <ThemeToggle />
          </div>
        </nav>

        {/* Lesson header — title, subject, grade */}
        <div className="container mx-auto px-4 py-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {DEMO_SUBJECT_NAME}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {DEMO_GRADE_LEVEL}
            </Badge>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
              Leçon démo
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {lesson.title}
          </h1>
          {lesson.objectif && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              🎯 {lesson.objectif}
            </p>
          )}
        </div>

        {/* Tabbed lesson content — 4 tabs only (no notes/activities for demo) */}
        <div className="container mx-auto px-4">
          <Tabs defaultValue="introduction" className="space-y-4">
            <TabsList className="w-full max-w-lg grid grid-cols-4 h-auto">
              <TabsTrigger value="introduction" className="text-xs sm:text-sm gap-1 py-2">
                <Target className="h-3.5 w-3.5 hidden sm:block" />
                Intro
              </TabsTrigger>
              <TabsTrigger value="points-cles" className="text-xs sm:text-sm gap-1 py-2">
                <Lightbulb className="h-3.5 w-3.5 hidden sm:block" />
                Points Clés
              </TabsTrigger>
              <TabsTrigger value="studygram" className="text-xs sm:text-sm gap-1 py-2">
                <Layers className="h-3.5 w-3.5 hidden sm:block" />
                Studygram
              </TabsTrigger>
              <TabsTrigger value="quiz" className="text-xs sm:text-sm gap-1 py-2">
                <GraduationCap className="h-3.5 w-3.5 hidden sm:block" />
                Quiz
              </TabsTrigger>
            </TabsList>

            {/* Introduction tab — reuses existing component */}
            <TabsContent value="introduction">
              <LessonIntroductionTab
                introduction={lesson.introduction}
                audioUrl={lesson.audio_introduction_url}
                subjectName={DEMO_SUBJECT_NAME}
              />
            </TabsContent>

            {/* Points Clés tab — AI-generated flashcards via edge function */}
            <TabsContent value="points-cles">
              <LessonPointsClesTab
                lessonId={lesson.id}
                lessonTitle={lesson.title}
                contenu={lesson.contenu}
                exemplesExercices={lesson.exemples_exercices}
                objectif={lesson.objectif}
                gradeLevel={lesson.grade_level}
                subjectName={DEMO_SUBJECT_NAME}
              />
            </TabsContent>

            {/* Studygram tab — AI-generated visual revision sheet */}
            <TabsContent value="studygram">
              <LessonStudygramTab
                lessonId={lesson.id}
                lessonTitle={lesson.title}
                contenu={lesson.contenu}
                exemplesExercices={lesson.exemples_exercices}
                objectif={lesson.objectif}
                gradeLevel={lesson.grade_level}
                subjectName={DEMO_SUBJECT_NAME}
              />
            </TabsContent>

            {/* Quiz tab — gold/completion no-ops because user is null */}
            <TabsContent value="quiz">
              <LessonQuizTab
                lessonId={lesson.id}
                lessonSlug={lesson.slug}
                subjectName={DEMO_SUBJECT_NAME}
                subjectSlug={DEMO_SUBJECT_SLUG}
                gradeLevel={lesson.grade_level}
                lessonContent={lesson.contenu}
                lessonExamples={lesson.exemples_exercices}
                legacyQuizHtml={lesson.quiz_final}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Fixed bottom CTA — non-blocking, drives signup */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-primary/20 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">Vous aimez ce que vous voyez ?</p>
              <p className="text-xs text-muted-foreground truncate">Accédez à 100+ leçons, examens et Jude IA</p>
            </div>
            <Button
              className="shrink-0 gap-1"
              onClick={() => navigate('/auth/signup/step-1')}
            >
              Commencer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
