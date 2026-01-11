import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirstTimeUser } from "@/contexts/FirstTimeUserContext";
import {
  Award,
  BookOpen,
  Clock,
  Flame,
  Target,
  TrendingUp,
  Trophy,
  Edit3,
  Brain,
  GraduationCap,
  FileText,
  Medal,
  Crown,
  Star,
  Sparkles,
  X,
} from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useBannerPriority } from "@/hooks/useBannerPriority";
import { WeeklyActivityChart } from "@/components/dashboard/WeeklyActivityChart";
import { SubjectProgressChart } from "@/components/dashboard/SubjectProgressChart";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { CollapsibleSection } from "@/components/dashboard/CollapsibleSection";
import { Progress } from "@/components/ui/progress";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { getAvatarUrl } from "@/lib/avatarMap";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useVisitor } from "@/contexts/VisitorContext";
import { LockedOverlay } from "@/components/visitor";
import { visitorDashboardData } from "@/data/visitorDemoData";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { 
  DashboardKPISkeleton, 
  LeaderboardSkeleton,
  NotesListSkeleton 
} from "@/components/shared/SkeletonLoaders";

interface Note {
  id: string;
  lesson_topic: string;
  content: string;
  updated_at: string;
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

const Dashboard = () => {
  const { restartTour } = useFirstTimeUser();
  const navigate = useNavigate();
  const { isVisitor } = useVisitor();
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
  
  const { showPrompt, isIOS, installApp, dismissPrompt } = usePWAInstall();
  const { analytics, isLoading: analyticsLoading } = useDashboardAnalytics(isVisitor ? null : userId || null);
  const { dismissBanner, isBannerDismissed, getActiveBanner } = useBannerPriority();

  // Badge definitions with thresholds
  const badges = useMemo(() => [
    { 
      id: "first_lesson", 
      name: "Première Leçon", 
      description: "Complète ta première leçon",
      icon: Star,
      threshold: 1,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/20 border-yellow-500/50"
    },
    { 
      id: "dedicated_learner", 
      name: "Apprenant Assidu", 
      description: "Complète 10 leçons",
      icon: Award,
      threshold: 10,
      color: "text-blue-500",
      bgColor: "bg-blue-500/20 border-blue-500/50"
    },
    { 
      id: "master", 
      name: "Maître", 
      description: "Complète 50 leçons",
      icon: Trophy,
      threshold: 50,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20 border-purple-500/50"
    },
    { 
      id: "legend", 
      name: "Légende", 
      description: "Complète 100 leçons",
      icon: Flame,
      threshold: 100,
      color: "text-orange-500",
      bgColor: "bg-orange-500/20 border-orange-500/50"
    },
  ], []);

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
    
    // Parallel fetch for efficiency
    const [profileResult, notesResult, editorResult, completionsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("nickname, gold_earned")
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
        .eq("user_id", currentUserId)
    ]);

    // Process profile data
    if (profileResult.data) {
      setUserData({ name: profileResult.data.nickname || "Utilisateur" });
      setGoldEarned(profileResult.data.gold_earned || 0);
    }

    // Process notes
    if (notesResult.data && !notesResult.error) {
      setRecentNotes(notesResult.data);
    }

    // Process editor access
    setIsContentEditor(!!editorResult.data);
    
    // Process lesson completions count
    setTotalLessonsCompleted(completionsResult.count || 0);
    
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

