import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SubjectProgress {
  subjectSlug: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lastAccessedAt?: string;
}

interface UserStats {
  totalLessonsCompleted: number;
  totalSubjectsStarted: number;
  currentStreak: number;
  totalStudyMinutes: number;
  achievements: number;
  weeklyProgress: number;
}

interface MatieresData {
  // User info
  userId: string | null;
  isAuthenticated: boolean;
  userGrade: string | null;
  isSuperUser: boolean;
  
  // Subjects
  subjects: any[];
  isLoadingSubjects: boolean;
  
  // Counts
  lessonCounts: Record<string, number>;
  exerciseCounts: Record<string, number>;
  isLoadingCounts: boolean;
  
  // Progress
  progressMap: Record<string, SubjectProgress>;
  recentSubjects: string[];
  isLoadingProgress: boolean;
  
  // Favorites
  favorites: string[];
  toggleFavorite: (slug: string) => Promise<void>;
  isFavorite: (slug: string) => boolean;
  
  // User stats
  userStats: UserStats | null;
  isLoadingStats: boolean;
  
  // Exam counts
  officialExamCount: number;
  baccExamCount: number;
  
  // Utilities
  canAccessGrade: (gradeId: string) => boolean;
  getProgress: (slug: string) => SubjectProgress | null;
  refetch: () => void;
}

const FAVORITES_KEY = 'matieres_favorites';

// Super users who can access ALL grades (same as useUserGrade.ts)
const SUPER_USER_IDS = [
  '0de08330-4183-48f9-b169-19b92f4d114f', // Steevy
  '7580cd10-e18c-4b2f-ac50-def28d046c9d', // Djood
];

// Fetch all matieres data in parallel
async function fetchAllMatieresData(gradeLevel: string, series: string | null) {
  // Get user first - single auth call
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || null;
  
  // Parallel fetch all data
  const [
    subjectsResult,
    profileResult,
    lessonsResult,
    allLessonsResult,
    officialExamsResult,
    baccExamsResult,
    userDataResult
  ] = await Promise.all([
    // Subjects for grade
    supabase.from('subjects').select('*').eq('grade_level', gradeLevel),
    
    // User profile (for grade info)
    userId ? supabase.from('profiles').select('academic_grade').eq('user_id', userId).single() : null,
    
    // Lessons for grade (for counts) - using precomputed counts for performance
    supabase.from('lessons')
      .select('subject_id, id, activities_count, quiz_count')
      .eq('grade_level', gradeLevel)
      .eq('is_published', true),
    
    // All lessons with slug (for progress matching)
    supabase.from('lessons')
      .select('id, subject_id, slug')
      .eq('grade_level', gradeLevel)
      .eq('is_published', true),
    
    // Official exam count for 9AF
    supabase.from('official_exams').select('*', { count: 'exact', head: true }).eq('grade_level', '9AF'),
    
    // Bacc exam count
    (() => {
      let query = supabase.from('official_exams').select('*', { count: 'exact', head: true }).eq('grade_level', 'NS4');
      if (series) query = query.eq('series', series);
      return query;
    })(),
    
    // User-specific data (completions, sessions, favorites, achievements) - only if authenticated
    userId ? Promise.all([
      supabase.from('lesson_completions').select('lesson_slug, completed_at, subject').eq('user_id', userId),
      supabase.from('study_sessions').select('subject_slug, started_at, duration_minutes').eq('user_id', userId).order('started_at', { ascending: false }).limit(50),
      supabase.from('user_favorites').select('subject_slug').eq('user_id', userId),
      supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    ]) : null
  ]);

  return {
    user,
    userId,
    subjects: subjectsResult.data || [],
    profile: profileResult?.data,
    lessons: lessonsResult.data || [],
    allLessons: allLessonsResult.data || [],
    officialExamCount: officialExamsResult.count || 0,
    baccExamCount: baccExamsResult.count || 0,
    userData: userDataResult ? {
      completions: userDataResult[0].data || [],
      sessions: userDataResult[1].data || [],
      favorites: userDataResult[2].data?.map(f => f.subject_slug) || [],
      achievementsCount: userDataResult[3].count || 0
    } : null
  };
}

