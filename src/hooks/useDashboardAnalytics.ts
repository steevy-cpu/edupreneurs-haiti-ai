import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, startOfMonth, subDays, format } from "date-fns";

interface AnalyticsData {
  totalLessonsCompleted: number;
  averageScore: number;
  weeklyLessons: number;
  monthlyLessons: number;
  studyTimeThisWeek: number;
  studyTimeThisMonth: number;
  streak: number;
  weeklyActivity: { day: string; lessons: number }[];
  subjectProgress: { subject: string; progress: number; lessonsCompleted: number; totalLessons: number }[];
  recentActivity: any[];
  achievements: any[];
  weeklyGoal: { target: number; current: number };
}

export const useDashboardAnalytics = (userId: string | null) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalLessonsCompleted: 0,
    averageScore: 0,
    weeklyLessons: 0,
    monthlyLessons: 0,
    studyTimeThisWeek: 0,
    studyTimeThisMonth: 0,
    streak: 0,
    weeklyActivity: [],
    subjectProgress: [],
    recentActivity: [],
    achievements: [],
    weeklyGoal: { target: 10, current: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    if (!userId) return;

    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);

      // Fetch lesson completions
      const { data: completions } = await supabase
        .from("lesson_completions")
        .select("*")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });

      // Calculate basic stats
      const totalLessonsCompleted = completions?.length || 0;
      const averageScore = completions?.length
        ? completions.reduce((sum, c) => sum + (c.score || 0), 0) / completions.length
        : 0;

      // Weekly and monthly lessons
      const weeklyLessons = completions?.filter(
        (c) => new Date(c.completed_at) >= weekStart && new Date(c.completed_at) <= weekEnd
      ).length || 0;

      const monthlyLessons = completions?.filter(
        (c) => new Date(c.completed_at) >= monthStart
      ).length || 0;

      // Calculate streak
      const streak = calculateStreak(completions || []);

      // Weekly activity chart data
      const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
        const day = subDays(now, 6 - i);
        const dayStart = new Date(day.setHours(0, 0, 0, 0));
        const dayEnd = new Date(day.setHours(23, 59, 59, 999));
        
        const lessonsOnDay = completions?.filter((c) => {
          const completedAt = new Date(c.completed_at);
          return completedAt >= dayStart && completedAt <= dayEnd;
        }).length || 0;

        return {
          day: format(day, "EEE"),
          lessons: lessonsOnDay,
        };
      });

      // Subject progress
      const { data: subjects } = await supabase
        .from("subjects")
        .select("name, slug, lesson_count");

      const subjectProgress = subjects?.map((subject) => {
        const lessonsCompleted = completions?.filter(
          (c) => c.subject === subject.slug
        ).length || 0;
        const totalLessons = subject.lesson_count || 1;
        const progress = (lessonsCompleted / totalLessons) * 100;

        return {
          subject: subject.name,
          progress: Math.round(progress),
          lessonsCompleted,
          totalLessons,
        };
      }).slice(0, 6) || [];

      // Study time (mock data for now)
      const { data: studySessions } = await supabase
        .from("study_sessions")
        .select("duration_minutes, started_at")
        .eq("user_id", userId);

      const studyTimeThisWeek = studySessions?.filter(
        (s) => new Date(s.started_at) >= weekStart
      ).reduce((sum, s) => sum + s.duration_minutes, 0) || 0;

      const studyTimeThisMonth = studySessions?.filter(
        (s) => new Date(s.started_at) >= monthStart
      ).reduce((sum, s) => sum + s.duration_minutes, 0) || 0;

      // Achievements
      const { data: achievements } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId)
        .order("earned_at", { ascending: false })
        .limit(5);

      // Weekly goal
      const { data: goals } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", userId)
        .eq("goal_type", "weekly_lessons")
        .gte("end_date", now.toISOString())
        .limit(1)
        .single();

      const weeklyGoal = {
        target: goals?.target_value || 10,
        current: goals?.current_value || weeklyLessons,
      };

      setAnalytics({
        totalLessonsCompleted,
        averageScore: Math.round(averageScore),
        weeklyLessons,
        monthlyLessons,
        studyTimeThisWeek,
        studyTimeThisMonth,
        streak,
        weeklyActivity,
        subjectProgress,
        recentActivity: completions?.slice(0, 10) || [],
        achievements: achievements || [],
        weeklyGoal,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStreak = (completions: any[]) => {
    if (!completions || completions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const sortedCompletions = [...completions].sort(
      (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );

    for (let i = 0; i < sortedCompletions.length; i++) {
      const completionDate = new Date(sortedCompletions[i].completed_at);
      completionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  };

  return { analytics, isLoading, reloadAnalytics: loadAnalytics };
};
