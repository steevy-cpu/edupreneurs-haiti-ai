import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileAnalytics {
  totalLessonsCompleted: number;
  streak: number;
}

export const useProfileAnalytics = (userId: string | null) => {
  const [analytics, setAnalytics] = useState<ProfileAnalytics>({
    totalLessonsCompleted: 0,
    streak: 0,
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
      // Fetch lesson completions for this user
      const { data: completions, error } = await supabase
        .from("lesson_completions")
        .select("*")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Error fetching completions:", error);
        return;
      }

      // Calculate basic stats
      const totalLessonsCompleted = completions?.length || 0;
      const streak = calculateStreak(completions || []);

      setAnalytics({
        totalLessonsCompleted,
        streak,
      });
    } catch (error) {
      console.error("❌ Error loading profile analytics:", error);
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

  return { analytics, isLoading };
};
