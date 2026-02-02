/**
 * ExamHub Data Queries
 * React Query hooks for exam data fetching
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Exam, ExamTrack, ExamSeries, SubjectInfo } from '../types/exam.types';
import { 
  BookOpen, 
  Calculator, 
  Beaker, 
  Globe, 
  Languages, 
  Flag, 
  MessageCircle,
  BookText,
  FlaskConical,
  DollarSign,
  Users,
  Palette,
  Music
} from 'lucide-react';

// Subject icons and colors
export const SUBJECT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Mathématiques": Calculator,
  "Français": BookOpen,
  "Sciences Expérimentales": Beaker,
  "Sciences Sociales": Globe,
  "Anglais": Languages,
  "Espagnol": Flag,
  "Créole": MessageCircle,
  "Physique": Beaker,
  "Chimie": FlaskConical,
  "SVT": FlaskConical,
  "Philosophie": BookText,
  "Sciences Économiques": DollarSign,
  "Sociologie": Users,
  "Littérature": BookOpen,
  "Histoire-Géographie": Globe,
  "Arts": Palette,
  "Musique": Music,
};

export const SUBJECT_COLORS: Record<string, string> = {
  "Mathématiques": "from-blue-500 to-blue-600",
  "Français": "from-purple-500 to-purple-600",
  "Sciences Expérimentales": "from-green-500 to-green-600",
  "Sciences Sociales": "from-amber-500 to-amber-600",
  "Anglais": "from-red-500 to-red-600",
  "Espagnol": "from-orange-500 to-orange-600",
  "Créole": "from-cyan-500 to-cyan-600",
  "Physique": "from-indigo-500 to-indigo-600",
  "Chimie": "from-pink-500 to-pink-600",
  "SVT": "from-emerald-500 to-emerald-600",
  "Philosophie": "from-amber-500 to-amber-600",
  "Sciences Économiques": "from-green-500 to-green-600",
  "Sociologie": "from-cyan-500 to-cyan-600",
  "Littérature": "from-violet-500 to-violet-600",
  "Histoire-Géographie": "from-teal-500 to-teal-600",
};

/**
 * Fetch all exams for a given track with optional series filter
 */
export function useExams(track: ExamTrack, series?: ExamSeries | null) {
  return useQuery({
    queryKey: ['exams', track, series],
    queryFn: async () => {
      let query = supabase
        .from('official_exams')
        .select('*')
        .eq('track', track)
        .order('year', { ascending: false })
        .order('subject');

      if (series) {
        query = query.eq('series', series);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get actual exercise counts
      const examsWithCounts = await Promise.all(
        (data || []).map(async (exam) => {
          const { count } = await supabase
            .from('exam_exercises')
            .select('*', { count: 'exact', head: true })
            .eq('exam_id', exam.id);

          return {
            ...exam,
            total_exercises: count || 0,
          } as Exam;
        })
      );

      return examsWithCounts;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch distinct subjects for a track/series with exam counts
 */
export function useExamSubjects(track: ExamTrack, series?: ExamSeries | null) {
  return useQuery({
    queryKey: ['exam-subjects', track, series],
    queryFn: async () => {
      let query = supabase
        .from('official_exams')
        .select('subject, subject_slug')
        .eq('track', track);

      if (series) {
        query = query.eq('series', series);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by subject and count
      const subjectMap = new Map<string, { slug: string; count: number }>();
      
      (data || []).forEach((exam) => {
        const existing = subjectMap.get(exam.subject);
        if (existing) {
          existing.count++;
        } else {
          subjectMap.set(exam.subject, {
            slug: exam.subject_slug || exam.subject.toLowerCase().replace(/\s+/g, '-'),
            count: 1,
          });
        }
      });

      const subjects: SubjectInfo[] = Array.from(subjectMap.entries()).map(([name, info]) => ({
        name,
        slug: info.slug,
        count: info.count,
        icon: SUBJECT_ICONS[name] || BookOpen,
        color: SUBJECT_COLORS[name] || 'from-gray-500 to-gray-600',
      }));

      return subjects.sort((a, b) => a.name.localeCompare(b.name));
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch exams for a specific subject
 */
export function useExamsBySubject(
  track: ExamTrack,
  subject: string,
  series?: ExamSeries | null
) {
  return useQuery({
    queryKey: ['exams-by-subject', track, series, subject],
    queryFn: async () => {
      let query = supabase
        .from('official_exams')
        .select('*')
        .eq('track', track)
        .eq('subject', subject)
        .order('year', { ascending: false });

      if (series) {
        query = query.eq('series', series);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get actual exercise counts
      const examsWithCounts = await Promise.all(
        (data || []).map(async (exam) => {
          const { count } = await supabase
            .from('exam_exercises')
            .select('*', { count: 'exact', head: true })
            .eq('exam_id', exam.id);

          return {
            ...exam,
            total_exercises: count || 0,
          } as Exam;
        })
      );

      return examsWithCounts;
    },
    enabled: !!subject,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch a single exam by ID
 */
export function useExam(examId: string) {
  return useQuery({
    queryKey: ['exam', examId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('official_exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (error) throw error;
      return data as Exam;
    },
    enabled: !!examId,
  });
}

/**
 * Get exam statistics for hub display
 */
export function useExamStats(track: ExamTrack) {
  return useQuery({
    queryKey: ['exam-stats', track],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('official_exams')
        .select('year, series', { count: 'exact' })
        .eq('track', track);

      if (error) throw error;

      const years = [...new Set((data || []).map(e => e.year))].sort();
      const seriesSet = [...new Set((data || []).filter(e => e.series).map(e => e.series))];

      return {
        totalExams: count || 0,
        yearRange: years.length > 0 ? `${Math.min(...years)}-${Math.max(...years)}` : 'N/A',
        seriesCount: seriesSet.length,
        uniqueSeries: seriesSet,
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}
