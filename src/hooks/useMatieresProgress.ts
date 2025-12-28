import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubjectProgress {
  subjectSlug: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lastAccessedAt?: string;
}

export function useMatieresProgress(gradeLevel: string) {
  const [progressMap, setProgressMap] = useState<Record<string, SubjectProgress>>({});
  const [recentSubjects, setRecentSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch all subjects for the grade
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id, slug')
        .eq('grade_level', gradeLevel);

      if (!subjects) {
        setIsLoading(false);
        return;
      }

      // Fetch all published lessons for the grade
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, subject_id, slug')
        .eq('grade_level', gradeLevel)
        .eq('is_published', true);

      // Fetch user's completed lessons
      const { data: completions } = await supabase
        .from('lesson_completions')
        .select('lesson_slug, completed_at, subject')
        .eq('user_id', user.id);

      // Fetch user's study sessions for recent activity
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('subject_slug, started_at')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(10);

      // Calculate progress per subject
      const progressData: Record<string, SubjectProgress> = {};
      
      subjects.forEach(subject => {
        const subjectLessons = lessons?.filter(l => l.subject_id === subject.id) || [];
        const completedForSubject = completions?.filter(c => 
          subjectLessons.some(l => l.slug === c.lesson_slug)
        ) || [];

        const lastSession = sessions?.find(s => s.subject_slug === subject.slug);

        progressData[subject.slug] = {
          subjectSlug: subject.slug,
          totalLessons: subjectLessons.length,
          completedLessons: completedForSubject.length,
          progressPercent: subjectLessons.length > 0 
            ? Math.round((completedForSubject.length / subjectLessons.length) * 100)
            : 0,
          lastAccessedAt: lastSession?.started_at || completedForSubject[0]?.completed_at
        };
      });

      setProgressMap(progressData);

      // Get recent subjects from study sessions
      const recent = sessions
        ?.map(s => s.subject_slug)
        .filter((slug, index, arr) => arr.indexOf(slug) === index)
        .slice(0, 3) || [];
      
      setRecentSubjects(recent);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [gradeLevel]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const getProgress = useCallback((subjectSlug: string): SubjectProgress | null => {
    return progressMap[subjectSlug] || null;
  }, [progressMap]);

  return {
    progressMap,
    recentSubjects,
    isLoading,
    getProgress,
    refetch: fetchProgress
  };
}
