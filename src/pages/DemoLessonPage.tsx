/**
 * DemoLessonPage — Public visitor demo showing a real lesson without auth.
 * Uses LessonPageTemplate directly so visitors see the exact same design
 * as authenticated users. isDemoMode hides auth-dependent sections.
 * Sticky top banner + fixed bottom CTA drive signup conversion.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { LessonPageTemplate } from '@/components/LessonPageTemplate';
import type { LessonData } from '@/features/matieres/types/lesson.types';
import judeImage from '@/assets/eric-chair-desk.png';
import { DEMO_LESSON_SLUG, DEMO_SUBJECT_SLUG, DEMO_GRADE_LEVEL } from '@/lib/constants/demo';

// Hardcoded demo lesson UUID — kept local, not in constants file
const DEMO_LESSON_ID = '201daf11-e7bc-4fb9-bcf5-ca17475a1d3c';

export default function DemoLessonPage() {
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [subjectName, setSubjectName] = useState('Anglais');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch demo lesson + subject data on mount — no auth required
  useEffect(() => {
    async function fetchData() {
      try {
        // Parallel fetch: lesson + subject
        const [lessonRes, subjectRes] = await Promise.all([
          supabase
            .from('lessons')
            .select('id, title, slug, objectif, introduction, contenu, exemples_exercices, quiz_final, activites_interactives, grade_level, audio_objectif_url, audio_introduction_url, audio_contenu_url, audio_exemples_url, youtube_url')
            .eq('id', DEMO_LESSON_ID)
            .single(),
          supabase
            .from('subjects')
            .select('name')
            .eq('slug', DEMO_SUBJECT_SLUG)
            .single(),
        ]);

        if (lessonRes.error) throw lessonRes.error;
        if (!lessonRes.data) throw new Error('Lesson not found');

        setLesson(lessonRes.data as LessonData);

        // Use fetched subject name if available, fallback to hardcoded
        if (subjectRes.data?.name) {
          setSubjectName(subjectRes.data.name);
        }
      } catch (err) {
        console.error('[DemoLesson] Fetch error:', err);
        setError('Impossible de charger la leçon de démonstration.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
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
          content={`Découvrez gratuitement la leçon "${lesson.title}" en ${subjectName} (${DEMO_GRADE_LEVEL}). Points clés, studygram et quiz inclus.`}
        />
        <link rel="canonical" href="https://mon-edupreneur.com/demo/lesson" />
      </Helmet>

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

      {/* LessonPageTemplate with demo mode — identical layout to authenticated users */}
      <div className="pb-24">
        <LessonPageTemplate
          lesson={lesson}
          lessonSlug={DEMO_LESSON_SLUG}
          subjectName={subjectName}
          subjectSlug={DEMO_SUBJECT_SLUG}
          gradeLevel={DEMO_GRADE_LEVEL}
          judeImage={judeImage}
          currentLessonIndex={1}
          totalLessons={1}
          previousLesson={null}
          nextLesson={null}
          isFirstLesson={true}
          isDemoMode={true}
        />
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
    </>
  );
}
