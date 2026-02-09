import { Suspense, lazy } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, BookOpen, Award, Target } from "lucide-react";
import { useNetworkAwareAnimations } from "@/hooks/useNetworkAwareAnimations";
import { ChartErrorBoundary } from "@/components/dashboard/ChartErrorBoundary";
import { ChartSkeleton, AnalyticsWidgetSkeleton } from "@/components/shared/SkeletonLoaders";

const WeeklyActivityChart = lazy(() =>
  import("@/components/dashboard/WeeklyActivityChart").then(m => ({ default: m.WeeklyActivityChart }))
);
const SubjectProgressChart = lazy(() =>
  import("@/components/dashboard/SubjectProgressChart").then(m => ({ default: m.SubjectProgressChart }))
);
const LearningInsightsPanel = lazy(() =>
  import("@/components/dashboard/LearningInsightsPanel").then(m => ({ default: m.LearningInsightsPanel }))
);
const AchievementsBadges = lazy(() =>
  import("@/components/dashboard/AchievementsBadges").then(m => ({ default: m.AchievementsBadges }))
);

export interface ProgressTabProps {
  profileLoading: boolean;
  gold: number;
  analytics: {
    totalLessonsCompleted: number;
    weeklyLessons: number;
    averageScore: number;
    studyTimeThisWeek: number;
    weeklyActivity: { day: string; lessons: number }[];
    subjectProgress: { subject: string; progress: number; lessonsCompleted: number; totalLessons: number }[];
  };
  analyticsLoading: boolean;
  totalLessonsCompleted: number;
  // Pass full analytics for insights panel
  fullAnalytics: any;
}

export const ProgressTab = ({
  profileLoading,
  gold,
  analytics,
  analyticsLoading,
  totalLessonsCompleted,
  fullAnalytics,
}: ProgressTabProps) => {
  const { shouldAnimate } = useNetworkAwareAnimations();

  const kpiCards = [
    {
      icon: Trophy,
      gradient: "from-yellow-400 to-orange-500",
      textGradient: "from-yellow-500 to-orange-600",
      value: profileLoading ? null : gold,
      label: "Golds gagnés",
      sub: "Total cumulé",
    },
    {
      icon: BookOpen,
      gradient: "from-blue-400 to-blue-600",
      textGradient: "from-blue-500 to-blue-700",
      value: analytics.totalLessonsCompleted,
      label: "Leçons",
      sub: `+${analytics.weeklyLessons} cette semaine`,
    },
    {
      icon: Award,
      gradient: "from-green-400 to-green-600",
      textGradient: "from-green-500 to-green-700",
      value: `${analytics.averageScore}%`,
      label: "Score moyen",
      sub: "Continue! 💪",
    },
    {
      icon: Target,
      gradient: "from-purple-400 to-purple-600",
      textGradient: "from-purple-500 to-purple-700",
      value: `${Math.round(analytics.studyTimeThisWeek / 60)}h`,
      label: "Temps d'étude",
      sub: "Cette semaine",
    },
  ];

  return (
    <>
      {/* KPI Cards */}
      <div data-tour="kpi-cards" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className={`border-none rounded-xl shadow-md tap-highlight-none ${shouldAnimate ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : ''}`}>
              <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center text-white mx-auto mb-2 sm:mb-3`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className={`text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-br ${kpi.textGradient} bg-clip-text text-transparent mb-1`}>
                  {kpi.value === null ? <Skeleton className="h-6 sm:h-8 w-10 sm:w-12 mx-auto" /> : kpi.value}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-0.5 sm:mb-1">{kpi.label}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{kpi.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div data-tour="charts-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analyticsLoading ? (
          <>
            <ChartSkeleton height={250} />
            <ChartSkeleton height={250} />
          </>
        ) : (
          <>
            <Suspense fallback={<ChartSkeleton height={250} />}>
              <ChartErrorBoundary fallbackHeight={250}>
                <WeeklyActivityChart data={analytics.weeklyActivity} />
              </ChartErrorBoundary>
            </Suspense>
            <Suspense fallback={<ChartSkeleton height={250} />}>
              <ChartErrorBoundary fallbackHeight={250}>
                <SubjectProgressChart data={analytics.subjectProgress} />
              </ChartErrorBoundary>
            </Suspense>
          </>
        )}
      </div>

      {/* Insights */}
      <Suspense fallback={<AnalyticsWidgetSkeleton />}>
        <LearningInsightsPanel analytics={fullAnalytics} />
      </Suspense>

      {/* Achievements */}
      <Suspense fallback={<Skeleton className="h-32 w-full rounded-xl" />}>
        <AchievementsBadges achievements={[]} totalLessons={totalLessonsCompleted} />
      </Suspense>
    </>
  );
};
