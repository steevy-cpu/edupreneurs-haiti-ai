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

interface UserStats {
  totalLessonsCompleted: number;
  totalSubjectsStarted: number;
  currentStreak: number;
  totalStudyMinutes: number;
  achievements: number;
  weeklyProgress: number;
}

interface UserStatsWidgetProps {
  gradeLevel: string;
  stats?: UserStats | null;
  isLoading?: boolean;
  isAuthenticated?: boolean;
}

export function UserStatsWidget({ gradeLevel, stats, isLoading = false, isAuthenticated = false }: UserStatsWidgetProps) {
  // Don't render if loading, not authenticated, or no stats
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
