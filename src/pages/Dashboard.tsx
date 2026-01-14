import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";

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
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { getAvatarUrl } from "@/lib/avatarMap";
import { PageHeader } from "@/components/shared/PageHeader";
import { useVisitor } from "@/contexts/VisitorContext";
import { LockedOverlay } from "@/components/visitor";
import { visitorDashboardData } from "@/data/visitorDemoData";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { 
  DashboardKPISkeleton, 
  LeaderboardSkeleton,
  NotesListSkeleton,
  ChartSkeleton,
  AnalyticsWidgetSkeleton,
  DashboardFullSkeleton
} from "@/components/shared/SkeletonLoaders";
import { ChartErrorBoundary } from "@/components/dashboard/ChartErrorBoundary";

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
  lesson_topic: string;
  content: string;
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
  const { shouldAnimate, animationLevel } = useNetworkAwareAnimations();
  const [userData, setUserData] = useState({
    name: isVisitor ? "Visiteur" : "Utilisateur",
  });
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [goldEarned, setGoldEarned] = useState<number>(isVisitor ? visitorDashboardData.goldEarned : 0);
  const [userId, setUserId] = useState<string>("");
  const [isContentEditor, setIsContentEditor] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(!isVisitor);
  const [isUserDataLoading, setIsUserDataLoading] = useState(!isVisitor);
  const [totalLessonsCompleted, setTotalLessonsCompleted] = useState(isVisitor ? visitorDashboardData.lessonsCompleted : 0);
  const [recentSubjects, setRecentSubjects] = useState<RecentSubjectProgress[]>([]);
  
  const { showPrompt, isIOS, installApp, dismissPrompt } = usePWAInstall();
  const { analytics, isLoading: analyticsLoading } = useDashboardAnalytics(isVisitor ? null : userId || null);
  const { dismissBanner, isBannerDismissed, getActiveBanner } = useBannerPriority();

  // Auth guard - redirect unauthenticated users (skip for visitors)
  useEffect(() => {
    // Skip auth check for visitors
    if (isVisitor) {
      setIsAuthChecking(false);
      setIsUserDataLoading(false);
      fetchLeaderboard(); // Still fetch leaderboard for visitors
      return;
    }
    
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth", { replace: true });
        return;
      }
      setUserId(user.id);
      setIsAuthChecking(false);
      
      // Fetch all user-related data with single user object
      fetchAllUserData(user.id);
      fetchLeaderboard();
    };
    
    checkAuth();
  }, [navigate, isVisitor]);

  // Consolidated data fetching with single user id
  const fetchAllUserData = async (currentUserId: string) => {
    setIsUserDataLoading(true);
    
    // Parallel fetch for efficiency - now includes academic_grade and subjects
    const [profileResult, notesResult, editorResult, completionsResult, recentActivityResult, subjectsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("nickname, gold_earned, academic_grade")
        .eq("user_id", currentUserId)
        .single(),
      supabase
        .from("notes")
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
        .from("lesson_completions")
        .select("subject, lesson_slug, completed_at")
        .eq("user_id", currentUserId)
        .order("completed_at", { ascending: false })
        .limit(20),
      supabase
        .from("subjects")
        .select("id, slug, name, grade_level")
    ]);

    // Process profile data
    if (profileResult.data) {
      setUserData({ name: profileResult.data.nickname || "Utilisateur" });
      setGoldEarned(profileResult.data.gold_earned || 0);
    }

    // Process notes - enrich with lesson/subject info for navigation
    if (notesResult.data && notesResult.data.length > 0) {
      const lessonTopics = [...new Set(notesResult.data.map(n => n.lesson_topic))];
      
      // Fetch lessons with their subjects for navigation
      const { data: lessonsWithSubjects } = await supabase
        .from("lessons")
        .select("slug, title, subjects(slug, name, grade_level)")
        .in("slug", lessonTopics);
      
      const userGrade = profileResult.data?.academic_grade || '9AF';
      
      // Create lookup map - prioritize user's grade level for duplicates
      const lessonMap = new Map<string, { lesson_slug: string; lesson_title: string; subject_slug: string; subject_name: string }>();
      
      lessonsWithSubjects?.forEach(lesson => {
        const existing = lessonMap.get(lesson.slug);
        const subjectData = lesson.subjects as { slug: string; name: string; grade_level: string } | null;
        const subjectGrade = subjectData?.grade_level;
        
        // If no existing entry, or new entry matches user's grade (prioritize)
        if (!existing || subjectGrade === userGrade) {
          lessonMap.set(lesson.slug, {
            lesson_slug: lesson.slug,
            lesson_title: lesson.title,
            subject_slug: subjectData?.slug || '',
            subject_name: subjectData?.name || ''
          });
        }
      });
      
      // Enhance notes with navigation data
      const enhancedNotes: Note[] = notesResult.data.map(note => ({
        ...note,
        ...lessonMap.get(note.lesson_topic)
      }));
      
      setRecentNotes(enhancedNotes);
    } else if (notesResult.data) {
      setRecentNotes(notesResult.data);
    }

    // Process editor access
    setIsContentEditor(!!editorResult.data);
    
    // Process lesson completions count
    setTotalLessonsCompleted(completionsResult.count || 0);
    
    // Process recent activity for "Continue Learning" section
    if (recentActivityResult.data && !recentActivityResult.error) {
      const subjectMap = new Map<string, { subject: string; lastLessonSlug: string; lastActivity: string; count: number }>();
      
      for (const completion of recentActivityResult.data) {
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
      
      // Get user's grade and available subjects for proper slug mapping
      const userGrade = profileResult.data?.academic_grade || '9AF';
      const availableSubjects = subjectsResult.data || [];
      
      // Helper function to find the best matching subject slug
      const findSubjectSlug = (subjectName: string): string => {
        const normalizedName = subjectName.toLowerCase().replace('é', 'e');
        const normalizedGrade = userGrade.toLowerCase();
        
        // Try exact match with grade suffix (e.g., "anglais-af9" for grade "9AF")
        const gradeSlugVariants = [
          `${normalizedName}-${normalizedGrade}`,
          `${normalizedName}-af${normalizedGrade.replace(/\D/g, '')}`,
          `${normalizedName}-${normalizedGrade.replace(/(\d+)(\w+)/i, '$2$1').toLowerCase()}`
        ];
        
        for (const variant of gradeSlugVariants) {
          const match = availableSubjects.find(s => s.slug === variant);
          if (match) return match.slug;
        }
        
        // Try matching by subject name and user's grade_level
        const gradeMatch = availableSubjects.find(s => 
          s.slug.startsWith(normalizedName) && s.grade_level === userGrade
        );
        if (gradeMatch) return gradeMatch.slug;
        
        // Try any subject that starts with the name
        const partialMatch = availableSubjects.find(s => s.slug.startsWith(normalizedName));
        if (partialMatch) return partialMatch.slug;
        
        // Fallback to original name
        return subjectName;
      };
      
      // Convert to array and get top 3 most recent
      const recentSubjectsData: RecentSubjectProgress[] = Array.from(subjectMap.values())
        .slice(0, 3)
        .map(item => {
          // Create proper subject display name
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
          
          return {
            subject: subjectDisplayNames[item.subject] || item.subject,
            subjectSlug: findSubjectSlug(item.subject),
            lastLessonSlug: item.lastLessonSlug,
            lastLessonTitle: item.lastLessonSlug.replace(/-/g, ' '),
            progress: Math.min(item.count * 10, 100), // Rough progress estimate
            lastActivity: item.lastActivity
          };
        });
      
      setRecentSubjects(recentSubjectsData);
    }
    
    setIsUserDataLoading(false);
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    
    // Use RPC function to bypass RLS complexity
    const { data: topUsers, error } = await supabase
      .rpc('get_leaderboard_profiles', { limit_count: 5 });

    if (error) {
      console.error("Leaderboard fetch error:", error);
      setLeaderboardLoading(false);
      return;
    }

    const rankedUsers = topUsers?.map((user: any, index: number) => ({
      ...user,
      full_name: user.nickname || "Étudiant",
      rank: index + 1,
    })) || [];

    setLeaderboard(rankedUsers);
    setLeaderboardLoading(false);
  };

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


  // Show loading state while checking auth
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
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
        <div className="container mx-auto px-4 py-6 space-y-8 pb-24">
          {/* Welcome Header using PageHeader component */}
          <div data-tour="welcome-header">
            <PageHeader
              title={isUserDataLoading ? "Bienvenue..." : `Bienvenue, ${userData.name}!`}
              subtitle="Continuez votre apprentissage personnalisé avec Jude, votre assistant IA"
              variant="gradient"
              showThemeToggle={true}
            />
          </div>

          {/* Quick Actions Card */}
          <QuickActionsCard />

          {/* Continue Learning Section - Shows recent subjects with progress */}
          {recentSubjects.length > 0 && (
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
                  {recentSubjects.map((subject, index) => (
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
              { id: 'notification', priority: 2, show: !!userId },
              { id: 'passion', priority: 3, show: !isBannerDismissed('passion') },
            ]);

            return (
              <>
                {activeBanner === 'pwa' && (
                  <PWAInstallPrompt
                    isIOS={isIOS}
                    onInstall={installApp}
                    onDismiss={dismissPrompt}
                  />
                )}
                {activeBanner === 'notification' && userId && (
                  <NotificationPermissionBanner userId={userId} />
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
                  {isUserDataLoading ? <Skeleton className="h-6 sm:h-8 w-10 sm:w-12 mx-auto" /> : goldEarned}
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
              {leaderboardLoading ? (
                <LeaderboardSkeleton count={5} />
              ) : leaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun utilisateur dans le classement pour le moment
                </p>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((user) => (
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
              {isUserDataLoading ? (
                <NotesListSkeleton count={3} />
              ) : recentNotes.length === 0 ? (
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
                  {recentNotes.map((note) => {
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
                              {topicInfo[note.lesson_topic]?.icon} 
                              {note.lesson_title || topicInfo[note.lesson_topic]?.title || note.lesson_topic}
                              {isClickable && (
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              )}
                            </h4>
                            {note.subject_name && (
                              <p className="text-xs text-primary mb-1">{note.subject_name}</p>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {note.content}
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
