import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Flame, 
  Trophy, 
  Target,
  BookOpen,
  Star,
  TrendingUp,
  Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserStatsWidgetProps {
  gradeLevel: string;
}

interface UserStats {
  totalLessonsCompleted: number;
  totalSubjectsStarted: number;
  currentStreak: number;
  totalStudyMinutes: number;
  achievements: number;
  weeklyProgress: number;
}

export function UserStatsWidget({ gradeLevel }: UserStatsWidgetProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // Fetch lesson completions
        const { data: completions } = await supabase
          .from('lesson_completions')
          .select('*')
          .eq('user_id', user.id);

        // Fetch study sessions from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('duration_minutes, subject_slug, started_at')
          .eq('user_id', user.id)
          .gte('started_at', weekAgo.toISOString());

        // Fetch achievements
        const { count: achievementsCount } = await supabase
          .from('achievements')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Calculate stats
        const uniqueSubjects = new Set(completions?.map(c => c.subject) || []);
        const totalMinutes = sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0;

        // Calculate streak (simplified - consecutive days with activity)
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const todayActivity = sessions?.some(s => new Date(s.started_at).toDateString() === today);
        const yesterdayActivity = sessions?.some(s => new Date(s.started_at).toDateString() === yesterday);
        const streak = todayActivity ? (yesterdayActivity ? 2 : 1) : 0;

        // Weekly goal progress (assume goal is 5 lessons per week)
        const weeklyLessons = completions?.filter(c => {
          const completedDate = new Date(c.completed_at);
          return completedDate >= weekAgo;
        }).length || 0;
        const weeklyProgress = Math.min(Math.round((weeklyLessons / 5) * 100), 100);

        setStats({
          totalLessonsCompleted: completions?.length || 0,
          totalSubjectsStarted: uniqueSubjects.size,
          currentStreak: streak,
          totalStudyMinutes: totalMinutes,
          achievements: achievementsCount || 0,
          weeklyProgress
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [gradeLevel]);

  if (isLoading || !isAuthenticated || !stats) {
    return null;
  }

  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 border-primary/10">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Trophy className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-sm">Votre progression</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Streak */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
          <div className="p-1.5 rounded-full bg-orange-500/10">
            <Flame className={`w-4 h-4 ${stats.currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="text-lg font-bold">{stats.currentStreak}</p>
            <p className="text-[10px] text-muted-foreground">Jours consécutifs</p>
          </div>
        </div>

        {/* Lessons completed */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
          <div className="p-1.5 rounded-full bg-green-500/10">
            <BookOpen className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{stats.totalLessonsCompleted}</p>
            <p className="text-[10px] text-muted-foreground">Leçons terminées</p>
          </div>
        </div>

        {/* Subjects started */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
          <div className="p-1.5 rounded-full bg-blue-500/10">
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{stats.totalSubjectsStarted}</p>
            <p className="text-[10px] text-muted-foreground">Matières actives</p>
          </div>
        </div>

        {/* Study time */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
          <div className="p-1.5 rounded-full bg-purple-500/10">
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{Math.round(stats.totalStudyMinutes / 60)}h</p>
            <p className="text-[10px] text-muted-foreground">Cette semaine</p>
          </div>
        </div>

        {/* Achievements */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
          <div className="p-1.5 rounded-full bg-amber-500/10">
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-lg font-bold">{stats.achievements}</p>
            <p className="text-[10px] text-muted-foreground">Badges gagnés</p>
          </div>
        </div>

        {/* Weekly goal */}
        <div className="p-2 rounded-lg bg-background/50">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-muted-foreground">Objectif semaine</span>
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {stats.weeklyProgress}%
            </Badge>
          </div>
          <Progress value={stats.weeklyProgress} className="h-1.5" />
        </div>
      </div>
    </Card>
  );
}
