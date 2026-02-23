import { Suspense, lazy } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, BookOpen, Award, Target } from "lucide-react";
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
  const kpiItems = [
    {
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      value: profileLoading ? null : gold,
      label: "Gold",
    },
    {
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      value: analytics.totalLessonsCompleted,
      label: "Leçons",
      sub: `+${analytics.weeklyLessons}`,
    },
    {
      icon: Award,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      value: `${analytics.averageScore}%`,
      label: "Score",
    },
    {
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      value: `${Math.round(analytics.studyTimeThisWeek / 60)}h`,
      label: "Étude",
      sub: "Estimation",
      subColor: "text-muted-foreground/60 italic",
    },
  ];

  return (
    <>
      {/* Compact KPI Strip */}
      <Card data-tour="kpi-cards" className="border-none rounded-xl shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {kpiItems.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="flex flex-col items-center text-center">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${kpi.bgColor} flex items-center justify-center mb-1`}>
                    <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${kpi.color}`} />
                  </div>
                  <span className="text-base sm:text-lg font-bold text-foreground leading-tight">
                    {kpi.value === null ? <Skeleton className="h-5 w-8 mx-auto" /> : kpi.value}
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">{kpi.label}</span>
                  {kpi.sub && (
                    <span className={`text-[9px] sm:text-[10px] ${kpi.subColor || 'text-green-600 font-medium'}`}>{kpi.sub}</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary line */}
      {!analyticsLoading && analytics.weeklyLessons > 0 && (
        <p className="text-sm text-muted-foreground px-1">
          Tu as complété <span className="font-semibold text-foreground">{analytics.weeklyLessons} leçon{analytics.weeklyLessons > 1 ? 's' : ''}</span> cette semaine 🎯
        </p>
      )}

      {/* Charts */}
      <div data-tour="charts-section" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {analyticsLoading ? (
          <>
            <ChartSkeleton height={220} />
            <ChartSkeleton height={220} />
          </>
        ) : (
          <>
            <Suspense fallback={<ChartSkeleton height={220} />}>
              <ChartErrorBoundary fallbackHeight={220}>
                <WeeklyActivityChart data={analytics.weeklyActivity} />
              </ChartErrorBoundary>
            </Suspense>
            <Suspense fallback={<ChartSkeleton height={220} />}>
              <ChartErrorBoundary fallbackHeight={220}>
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
      <Suspense fallback={<Skeleton className="h-28 w-full rounded-xl" />}>
        <AchievementsBadges achievements={[]} totalLessons={totalLessonsCompleted} />
      </Suspense>
    </>
  );
};
