import { Suspense, lazy } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Edit3, Sparkles, X, Flame, Target, Trophy, BookOpen, Award, Clock } from "lucide-react";
import { useNetworkAwareAnimations } from "@/hooks/useNetworkAwareAnimations";
import { useUserProfile } from "@/hooks/useUserProfile";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ErrorState } from "@/components/shared/ErrorState";
import { AnalyticsWidgetSkeleton } from "@/components/shared/SkeletonLoaders";

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

const SUBJECT_COLORS: Record<string, string> = {
  mathematiques: "border-l-blue-500",
  francais: "border-l-green-500",
  anglais: "border-l-violet-500",
  sciences: "border-l-cyan-500",
  histoire: "border-l-amber-500",
  geographie: "border-l-emerald-500",
  physique: "border-l-red-500",
  chimie: "border-l-orange-500",
  biologie: "border-l-lime-500",
  philosophie: "border-l-indigo-500",
  creole: "border-l-pink-500",
  espagnol: "border-l-yellow-500",
};

function getSubjectColor(slug: string): string {
  const key = slug.toLowerCase().replace(/[-_]/g, "");
  for (const [k, v] of Object.entries(SUBJECT_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "border-l-primary";
}

export interface OverviewTabProps {
  recentSubjectsFeature: FeatureState<RecentSubjectProgress[]>;
  onRetryRecentSubjects: () => void;
  analytics: {
    streak: number;
    weeklyGoal: { current: number; target: number };
    gold: number;
    totalLessonsCompleted: number;
    weeklyLessons: number;
    averageScore: number;
    studyTimeThisWeek: number;
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
  // Use cached profile gold instead of stale analytics.gold from one-time fetch
  const { profile } = useUserProfile();

  const goalPercentage = Math.min((analytics.weeklyGoal.current / analytics.weeklyGoal.target) * 100, 100);

  const studyHours = Math.floor(analytics.studyTimeThisWeek / 60);

  return (
    <>
      {/* Quick Actions — compact inline row */}
      <QuickActionsCard />

      {/* KPI Stats Strip */}
      <Card className="border-none rounded-xl shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mb-1.5">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground">{profile.goldEarned}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">Gold</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-1.5">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground">{analytics.totalLessonsCompleted}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">Leçons</span>
              <span className="text-[9px] sm:text-[10px] text-green-500 font-medium">+{analytics.weeklyLessons}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mb-1.5">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground">{analytics.averageScore}%</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">Score</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-1.5">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground">{studyHours}h</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">Étude</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI zero helper — disappears once any stat is non-zero */}
      {profile.goldEarned === 0 && analytics.totalLessonsCompleted === 0 && analytics.averageScore === 0 && analytics.studyTimeThisWeek === 0 && (
        <p className="text-xs text-muted-foreground text-center -mt-2 mb-2">
          Complète ta première leçon pour commencer à accumuler des points ! 🎯
        </p>
      )}

      {/* Today's Focus — combined Goal + Streak */}
      <Card className="border-none rounded-xl shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Streak */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <span className="text-lg font-bold text-foreground">{analytics.streak}</span>
                <span className="text-xs text-muted-foreground ml-1">{analytics.streak === 1 ? "jour" : "jours"}</span>
              </div>
            </div>
            {/* Divider */}
            <div className="w-px h-8 bg-border" />
            {/* Weekly Goal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-muted-foreground">Objectif</span>
                </div>
                <span className="text-xs font-semibold text-foreground">{analytics.weeklyGoal.current}/{analytics.weeklyGoal.target}</span>
              </div>
              <Progress value={goalPercentage} className="h-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Learning */}
      {recentSubjectsFeature.loading ? (
        <Card className="border-none rounded-xl shadow-sm">
          <CardHeader className="pb-2 px-4">
            <Skeleton className="h-5 w-44" />
          </CardHeader>
          <CardContent className="px-4">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          </CardContent>
        </Card>
      ) : recentSubjectsFeature.error ? (
        <Card className="border-none rounded-xl shadow-sm">
          <CardContent className="p-4">
            <ErrorState
              message="Impossible de charger vos matières récentes"
              onRetry={onRetryRecentSubjects}
              compact
            />
          </CardContent>
        </Card>
      ) : recentSubjectsFeature.data.length > 0 ? (
        <Card className="border-none rounded-xl shadow-sm">
          <CardHeader className="pb-2 px-4">
            <CardTitle className="font-semibold text-base flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" />
              Continuer l'apprentissage
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="space-y-2">
              {recentSubjectsFeature.data.map((subject) => (
                <div
                  key={subject.subjectSlug}
                  onClick={() => navigate(`/course/${subject.subjectSlug}`)}
                  className={`group flex items-center gap-3 p-3 bg-muted/40 rounded-lg border-l-[3px] ${getSubjectColor(subject.subjectSlug)} cursor-pointer tap-highlight-none active:scale-[0.98] ${
                    shouldAnimate
                      ? 'hover:bg-muted/70 transition-all duration-200'
                      : 'transition-colors duration-150'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground text-sm truncate">{subject.subject}</h4>
                      <span className="text-xs font-medium text-muted-foreground ml-2 flex-shrink-0">{subject.progress}%</span>
                    </div>
                    <Progress value={subject.progress} className="h-1 mt-1.5" />
                  </div>
                  <ArrowRight className={`w-4 h-4 text-muted-foreground flex-shrink-0 ${shouldAnimate ? 'group-hover:text-primary transition-colors' : ''}`} />
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-primary hover:text-primary/80 touch-target text-xs"
              onClick={() => navigate("/matieres")}
            >
              Voir toutes les matières →
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Fix 1: First-time user guidance — shows when no lesson history */
        <Card className="border-none rounded-xl shadow-sm overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center mb-4">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Commence ton apprentissage !</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tu n'as pas encore commencé. Lance ta première leçon maintenant !
            </p>
            <Button
              onClick={() => navigate("/matieres")}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Commencer à apprendre
            </Button>
          </CardContent>
        </Card>
      )}

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
            className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-background/50 hover:bg-background/80"
            onClick={(e) => {
              e.preventDefault();
              dismissBanner('passion', 7);
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          <Link to="/passion-discovery">
            <Card className="border border-purple-500/30 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl hover:border-purple-500/50 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-shrink-0 text-3xl">🎨</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm mb-0.5">Découvre ta passion</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    Musique, arts, échecs, développement personnel avec Jude en IA
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* Content Editor link */}
      {isContentEditor && (
        <Link to="/content-editor">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer rounded-xl">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-full">
                <Edit3 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Éditeur de Contenu</h3>
                <p className="text-xs text-muted-foreground">Gérer et créer du contenu</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Onboarding test button */}
      {showOnboardingTest && (
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 rounded-xl">
          <CardContent className="p-3">
            <button
              onClick={restartTour}
              className="w-full flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
            >
              <div className="p-2 bg-blue-500/20 rounded-full">
                <Sparkles className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">🎓 Tester le guide</h3>
                <p className="text-xs text-muted-foreground">Relancer la visite guidée</p>
              </div>
            </button>
          </CardContent>
        </Card>
      )}
    </>
  );
};
