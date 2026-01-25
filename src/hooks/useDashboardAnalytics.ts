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

  // Defer analytics loading to prioritize initial render
  // Analytics is non-critical and can load 2 seconds after user sees the dashboard
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Defer analytics to reduce initial load contention
    const deferTimer = setTimeout(() => {
      loadAnalytics();
    }, 2000);

    return () => clearTimeout(deferTimer);
  }, [userId]);

  const loadAnalytics = async () => {
    if (!userId) return;

    try {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);

      // Fetch lesson completions
      const { data: completions, error: completionsError } = await supabase
        .from("lesson_completions")
        .select("*")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });

      if (completionsError) {
        // Silent fail - continue with empty completions
      }

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

      // Get user's academic grade level to filter subjects
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("academic_grade")
        .eq("user_id", userId)
        .maybeSingle();

      const userGradeLevel = userProfile?.academic_grade || "7AF";

      // Subject progress - filter by user's grade level
      const { data: subjects } = await supabase
        .from("subjects")
        .select("name, slug, lesson_count, grade_level")
        .eq("grade_level", userGradeLevel)
        .order("name", { ascending: true });

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
      }).filter(s => s.totalLessons > 0) // Only show subjects with lessons
        .slice(0, 6) || [];

      // Study time - estimate based on lesson completions if no study sessions
      const { data: studySessions } = await supabase
        .from("study_sessions")
        .select("duration_minutes, started_at")
        .eq("user_id", userId);

      let studyTimeThisWeek = 0;
      let studyTimeThisMonth = 0;

      if (studySessions && studySessions.length > 0) {
        studyTimeThisWeek = studySessions.filter(
          (s) => new Date(s.started_at) >= weekStart
        ).reduce((sum, s) => sum + s.duration_minutes, 0);

        studyTimeThisMonth = studySessions.filter(
          (s) => new Date(s.started_at) >= monthStart
        ).reduce((sum, s) => sum + s.duration_minutes, 0);
      } else {
        // Estimate: average 15 minutes per lesson
        studyTimeThisWeek = weeklyLessons * 15;
        studyTimeThisMonth = monthlyLessons * 15;
      }

      // Achievements
      const { data: achievements } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId)
        .order("earned_at", { ascending: false })
        .limit(5);

      // Weekly goal - create default if doesn't exist
      const { data: goals } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", userId)
        .eq("goal_type", "weekly_lessons")
        .gte("end_date", now.toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // If no active goal, create a default one
      if (!goals) {
        const nextWeek = new Date(weekEnd);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        await supabase
          .from("user_goals")
          .insert({
            user_id: userId,
            goal_type: "weekly_lessons",
            target_value: 10,
            current_value: weeklyLessons,
            start_date: weekStart.toISOString(),
            end_date: nextWeek.toISOString(),
          });
      }

      const weeklyGoal = {
        target: goals?.target_value || 10,
        current: weeklyLessons, // Always use actual weekly lessons as current value
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
      // Silent fail - show default state on error
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
