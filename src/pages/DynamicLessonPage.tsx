import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LessonPageTemplate } from "@/components/LessonPageTemplate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserGrade, GRADE_LABELS } from "@/hooks/useUserGrade";
import { Lock } from "lucide-react";
import judeTeaching from "@/assets/eric-teaching.png";
const judeScientist = '/images/eric-scientist-300w.webp';
const judeBiologist = '/images/eric-biologist-300w.webp';
const judeComputer = '/images/eric-computer-300w.webp';
const judeMath = '/images/eric-math-300w.webp';
import type { SiblingLesson } from "@/features/matieres/types/lesson.types";
import { getRandomLoadingMessage } from "@/utils/loadingMessages";

/** 24-hour TTL for offline lesson cache */
const LESSON_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Build localStorage key for a specific lesson */
const getLessonCacheKey = (subjectSlug: string, lessonSlug: string) =>
  `lesson_cache_${subjectSlug}_${lessonSlug}`;

export default function DynamicLessonPage() {
  const { slug, lessonSlug } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Flag: serving cached content because network fetch failed
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // Navigation state
  const [currentLessonIndex, setCurrentLessonIndex] = useState(1);
  const [totalLessons, setTotalLessons] = useState(1);
  const [previousLesson, setPreviousLesson] = useState<SiblingLesson | null>(null);
  const [nextLesson, setNextLesson] = useState<SiblingLesson | null>(null);
  const [isFirstLesson, setIsFirstLesson] = useState(false);
  // Stable loading message — picked once at mount, stays consistent during load
  const [loadingMessage] = useState(() => getRandomLoadingMessage("lesson"));

  // User grade access
  const { userGrade, canAccessGrade, isLoading: gradeLoading, isAuthenticated } = useUserGrade();

  useEffect(() => {
    loadLessonData();
  }, [lessonSlug, slug]);

  const loadLessonData = async () => {
    try {
      setIsLoading(true);

      // Decode URL-encoded slugs
      const decodedSubjectSlug = slug ? decodeURIComponent(slug) : '';
      const decodedLessonSlug = lessonSlug ? decodeURIComponent(lessonSlug) : '';

      // Load subject using the slug
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('slug', decodedSubjectSlug)
        .maybeSingle();

      if (subjectError) throw subjectError;
      if (!subjectData) {
        console.warn('Subject not found:', decodedSubjectSlug);
        setIsLoading(false);
        return;
      }
      setSubject(subjectData);

      // Load ALL lessons for this subject to get navigation info
      const { data: allLessons, error: allLessonsError } = await supabase
        .from('lessons')
        .select('slug, title, order_index')
        .eq('subject_id', subjectData.id)
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (allLessonsError) throw allLessonsError;

      // Find current lesson index and siblings
      const currentIndex = allLessons?.findIndex(l => l.slug === decodedLessonSlug) ?? -1;
      
      if (allLessons && currentIndex !== -1) {
        setCurrentLessonIndex(currentIndex + 1);
        setTotalLessons(allLessons.length);
        
        // Check if this is the first lesson (audio enabled for first lessons only)
        setIsFirstLesson(currentIndex === 0);
        // Get previous lesson
        if (currentIndex > 0) {
          setPreviousLesson({
            slug: allLessons[currentIndex - 1].slug,
            title: allLessons[currentIndex - 1].title
          });
        } else {
          setPreviousLesson(null);
        }
        
        // Get next lesson
        if (currentIndex < allLessons.length - 1) {
          setNextLesson({
            slug: allLessons[currentIndex + 1].slug,
            title: allLessons[currentIndex + 1].title
          });
        } else {
          setNextLesson(null);
        }
      }

      // Load current lesson details
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('slug', decodedLessonSlug)
        .eq('subject_id', subjectData.id)
        .eq('is_published', true)
        .maybeSingle();

      if (lessonError) throw lessonError;
      if (!lessonData) {
        console.warn('Lesson not found:', {
          lessonSlug: decodedLessonSlug,
          subjectSlug: decodedSubjectSlug,
          subjectId: subjectData.id
        });
        setIsLoading(false);
        return;
      }

      // Transform lesson data to match expected format
      const transformedLesson = {
        id: lessonData.id,
        slug: lessonData.slug,
        title: lessonData.title,
        objectif: lessonData.objectif || '',
        introduction: lessonData.introduction || '',
        contenu: lessonData.contenu || '',
        exemples_exercices: lessonData.exemples_exercices || '',
        activites_interactives: lessonData.activites_interactives || '',
        quiz_final: lessonData.quiz_final || '',
        youtube_url: lessonData.youtube_url || null,
        grade_level: lessonData.grade_level,
        // Audio URLs for TTS playback
        audio_objectif_url: lessonData.audio_objectif_url || null,
        audio_introduction_url: lessonData.audio_introduction_url || null,
        audio_contenu_url: lessonData.audio_contenu_url || null,
        audio_exemples_url: lessonData.audio_exemples_url || null,
      };

      setLesson(transformedLesson);

      // Persist to localStorage for offline fallback (best-effort, ignore quota errors)
      try {
        const cacheKey = getLessonCacheKey(decodedSubjectSlug, decodedLessonSlug);
        localStorage.setItem(cacheKey, JSON.stringify({
          lesson: transformedLesson,
          subject: { name: subjectData.name, slug: subjectData.slug, grade_level: subjectData.grade_level },
          savedAt: Date.now(),
        }));
      } catch (cacheErr) {
        // localStorage full or unavailable — non-critical
        console.warn('Failed to cache lesson for offline use:', cacheErr);
      }
    } catch (error) {
      console.error('Error loading lesson:', error);

      // Offline fallback: try to serve from localStorage cache within 24h TTL
      try {
        const decodedSubjectSlug = slug ? decodeURIComponent(slug) : '';
        const decodedLessonSlug = lessonSlug ? decodeURIComponent(lessonSlug) : '';
        const cacheKey = getLessonCacheKey(decodedSubjectSlug, decodedLessonSlug);
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          const parsed = JSON.parse(cached);
          const age = Date.now() - (parsed.savedAt || 0);

          if (age < LESSON_CACHE_TTL_MS && parsed.lesson && parsed.subject) {
            setLesson(parsed.lesson);
            setSubject(parsed.subject);
            setIsOfflineMode(true);
            console.info('Serving lesson from offline cache (age:', Math.round(age / 60000), 'min)');
          }
        }
      } catch (cacheReadErr) {
        // Cache read failed — fall through to "lesson not found" UI
        console.warn('Offline cache read failed:', cacheReadErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || gradeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {/* Header skeleton — matches LessonPageTemplate header */}
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
          </div>
          {/* QuickStats skeleton — 4 stat blocks */}
          <div className="flex gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-12 flex-1 bg-muted rounded animate-pulse" />
            ))}
          </div>
          {/* Tabs skeleton — matches lesson tab bar */}
          <div className="flex gap-2 border-b pb-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-8 w-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
          {/* Content body skeleton — varying widths for realism */}
          <div className="space-y-3 pt-2">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className={`h-4 bg-muted rounded animate-pulse ${i % 3 === 0 ? 'w-2/3' : 'w-full'}`} />
            ))}
          </div>
          {/* Contextual loading message */}
          <p className="text-center text-sm text-muted-foreground pt-4">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Check grade access AFTER loading subject
  if (subject && isAuthenticated && !canAccessGrade(subject.grade_level)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Accès restreint</h2>
          <p className="text-muted-foreground mb-4">
            Cette leçon est pour le niveau <strong>{subject.grade_level}</strong>. 
            Votre compte est enregistré pour <strong>{userGrade ? GRADE_LABELS[userGrade] : 'un autre niveau'}</strong>.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Contactez le support si vous souhaitez changer de niveau.
          </p>
          <Button onClick={() => navigate('/matieres')}>
            Retour aux matières
          </Button>
        </Card>
      </div>
    );
  }

  if (!lesson || !subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Leçon non trouvée</h2>
          <button
            onClick={() => navigate('/matieres')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Retour aux matières
          </button>
        </div>
      </div>
    );
  }

  // Use appropriate Jude image based on subject
  const subjectLower = subject.name.toLowerCase();
  const judeImage = subjectLower.includes('mathématique')
    ? judeMath
    : subjectLower.includes('informatique')
    ? judeComputer
    : subjectLower.includes('chimie')
    ? judeScientist
    : subjectLower.includes('biologie') || subjectLower.includes('géologie')
    ? judeBiologist
    : judeTeaching;

  return (
    <LessonPageTemplate
      lesson={lesson}
      lessonSlug={lessonSlug || ''}
      subjectName={subject.name}
      subjectSlug={slug || ''}
      gradeLevel={subject.grade_level}
      judeImage={judeImage}
      currentLessonIndex={currentLessonIndex}
      totalLessons={totalLessons}
      previousLesson={previousLesson}
      nextLesson={nextLesson}
      isFirstLesson={isFirstLesson}
      isOfflineMode={isOfflineMode}
    />
  );
}
