import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { useSessionAuth } from "@/contexts/SessionAuthContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirstTimeUser } from "@/contexts/FirstTimeUserContext";
import { useNetworkAwareAnimations } from "@/hooks/useNetworkAwareAnimations";
import {
  Award,
  BookOpen,
  Target,
  TrendingUp,
  Trophy,
  Edit3,
  FileText,
  Medal,
  Crown,
  Sparkles,
  X,
  Play,
  ArrowRight,
} from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useBannerPriority } from "@/hooks/useBannerPriority";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import { Progress } from "@/components/ui/progress";

import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { getAvatarUrl } from "@/lib/avatarMap";
import { PageHeader } from "@/components/shared/PageHeader";
import { useVisitor } from "@/contexts/VisitorContext";
import { LockedOverlay } from "@/components/visitor";
import { visitorDashboardData } from "@/data/visitorDemoData";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { 
  DashboardKPISkeleton, 
  LeaderboardSkeleton,
  NotesListSkeleton,
  ChartSkeleton,
  AnalyticsWidgetSkeleton,
  DashboardFullSkeleton
} from "@/components/shared/SkeletonLoaders";
import { ChartErrorBoundary } from "@/components/dashboard/ChartErrorBoundary";
import { WordOfTheDayCard } from "@/components/dashboard/WordOfTheDayCard";

// Feature-level state interface for independent loading/error states
interface FeatureState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

// Lazy-load heavy chart and widget components for 3G optimization
const WeeklyActivityChart = lazy(() => 
  import("@/components/dashboard/WeeklyActivityChart").then(m => ({ default: m.WeeklyActivityChart }))
);
const SubjectProgressChart = lazy(() => 
  import("@/components/dashboard/SubjectProgressChart").then(m => ({ default: m.SubjectProgressChart }))
);
const LearningStreakWidget = lazy(() => 
  import("@/components/dashboard/LearningStreakWidget").then(m => ({ default: m.LearningStreakWidget }))
);
const LearningInsightsPanel = lazy(() => 
  import("@/components/dashboard/LearningInsightsPanel").then(m => ({ default: m.LearningInsightsPanel }))
);
const AchievementsBadges = lazy(() => 
  import("@/components/dashboard/AchievementsBadges").then(m => ({ default: m.AchievementsBadges }))
);

interface Note {
  id: string;
  lesson_id: string;
  notes: string | null;
  updated_at: string;
  // Navigation fields for clickable notes
  lesson_slug?: string;
  lesson_title?: string;
  subject_slug?: string;
  subject_name?: string;
}

interface LeaderboardUser {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  gold_earned: number;
  academic_grade: string;
  rank: number;
}

interface RecentSubjectProgress {
  subject: string;
  subjectSlug: string;
  lastLessonSlug: string;
  lastLessonTitle: string;
  progress: number;
  lastActivity: string;
}