  const subjects = useMemo(() => [
    { id: "math", name: "Mathématiques", icon: "🔢", description: "Algèbre, géométrie et calcul", path: "/matieres" },
    { id: "french", name: "Français", icon: "🇫🇷", description: "Grammaire et littérature", path: "/matieres" },
    { id: "science", name: "Sciences", icon: "🔬", description: "Physique, chimie et biologie", path: "/matieres" },
    { id: "history", name: "Histoire", icon: "📜", description: "Histoire d'Haïti et mondiale", path: "/matieres" },
  ], []);

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
        {/* Theme Toggle - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        
        <div className="container mx-auto px-4 py-6 space-y-8 pb-24">
          {/* Welcome Header */}
          <div data-tour="welcome-header" className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-3 xs:p-4 sm:p-6 lg:p-8 rounded-xl xs:rounded-2xl sm:rounded-[20px] mb-3 xs:mb-4 sm:mb-6 lg:mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
              <div className="w-full h-full bg-gradient-radial from-white/20 to-transparent animate-[float_20s_ease-in-out_infinite]"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-base xs:text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-1 xs:mb-1.5 sm:mb-2">
                Bienvenue, {isUserDataLoading ? (
                  <Skeleton className="inline-block h-6 w-24 bg-white/20" />
                ) : (
                  <span className="break-words">{userData.name}</span>
                )}!
              </h2>
              <p className="text-[11px] xs:text-xs sm:text-sm lg:text-base opacity-75 leading-relaxed">
                Continuez votre apprentissage personnalisé avec Jude, votre assistant IA
              </p>
            </div>
          </div>

          {/* Quick Actions Card */}
          <QuickActionsCard />

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
          <div data-tour="kpi-cards" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-none rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white mx-auto mb-3">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-br from-yellow-500 to-orange-600 bg-clip-text text-transparent mb-1">
                  {isUserDataLoading ? <Skeleton className="h-8 w-12 mx-auto" /> : goldEarned}
                </div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">Golds gagnés</div>
                <p className="text-xs text-muted-foreground">Total cumulé</p>
              </CardContent>
            </Card>

            <Card className="border-none rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white mx-auto mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent mb-1">
                  {analytics.totalLessonsCompleted}
                </div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">Leçons complétées</div>
                <p className="text-xs text-muted-foreground">+{analytics.weeklyLessons} cette semaine</p>
              </CardContent>
            </Card>

            <Card className="border-none rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white mx-auto mb-3">
                  <Award className="w-6 h-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-br from-green-500 to-green-700 bg-clip-text text-transparent mb-1">
                  {analytics.averageScore}%
                </div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">Score moyen</div>
                <p className="text-xs text-muted-foreground">Continue! 💪</p>
              </CardContent>
            </Card>

            <Card className="border-none rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white mx-auto mb-3">
                  <Target className="w-6 h-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-br from-purple-500 to-purple-700 bg-clip-text text-transparent mb-1">
                  {Math.round(analytics.studyTimeThisWeek / 60)}h
                </div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">Temps d'étude</div>
                <p className="text-xs text-muted-foreground">Cette semaine</p>
              </CardContent>
            </Card>
          </div>
          </CollapsibleSection>