export function useMatieresData(gradeLevel: string, series: string | null = null): MatieresData {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Main query - fetches all data in parallel
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['matieres-data', gradeLevel, series],
    queryFn: () => fetchAllMatieresData(gradeLevel, series),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Sync favorites from server when data loads
  useEffect(() => {
    if (data?.userData?.favorites) {
      setFavorites(data.userData.favorites);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(data.userData.favorites));
    }
  }, [data?.userData?.favorites]);

  // Calculate lesson/exercise counts with memoization - using precomputed counts
  const { lessonCounts, exerciseCounts } = useMemo(() => {
    const lessonCountsMap: Record<string, number> = {};
    const exerciseCountsMap: Record<string, number> = {};
    
    if (!data?.lessons || !data?.subjects) return { lessonCounts: lessonCountsMap, exerciseCounts: exerciseCountsMap };
    
    data.lessons.forEach(lesson => {
      const subject = data.subjects.find(s => s.id === lesson.subject_id);
      if (subject) {
        lessonCountsMap[subject.slug] = (lessonCountsMap[subject.slug] || 0) + 1;
        
        // Use precomputed counts from database - no parsing needed!
        const activitiesCount = (lesson as any).activities_count || 0;
        const quizCount = (lesson as any).quiz_count || 0;
        exerciseCountsMap[subject.slug] = (exerciseCountsMap[subject.slug] || 0) + activitiesCount + quizCount;
      }
    });
    
    return { lessonCounts: lessonCountsMap, exerciseCounts: exerciseCountsMap };
  }, [data?.lessons, data?.subjects]);

  // Calculate progress map
  const { progressMap, recentSubjects } = useMemo(() => {
    const progressData: Record<string, SubjectProgress> = {};
    const recent: string[] = [];
    
    if (!data?.subjects || !data?.userData) {
      return { progressMap: progressData, recentSubjects: recent };
    }
    
    const { completions, sessions } = data.userData;
    
    data.subjects.forEach(subject => {
      const subjectLessons = (data.allLessons || []).filter(l => l.subject_id === subject.id);
      const completedForSubject = completions.filter(c => 
        subjectLessons.some(l => l.slug === c.lesson_slug)
      );
      
      const lastSession = sessions.find(s => s.subject_slug === subject.slug);
      
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
    
    // Get recent subjects
    const recentSlugs = sessions
      .map(s => s.subject_slug)
      .filter((slug, index, arr) => arr.indexOf(slug) === index)
      .slice(0, 3);
    
    return { progressMap: progressData, recentSubjects: recentSlugs };
  }, [data?.subjects, data?.lessons, data?.userData]);

  // Calculate user stats
  const userStats = useMemo((): UserStats | null => {
    if (!data?.userData) return null;
    
    const { completions, sessions, achievementsCount } = data.userData;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentSessions = sessions.filter(s => new Date(s.started_at) >= weekAgo);
    const uniqueSubjects = new Set(completions.map(c => c.subject));
    const totalMinutes = recentSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    
    // Calculate streak
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const todayActivity = recentSessions.some(s => new Date(s.started_at).toDateString() === today);
    const yesterdayActivity = recentSessions.some(s => new Date(s.started_at).toDateString() === yesterday);
    const streak = todayActivity ? (yesterdayActivity ? 2 : 1) : 0;
    
    // Weekly progress
    const weeklyLessons = completions.filter(c => new Date(c.completed_at) >= weekAgo).length;
    const weeklyProgress = Math.min(Math.round((weeklyLessons / 5) * 100), 100);
    
    return {
      totalLessonsCompleted: completions.length,
      totalSubjectsStarted: uniqueSubjects.size,
      currentStreak: streak,
      totalStudyMinutes: totalMinutes,
      achievements: achievementsCount,
      weeklyProgress
    };
  }, [data?.userData]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (subjectSlug: string) => {
    const newFavorites = favorites.includes(subjectSlug)
      ? favorites.filter(f => f !== subjectSlug)
      : [...favorites, subjectSlug];
    
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    
    if (data?.userId) {
      if (favorites.includes(subjectSlug)) {
        await supabase.from('user_favorites').delete()
          .eq('user_id', data.userId)
          .eq('subject_slug', subjectSlug);
      } else {
        await supabase.from('user_favorites')
          .insert({ user_id: data.userId, subject_slug: subjectSlug });
      }
    }
  }, [favorites, data?.userId]);

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  const userGrade = data?.profile?.academic_grade || null;
  const isSuperUser = data?.userId ? SUPER_USER_IDS.includes(data.userId) : false;

  const canAccessGrade = useCallback((gradeId: string) => {
    // Super users can access all grades
    if (isSuperUser) return true;
    
    // Non-academic users (UNIV, NONE) cannot access any grade-specific content
    const NON_ACADEMIC = ['UNIV', 'NONE'];
    if (userGrade && NON_ACADEMIC.includes(userGrade)) return false;
    
    // Normalize grades for comparison
    const normalizeGradeLocal = (g: string) => {
      const map: Record<string, string> = { 
        '7e': '7AF', '8e': '8AF', '9e': '9AF', 
        'S1': 'NS1', 'S2': 'NS2', 'Rheto': 'NS3', 'Philo': 'NS4' 
      };
      return map[g] || g;
    };
    
    // User can only access their registered grade
    if (!userGrade) return false;
    return normalizeGradeLocal(userGrade) === normalizeGradeLocal(gradeId);
  }, [isSuperUser, userGrade]);

  const getProgress = useCallback((slug: string) => progressMap[slug] || null, [progressMap]);

  return {
    userId: data?.userId || null,
    isAuthenticated: !!data?.userId,
    userGrade,
    isSuperUser,
    
    subjects: data?.subjects || [],
    isLoadingSubjects: isLoading,
    
    lessonCounts,
    exerciseCounts,
    isLoadingCounts: isLoading,
    
    progressMap,
    recentSubjects,
    isLoadingProgress: isLoading,
    
    favorites,
    toggleFavorite,
    isFavorite,
    
    userStats,
    isLoadingStats: isLoading,
    
    officialExamCount: data?.officialExamCount || 0,
    baccExamCount: data?.baccExamCount || 0,
    
    canAccessGrade,
    getProgress,
    refetch: () => refetch()
  };
}

// Note: countActivitiesSimple and countQuizSimple functions removed
// Counts are now precomputed in the database via activities_count and quiz_count columns
// This reduces data transfer from ~17 MB to ~100 KB for NS3/NS4 grades