const Dashboard = () => {
  const { restartTour } = useFirstTimeUser();
  const navigate = useNavigate();
  const { isVisitor } = useVisitor();
  const { user: authUser, isLoading: isAuthLoading, isAuthenticated } = useSessionAuth();
  const { shouldAnimate, animationLevel } = useNetworkAwareAnimations();
  // Feature-level state architecture - each feature loads independently
  const [profileFeature, setProfileFeature] = useState<FeatureState<{ name: string; gold: number }>>({
    data: { name: isVisitor ? "Visiteur" : "Utilisateur", gold: isVisitor ? visitorDashboardData.goldEarned : 0 },
    loading: !isVisitor,
    error: null
  });
  
  const [notesFeature, setNotesFeature] = useState<FeatureState<Note[]>>({
    data: [],
    loading: true,
    error: null
  });
  
  const [leaderboardFeature, setLeaderboardFeature] = useState<FeatureState<LeaderboardUser[]>>({
    data: [],
    loading: true,
    error: null
  });
  
  const [recentSubjectsFeature, setRecentSubjectsFeature] = useState<FeatureState<RecentSubjectProgress[]>>({
    data: [],
    loading: true,
    error: null
  });
  
  const [isContentEditor, setIsContentEditor] = useState(false);
  const [totalLessonsCompleted, setTotalLessonsCompleted] = useState(isVisitor ? visitorDashboardData.lessonsCompleted : 0);
  
  // Derived userId from centralized auth context
  const userId = authUser?.id || "";
  
  const { showPrompt, isIOS, isPromptAvailable, installApp, dismissPrompt } = usePWAInstall();
  // Defer analytics until after critical data loads
  const { analytics, isLoading: analyticsLoading } = useDashboardAnalytics(
    isVisitor || !userId ? null : userId
  );
  const { dismissBanner, isBannerDismissed, getActiveBanner } = useBannerPriority();

  // Two-phase loading: use centralized auth, no redundant getUser() call
  useEffect(() => {
    // Skip for visitors
    if (isVisitor) {
      setProfileFeature(prev => ({ ...prev, loading: false }));
      fetchLeaderboard(); // Still fetch leaderboard for visitors
      return;
    }
    
    // Wait for auth to complete before doing anything
    if (isAuthLoading) return;
    
    // Redirect if not authenticated (after auth check completes)
    if (!isAuthenticated || !authUser) {
      navigate("/auth/login", { replace: true });
      return;
    }
    
    // Phase A: Fetch critical data immediately (profile, gold)
    fetchCriticalUserData(authUser.id);
    fetchLeaderboard();
    
    // Phase B: Fetch non-critical data after a short delay
    const deferTimer = setTimeout(() => {
      fetchNonCriticalUserData(authUser.id);
    }, 500);
    
    return () => clearTimeout(deferTimer);
  }, [navigate, isVisitor, isAuthLoading, isAuthenticated, authUser]);

  // Phase A: Critical data - renders immediately
  const fetchCriticalUserData = async (currentUserId: string) => {
    setProfileFeature(prev => ({ ...prev, loading: true, error: null }));
    setRecentSubjectsFeature(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Only fetch profile and recent activity - what user sees first
      const [profileResult, recentActivityResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("nickname, gold_earned, academic_grade")
          .eq("user_id", currentUserId)
          .maybeSingle(),
        supabase
          .from("lesson_completions")
          .select("subject, lesson_slug, completed_at")
          .eq("user_id", currentUserId)
          .order("completed_at", { ascending: false })
          .limit(20),
      ]);

      // Process profile data - render immediately
      if (profileResult.data) {
        setProfileFeature({
          data: { 
            name: profileResult.data.nickname || "Utilisateur",
            gold: profileResult.data.gold_earned || 0
          },
          loading: false,
          error: null
        });
      } else {
        setProfileFeature(prev => ({ ...prev, loading: false }));
      }
      
      // Process recent activity for "Continue Learning" section
      if (recentActivityResult.data && !recentActivityResult.error) {
        await processRecentActivity(recentActivityResult.data, profileResult.data?.academic_grade);
      } else {
        setRecentSubjectsFeature(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      setProfileFeature(prev => ({ ...prev, loading: false, error: error as Error }));
      setRecentSubjectsFeature(prev => ({ ...prev, loading: false, error: error as Error }));
    }
  };

  // Phase B: Non-critical data - loaded after initial render
  const fetchNonCriticalUserData = async (currentUserId: string) => {
    setNotesFeature(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [notesResult, editorResult, completionsResult, subjectsResult] = await Promise.all([
        supabase
          .from("lesson_notes")
          .select("*")
          .eq("user_id", currentUserId)
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("content_editor_roles")
          .select("role")
          .eq("user_id", currentUserId)
          .maybeSingle(),
        supabase
          .from("lesson_completions")
          .select("id", { count: "exact" })
          .eq("user_id", currentUserId),
        supabase
          .from("subjects")
          .select("id, slug, name, grade_level"),
      ]);

      // Process notes - enrich with lesson/subject info for navigation
      if (notesResult.data && notesResult.data.length > 0) {
        await enrichNotesWithNavigation(notesResult.data, currentUserId);
      } else if (notesResult.data) {
        setNotesFeature({ data: notesResult.data, loading: false, error: null });
      } else {
        setNotesFeature(prev => ({ ...prev, loading: false }));
      }

      // Process editor access
      setIsContentEditor(!!editorResult.data);
      
      // Process lesson completions count
      setTotalLessonsCompleted(completionsResult.count || 0);
    } catch (error) {
      setNotesFeature(prev => ({ ...prev, loading: false, error: error as Error }));
    }
  };

  // Helper: Process recent activity data
  const processRecentActivity = async (activityData: any[], userGrade?: string) => {
    const subjectMap = new Map<string, { subject: string; lastLessonSlug: string; lastActivity: string; count: number }>();
    
    for (const completion of activityData) {
      if (!subjectMap.has(completion.subject)) {
        subjectMap.set(completion.subject, {
          subject: completion.subject,
          lastLessonSlug: completion.lesson_slug,
          lastActivity: completion.completed_at,
          count: 1
        });
      } else {
        const existing = subjectMap.get(completion.subject)!;
        existing.count++;
      }
    }
    
    // Get subjects for slug mapping (deferred if needed)
    const { data: availableSubjects } = await supabase
      .from("subjects")
      .select("id, slug, name, grade_level");
    
    const gradeToUse = userGrade || '9AF';
    
    // Helper function to find the best matching subject slug
    const findSubjectSlug = (subjectName: string): string => {
      const normalizedName = subjectName.toLowerCase().replace('é', 'e');
      const normalizedGrade = gradeToUse.toLowerCase();
      
      const gradeSlugVariants = [
        `${normalizedName}-${normalizedGrade}`,
        `${normalizedName}-af${normalizedGrade.replace(/\D/g, '')}`,
        `${normalizedName}-${normalizedGrade.replace(/(\d+)(\w+)/i, '$2$1').toLowerCase()}`
      ];
      
      for (const variant of gradeSlugVariants) {
        const match = availableSubjects?.find(s => s.slug === variant);
        if (match) return match.slug;
      }
      
      const gradeMatch = availableSubjects?.find(s => 
        s.slug.startsWith(normalizedName) && s.grade_level === gradeToUse
      );
      if (gradeMatch) return gradeMatch.slug;
      
      const partialMatch = availableSubjects?.find(s => s.slug.startsWith(normalizedName));
      if (partialMatch) return partialMatch.slug;
      
      return subjectName;
    };
    
    const subjectDisplayNames: Record<string, string> = {
      'mathematiques': 'Mathématiques',
      'mathématiques': 'Mathématiques',
      'francais': 'Français',
      'sciences': 'Sciences',
      'sciences-sociales': 'Sciences Sociales',
      'espagnol': 'Espagnol',
      'anglais': 'Anglais',
      'creole': 'Créole'
    };
    
    const recentSubjectsData: RecentSubjectProgress[] = Array.from(subjectMap.values())
      .slice(0, 3)
      .map(item => ({
        subject: subjectDisplayNames[item.subject] || item.subject,
        subjectSlug: findSubjectSlug(item.subject),
        lastLessonSlug: item.lastLessonSlug,
        lastLessonTitle: item.lastLessonSlug.replace(/-/g, ' '),
        progress: Math.min(item.count * 10, 100),
        lastActivity: item.lastActivity
      }));
    
    setRecentSubjectsFeature({ data: recentSubjectsData, loading: false, error: null });
  };

  // Helper: Enrich notes with navigation data
  const enrichNotesWithNavigation = async (notes: Note[], currentUserId: string) => {
    const lessonIds = [...new Set(notes.map(n => n.lesson_id))];
    
    const { data: lessonsWithSubjects } = await supabase
      .from("lessons")
      .select("slug, title, subjects(slug, name, grade_level)")
      .in("slug", lessonIds);
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("academic_grade")
      .eq("user_id", currentUserId)
      .maybeSingle();
    
    const userGrade = profile?.academic_grade || '9AF';
    
    const lessonMap = new Map<string, { lesson_slug: string; lesson_title: string; subject_slug: string; subject_name: string }>();
    
    lessonsWithSubjects?.forEach(lesson => {
      const existing = lessonMap.get(lesson.slug);
      const subjectData = lesson.subjects as { slug: string; name: string; grade_level: string } | null;
      const subjectGrade = subjectData?.grade_level;
      
      if (!existing || subjectGrade === userGrade) {
        lessonMap.set(lesson.slug, {
          lesson_slug: lesson.slug,
          lesson_title: lesson.title,
          subject_slug: subjectData?.slug || '',
          subject_name: subjectData?.name || ''
        });
      }
    });
    
    const enhancedNotes: Note[] = notes.map(note => ({
      ...note,
      ...lessonMap.get(note.lesson_id)
    }));
    
    setNotesFeature({ data: enhancedNotes, loading: false, error: null });
  };

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardFeature(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Use RPC function to bypass RLS complexity
      const { data: topUsers, error } = await supabase
        .rpc('get_leaderboard_profiles', { limit_count: 5 });

      if (error) {
        console.error("Leaderboard fetch error:", error);
        setLeaderboardFeature(prev => ({ ...prev, loading: false, error: error as unknown as Error }));
        return;
      }

      const rankedUsers = topUsers?.map((user: any, index: number) => ({
        ...user,
        full_name: user.nickname || "Étudiant",
        rank: index + 1,
      })) || [];

      setLeaderboardFeature({ data: rankedUsers, loading: false, error: null });
    } catch (error) {
      setLeaderboardFeature(prev => ({ ...prev, loading: false, error: error as Error }));
    }
  }, []);

  const getRankIcon = useCallback((rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <Trophy className="w-4 h-4 text-muted-foreground" />;
    }
  }, []);

  const getRankBgColor = useCallback((rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
      case 2:
        return "from-gray-400/20 to-slate-400/20 border-gray-400/30";
      case 3:
        return "from-amber-600/20 to-orange-600/20 border-amber-600/30";
      default:
        return "from-muted/50 to-muted/30 border-border/50";
    }
  }, []);

  const topicInfo = useMemo(() => ({
    "numeration-binaire": { title: "Numération Binaire", icon: "💻" },
    "polygones": { title: "Les Polygones", icon: "⬡" },
    "divisibilite": { title: "Divisibilité", icon: "➗" },
    "decimaux": { title: "Décimaux", icon: "🔢" },
    "cercle-disque": { title: "Cercle et Disque", icon: "⭕" },
  }), []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  }, []);

  // Show full skeleton while auth is loading (non-blocking, page-specific)
  if (isAuthLoading && !isVisitor) {
    return <DashboardFullSkeleton />;
  }

  return (
    <>
      <Helmet>
        <title>Tableau de bord - Edupreneurs</title>
        <meta name="description" content="Suivez votre progression d'apprentissage, vos statistiques et vos objectifs avec le tableau de bord Edupreneurs." />
        <meta property="og:title" content="Tableau de bord - Edupreneurs" />
        <meta property="og:description" content="Suivez votre progression d'apprentissage avec Edupreneurs." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 lg:pb-8 space-y-8">
          {/* Welcome Header using PageHeader component */}
          <div data-tour="welcome-header">
            <PageHeader
              title={profileFeature.loading ? "Bienvenue..." : `Bienvenue, ${profileFeature.data.name}!`}
              subtitle="Continuez votre apprentissage personnalisé avec Jude, votre assistant IA"
              variant="gradient"
              showThemeToggle={true}
            />
          </div>

          {/* Word of the Day */}
          <WordOfTheDayCard />

          {/* Quick Actions Card */}
          <QuickActionsCard />

          {/* Continue Learning Section - Shows recent subjects with progress */}
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
                  onRetry={() => authUser && fetchCriticalUserData(authUser.id)}
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
                  {recentSubjectsFeature.data.map((subject, index) => (
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

          {/* Notification & PWA Banners - Show one at a time based on priority */}
          {(() => {
            const activeBanner = getActiveBanner([
              { id: 'pwa', priority: 1, show: showPrompt },
              { id: 'passion', priority: 2, show: !isBannerDismissed('passion') },
            ]);

            return (
              <>
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
                      <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl mb-4 hover:border-purple-500/70 transition-all">
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
              </>
            );
          })()}

          {isContentEditor && (
            <Link to="/content-editor">
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer mb-4">
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

          {/* Test Onboarding Button - Only for specific account */}
          {userId === "48d1e98c-a62c-4d46-ba89-b5bf3faa44be" && (
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 mb-4">
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

          {/* KPI Cards - Collapsible */}
          <CollapsibleSection title="Statistiques" icon={<TrendingUp className="w-5 h-5" />} storageKey="kpi-cards">
          <div data-tour="kpi-cards" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className={`border-none rounded-xl shadow-md tap-highlight-none ${shouldAnimate ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : ''}`}>
              <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white mx-auto mb-2 sm:mb-3">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-br from-yellow-500 to-orange-600 bg-clip-text text-transparent mb-1">
                  {profileFeature.loading ? <Skeleton className="h-6 sm:h-8 w-10 sm:w-12 mx-auto" /> : profileFeature.data.gold}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-0.5 sm:mb-1">Golds gagnés</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Total cumulé</p>
              </CardContent>
            </Card>

            <Card className={`border-none rounded-xl shadow-md tap-highlight-none ${shouldAnimate ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : ''}`}>
              <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white mx-auto mb-2 sm:mb-3">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent mb-1">
                  {analytics.totalLessonsCompleted}
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-0.5 sm:mb-1">Leçons</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">+{analytics.weeklyLessons} cette semaine</p>
              </CardContent>
            </Card>

            <Card className={`border-none rounded-xl shadow-md tap-highlight-none ${shouldAnimate ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : ''}`}>
              <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white mx-auto mb-2 sm:mb-3">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-br from-green-500 to-green-700 bg-clip-text text-transparent mb-1">
                  {analytics.averageScore}%
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-0.5 sm:mb-1">Score moyen</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Continue! 💪</p>
              </CardContent>
            </Card>

            <Card className={`border-none rounded-xl shadow-md tap-highlight-none ${shouldAnimate ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : ''}`}>
              <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white mx-auto mb-2 sm:mb-3">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-br from-purple-500 to-purple-700 bg-clip-text text-transparent mb-1">
                  {Math.round(analytics.studyTimeThisWeek / 60)}h
                </div>
                <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-0.5 sm:mb-1">Temps d'étude</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Cette semaine</p>
              </CardContent>
            </Card>
          </div>
          </CollapsibleSection>

          {/* Analytics Widgets - Collapsible */}
          <CollapsibleSection title="Objectifs" icon={<Target className="w-5 h-5" />} storageKey="analytics-widgets">
          <div data-tour="analytics-widgets" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Learning Streak - Using lazy-loaded component */}
            <Suspense fallback={<AnalyticsWidgetSkeleton />}>
              <LearningStreakWidget streak={analytics.streak} />
            </Suspense>

            {/* Weekly Goal */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <Target className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Objectif Hebdomadaire</p>
                    <p className="text-2xl font-bold text-foreground">
                      {analytics.weeklyGoal.current} / {analytics.weeklyGoal.target} leçons
                    </p>
                  </div>
                </div>
                <Progress 
                  value={Math.min((analytics.weeklyGoal.current / analytics.weeklyGoal.target) * 100, 100)} 
                  className="h-2" 
                />
              </CardContent>
            </Card>
          </div>
          </CollapsibleSection>

          {/* Charts Section - Collapsible with Lazy Loading */}
          <CollapsibleSection title="Graphiques" icon={<TrendingUp className="w-5 h-5" />} storageKey="charts-section">
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
          </CollapsibleSection>

          {/* Insights and Achievements - Using lazy-loaded components */}
          <CollapsibleSection title="Réalisations" icon={<Award className="w-5 h-5" />} storageKey="achievements">
          <div className="space-y-6">
            {/* Personalized Learning Insights */}
            <Suspense fallback={<AnalyticsWidgetSkeleton />}>
              <LearningInsightsPanel analytics={analytics} />
            </Suspense>
            
            {/* Badges using lazy-loaded component */}
            <Suspense fallback={<Skeleton className="h-32 w-full rounded-xl" />}>
              <AchievementsBadges achievements={[]} totalLessons={totalLessonsCompleted} />
            </Suspense>
          </div>
          </CollapsibleSection>

          {/* Leaderboard Section - Collapsible */}
          <CollapsibleSection title="Classement" icon={<Trophy className="w-5 h-5" />} storageKey="leaderboard">
          <Card data-tour="leaderboard-section" className="border-none rounded-[20px] shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-semibold tracking-tight text-xl flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Classement
              </CardTitle>
              <button 
                onClick={() => navigate("/leaderboard")} 
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Voir tout →
              </button>
            </CardHeader>
            <CardContent>
              {leaderboardFeature.loading ? (
                <LeaderboardSkeleton count={5} />
              ) : leaderboardFeature.error ? (
                <ErrorState 
                  message="Impossible de charger le classement" 
                  onRetry={fetchLeaderboard}
                  compact
                />
              ) : leaderboardFeature.data.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun utilisateur dans le classement pour le moment
                </p>
              ) : (
                <div className="space-y-3">
                  {leaderboardFeature.data.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gradient-to-br ${getRankBgColor(user.rank)} border tap-highlight-none ${
                        shouldAnimate ? 'transition-all hover:scale-[1.02]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
                        {getRankIcon(user.rank)}
                      </div>
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                        <AvatarImage 
                          src={user.avatar_url ? getAvatarUrl(user.avatar_url) : undefined}
                          loading="lazy"
                          decoding="async"
                        />
                        <AvatarFallback>{user.nickname?.[0] || user.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm sm:text-base truncate">{user.nickname || user.full_name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{user.academic_grade}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-base sm:text-lg text-yellow-600">{user.gold_earned}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Gold</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </CollapsibleSection>

          {/* Recent Notes */}
          <Card className="border-none rounded-[20px] shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Notes récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notesFeature.loading ? (
                <NotesListSkeleton count={3} />
              ) : notesFeature.error ? (
                <ErrorState 
                  message="Impossible de charger vos notes" 
                  onRetry={() => authUser && fetchNonCriticalUserData(authUser.id)}
                  compact
                />
              ) : notesFeature.data.length === 0 ? (
                <EmptyState
                  illustration="no-notes"
                  title="Aucune note"
                  description="Commence une leçon et prends des notes pour les retrouver ici"
                  ctaLabel="Explorer les matières"
                  ctaAction={() => navigate("/matieres")}
                  compact
                />
              ) : (
                <div className="space-y-3">
                  {notesFeature.data.map((note) => {
                    const isClickable = !!(note.subject_slug && note.lesson_slug);
                    return (
                      <div 
                        key={note.id}
                        onClick={() => {
                          if (isClickable) {
                            navigate(`/course/${note.subject_slug}/${note.lesson_slug}`);
                          }
                        }}
                        className={`p-4 bg-muted/50 rounded-lg transition-colors ${
                          isClickable 
                            ? 'hover:bg-muted cursor-pointer hover:shadow-sm' 
                            : 'opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                            {topicInfo[note.lesson_id]?.icon} 
                              {note.lesson_title || topicInfo[note.lesson_id]?.title || note.lesson_id}
                              {isClickable && (
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              )}
                            </h4>
                            {note.subject_name && (
                              <p className="text-xs text-primary mb-1">{note.subject_name}</p>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {note.notes || 'Note vide'}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground ml-4">
                            {formatDate(note.updated_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
