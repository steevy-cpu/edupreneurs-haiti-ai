import { useQuery, QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BaseLesson, BaseSubject } from "@/utils/courseHelpers";
import { useSessionAuth } from "@/contexts/SessionAuthContext";

interface CourseData {
  subject: BaseSubject | null;
  lessons: BaseLesson[];
  completedLessons: string[];
}

async function fetchCourseData(subjectSlug: string, userId: string | null): Promise<CourseData> {
  // Load subject using the slug
  const { data: subjectData, error: subjectError } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', subjectSlug)
    .maybeSingle();

  if (subjectError) throw subjectError;

  // Check if subject was found
  if (!subjectData) {
    return { subject: null, lessons: [], completedLessons: [] };
  }

  // Parallel fetch: lessons and user completions
  const [lessonsResult, completionsResult] = await Promise.all([
    supabase
      .from('lessons')
      .select('*')
      .eq('subject_id', subjectData.id)
      .order('order_index'),
    userId
      ? supabase
          .from('lesson_completions')
          .select('lesson_slug')
          .eq('user_id', userId)
      : Promise.resolve({ data: [], error: null })
  ]);

  if (lessonsResult.error) throw lessonsResult.error;

  return {
    subject: subjectData as BaseSubject,
    lessons: (lessonsResult.data || []) as BaseLesson[],
    completedLessons: completionsResult.data?.map(c => c.lesson_slug) || []
  };
}

export function useCourseData(subjectSlug: string) {
  const { user } = useSessionAuth();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: ['course-data', subjectSlug, userId],
    queryFn: () => fetchCourseData(subjectSlug, userId),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    enabled: !!subjectSlug,
  });
}

export function prefetchCourseData(queryClient: QueryClient, subjectSlug: string, userId: string | null = null) {
  if (!subjectSlug) return;
  
  queryClient.prefetchQuery({
    queryKey: ['course-data', subjectSlug, userId],
    queryFn: () => fetchCourseData(subjectSlug, userId),
    staleTime: 5 * 60 * 1000,
  });
}
