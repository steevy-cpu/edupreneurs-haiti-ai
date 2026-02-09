import { ReactNode, Suspense, lazy } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Edit3, Sparkles, X } from "lucide-react";
import { useNetworkAwareAnimations } from "@/hooks/useNetworkAwareAnimations";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ErrorState } from "@/components/shared/ErrorState";
import { AnalyticsWidgetSkeleton } from "@/components/shared/SkeletonLoaders";
import { WeeklyGoalWidget } from "@/components/dashboard/WeeklyGoalWidget";

const LearningStreakWidget = lazy(() =>
  import("@/components/dashboard/LearningStreakWidget").then(m => ({ default: m.LearningStreakWidget }))
);

interface RecentSubjectProgress {
  subject: string;
  subjectSlug: string;
  lastLessonSlug: string;
  lastLessonTitle: string;
  progress: number;
  lastActivity: string;
}

interface FeatureState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

export interface OverviewTabProps {
  recentSubjectsFeature: FeatureState<RecentSubjectProgress[]>;
  onRetryRecentSubjects: () => void;
  analytics: {
    streak: number;
    weeklyGoal: { current: number; target: number };
  };
  // Banners
  activeBanner: string | null;
  showPrompt: boolean;
  isIOS: boolean;
  isPromptAvailable: boolean;
  installApp: () => Promise<void>;
  dismissPrompt: () => void;
  dismissBanner: (id: string, days: number) => void;
  // Content editor
  isContentEditor: boolean;
  // Onboarding test
  showOnboardingTest: boolean;
  restartTour: () => void;
}

export const OverviewTab = ({
  recentSubjectsFeature,
  onRetryRecentSubjects,
  analytics,
  activeBanner,
  showPrompt,
  isIOS,
  isPromptAvailable,
  installApp,
  dismissPrompt,
  dismissBanner,
  isContentEditor,
  showOnboardingTest,
  restartTour,
}: OverviewTabProps) => {
  const navigate = useNavigate();
  const { shouldAnimate } = useNetworkAwareAnimations();

  return (
    <>
      {/* Quick Actions */}
      <QuickActionsCard />

      {/* Continue Learning */}
      {recentSubjectsFeature.loading ? (
        <Card className="border-none rounded-[20px] shadow-md bg-gradient-to-br from-primary/5 to-success/5">
          <CardHeader className="pb-3 px-4 sm:px-6">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          </CardContent>
        </Card>
      ) : recentSubjectsFeature.error ? (
        <Card className="border-none rounded-[20px] shadow-md">
          <CardContent>
            <ErrorState
              message="Impossible de charger vos matières récentes"
              onRetry={onRetryRecentSubjects}
              compact
            />
          </CardContent>
        </Card>
      ) : recentSubjectsFeature.data.length > 0 && (
        <Card className="border-none rounded-[20px] shadow-md bg-gradient-to-br from-primary/5 to-success/5">
          <CardHeader className="pb-3 px-4 sm:px-6">
            <CardTitle className="font-semibold tracking-tight text-lg sm:text-xl flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              Continuer l'apprentissage
            </CardTitle>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Reprends là où tu t'es arrêté
            </p>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {recentSubjectsFeature.data.map((subject) => (
                <div
                  key={subject.subjectSlug}
                  onClick={() => navigate(`/course/${subject.subjectSlug}`)}
                  className={`group p-4 bg-background rounded-xl border border-border cursor-pointer tap-highlight-none touch-target active:scale-[0.98] ${
                    shouldAnimate
                      ? 'hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300'
                      : 'transition-colors duration-150'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base">{subject.subject}</h4>
                    <ArrowRight className={`w-4 h-4 text-muted-foreground ${shouldAnimate ? 'group-hover:text-primary transition-colors' : ''}`} />
                  </div>
                  <div className="mb-2">
                    <Progress value={subject.progress} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {subject.progress}% complété
                  </p>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-4 text-primary hover:text-primary/80 touch-target"
              onClick={() => navigate("/matieres")}
            >
              Voir toutes les matières →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Goals & Streak side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WeeklyGoalWidget current={analytics.weeklyGoal.current} target={analytics.weeklyGoal.target} />
        <Suspense fallback={<AnalyticsWidgetSkeleton />}>
          <LearningStreakWidget streak={analytics.streak} />
        </Suspense>
      </div>

      {/* Banners */}
      {activeBanner === 'pwa' && (
        <PWAInstallPrompt
          isIOS={isIOS}
          isPromptAvailable={isPromptAvailable}
          onInstall={installApp}
          onDismiss={dismissPrompt}
        />
      )}
      {activeBanner === 'passion' && (
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/50 hover:bg-background/80"
            onClick={(e) => {
              e.preventDefault();
              dismissBanner('passion', 7);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
          <Link to="/passion-discovery">
            <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl hover:border-purple-500/70 transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-shrink-0 text-4xl">🎨</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">
                    Découvre ta passion & Développement personnel
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Explore la musique, les arts, les échecs, l'éducation civique et le développement personnel avec Jude en IA
                  </p>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                    Découvrir mes passions →
                  </button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* Content Editor link */}
      {isContentEditor && (
        <Link to="/content-editor">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <Edit3 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Éditeur de Contenu</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Gérer et créer du contenu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Onboarding test button */}
      {showOnboardingTest && (
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4 sm:p-6">
            <button
              onClick={restartTour}
              className="w-full flex items-center gap-4 text-left hover:opacity-80 transition-opacity"
            >
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">🎓 Tester le guide</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Relancer la visite guidée</p>
              </div>
            </button>
          </CardContent>
        </Card>
      )}
    </>
  );
};
