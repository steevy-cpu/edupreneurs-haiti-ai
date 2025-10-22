import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CachedLesson {
  id: string;
  title: string;
  slug: string;
  subject_id: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  grade_level: string;
  is_published: boolean;
  order_index: number;
}

interface CachedSubject {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  color: string;
  grade_level: string;
  lesson_count: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const lessonCache = new Map<string, { data: CachedLesson; timestamp: number }>();
const subjectCache = new Map<string, { data: CachedSubject; timestamp: number }>();
const lessonsListCache = new Map<string, { data: CachedLesson[]; timestamp: number }>();

export const useLessonsCache = (subjectSlug?: string) => {
  const [lessons, setLessons] = useState<CachedLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subjectSlug) {
      setIsLoading(false);
      return;
    }

    const fetchLessons = async () => {
      const cacheKey = `lessons-${subjectSlug}`;
      const cached = lessonsListCache.get(cacheKey);

      // Check cache first
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setLessons(cached.data);
        setIsLoading(false);
        return;
      }

      try {
        // Get subject first
        const { data: subject, error: subjectError } = await supabase
          .from('subjects')
          .select('id')
          .eq('slug', subjectSlug)
          .maybeSingle();

        if (subjectError) throw subjectError;
        if (!subject) {
          setError("Subject not found");
          setIsLoading(false);
          return;
        }

        // Get lessons
        const { data, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('subject_id', subject.id)
          .eq('is_published', true)
          .order('order_index');

        if (lessonsError) throw lessonsError;

        const lessonData = data || [];
        lessonsListCache.set(cacheKey, { data: lessonData, timestamp: Date.now() });
        setLessons(lessonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lessons');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, [subjectSlug]);

  return { lessons, isLoading, error };
};

export const useLesson = (subjectSlug: string, lessonSlug: string) => {
  const [lesson, setLesson] = useState<CachedLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      const cacheKey = `${subjectSlug}-${lessonSlug}`;
      const cached = lessonCache.get(cacheKey);

      // Check cache first
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setLesson(cached.data);
        setIsLoading(false);
        return;
      }

      try {
        // Get subject first
        const { data: subject, error: subjectError } = await supabase
          .from('subjects')
          .select('id')
          .eq('slug', subjectSlug)
          .maybeSingle();

        if (subjectError) throw subjectError;
        if (!subject) {
          setError("Subject not found");
          setIsLoading(false);
          return;
        }

        // Get lesson
        const { data, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('subject_id', subject.id)
          .eq('slug', lessonSlug)
          .eq('is_published', true)
          .maybeSingle();

        if (lessonError) throw lessonError;
        if (!data) {
          setError("Lesson not found");
          setIsLoading(false);
          return;
        }

        lessonCache.set(cacheKey, { data, timestamp: Date.now() });
        setLesson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lesson');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [subjectSlug, lessonSlug]);

  return { lesson, isLoading, error };
};

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<CachedSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      const cacheKey = 'all-subjects';
      const cached = lessonsListCache.get(cacheKey);

      // Check cache first
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setSubjects(cached.data as any);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .order('name');

        if (subjectsError) throw subjectsError;

        const subjectData = data || [];
        lessonsListCache.set(cacheKey, { data: subjectData as any, timestamp: Date.now() });
        setSubjects(subjectData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  return { subjects, isLoading, error };
};

// Clear cache manually if needed
export const clearLessonsCache = () => {
  lessonCache.clear();
  subjectCache.clear();
  lessonsListCache.clear();
};