          {/* Analytics Widgets - Collapsible */}
          <CollapsibleSection title="Objectifs" icon={<Target className="w-5 h-5" />} storageKey="analytics-widgets">
          <div data-tour="analytics-widgets" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Learning Streak */}
            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-full">
                    <Flame className="w-8 h-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Série d'apprentissage</p>
                    <p className="text-3xl font-bold text-foreground">
                      {analytics.streak} {analytics.streak === 1 ? "jour" : "jours"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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

            {/* Study Time */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <Clock className="w-8 h-8 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Temps d'étude</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.floor(analytics.studyTimeThisWeek / 60)}h {analytics.studyTimeThisWeek % 60}min
                    </p>
                    <p className="text-xs text-muted-foreground">Cette semaine</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </CollapsibleSection>

          {/* Charts Section - Collapsible */}
          <CollapsibleSection title="Graphiques" icon={<TrendingUp className="w-5 h-5" />} storageKey="charts-section">
          <div data-tour="charts-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeeklyActivityChart data={analytics.weeklyActivity} />
            <SubjectProgressChart data={analytics.subjectProgress} />
          </div>
          </CollapsibleSection>

          {/* Insights and Achievements - Collapsible */}
          <CollapsibleSection title="Réalisations" icon={<Award className="w-5 h-5" />} storageKey="achievements">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Insights d'Apprentissage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10">
                  <TrendingUp className="w-5 h-5 mt-0.5 text-blue-500" />
                  <p className="text-sm text-foreground">Commence une leçon pour débloquer tes insights!</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Badges & Réalisations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.map((badge) => {
                    const isUnlocked = totalLessonsCompleted >= badge.threshold;
                    const IconComponent = badge.icon;
                    
                    return (
                      <div 
                        key={badge.id}
                        className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                          isUnlocked 
                            ? `${badge.bgColor} shadow-md` 
                            : "bg-muted/50 border-muted opacity-50"
                        }`}
                      >
                        <IconComponent 
                          className={`w-8 h-8 mb-2 ${isUnlocked ? badge.color : "text-muted-foreground"}`} 
                        />
                        <p className={`text-xs font-medium text-center mb-1 ${isUnlocked ? "text-foreground" : ""}`}>
                          {badge.name}
                        </p>
                        <p className="text-xs text-muted-foreground text-center">
                          {isUnlocked ? "✓ Débloqué!" : badge.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
                {totalLessonsCompleted > 0 && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Tu as complété {totalLessonsCompleted} leçon{totalLessonsCompleted > 1 ? "s" : ""} au total!
                  </p>
                )}
              </CardContent>
            </Card>
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
                      className={`flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br ${getRankBgColor(user.rank)} border transition-all hover:scale-[1.02]`}
                    >
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(user.rank)}
                      </div>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar_url ? getAvatarUrl(user.avatar_url) : undefined} />
                        <AvatarFallback>{user.nickname?.[0] || user.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{user.nickname || user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.academic_grade}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-yellow-600">{user.gold_earned}</p>
                        <p className="text-xs text-muted-foreground">Gold</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </CollapsibleSection>

          {/* Choose Your Path Section */}
          <Card data-tour="parcours-section" className="border-none rounded-[20px] shadow-md mb-6">
            <CardHeader>
              <CardTitle className="font-semibold tracking-tight text-xl">Choisissez votre parcours</CardTitle>
              <p className="text-muted-foreground text-sm mt-2">
                Programme complet par chapitres ou rattrapage ciblé. Votre agent IA vous guidera, expliquera simplement, puis vous proposera des quiz.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-border rounded-2xl hover:shadow-md transition-all" onClick={() => navigate("/matieres")}>
                  <CardContent className="p-6">
                    <strong className="block mb-2">Programme complet</strong>
                    <p className="text-muted-foreground text-sm mb-4">Chapitres du MENFP pour votre niveau.</p>
                    <button className="px-4 py-2 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white rounded-md text-sm font-medium hover:opacity-90">
                      Suivre le programme
                    </button>
                  </CardContent>
                </Card>

                <Card className="border border-border rounded-2xl hover:shadow-md transition-all" onClick={() => navigate("/matieres")}>
                  <CardContent className="p-6">
                    <strong className="block mb-2">Rattrapage</strong>
                    <p className="text-muted-foreground text-sm mb-4">Révisez des matières précises.</p>
                    <button className="px-4 py-2 border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-background rounded-md text-sm font-medium hover:bg-[hsl(var(--primary))] hover:text-white transition-colors">
                      Je veux réviser
                    </button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

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
                  {recentNotes.map((note) => (
                    <div key={note.id} className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">
                            {topicInfo[note.lesson_topic]?.icon} {topicInfo[note.lesson_topic]?.title || note.lesson_topic}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {note.content}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground ml-4">
                          {formatDate(note.updated_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subjects */}
          <Card className="border-none rounded-[20px] shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-6 h-6" />
                Matières
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {subjects.map((subject) => (
                  <div 
                    key={subject.id} 
                    onClick={() => navigate(subject.path)}
                    className="p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
                  >
                    <div className="text-3xl mb-3">{subject.icon}</div>
                    <h3 className="font-bold text-foreground mb-1">{subject.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{subject.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
