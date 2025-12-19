import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingTour } from "@/components/OnboardingTour";
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
} from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { WeeklyActivityChart } from "@/components/dashboard/WeeklyActivityChart";
import { SubjectProgressChart } from "@/components/dashboard/SubjectProgressChart";
import { Progress } from "@/components/ui/progress";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { getAvatarUrl } from "@/lib/avatarMap";
import { ThemeToggle } from "@/components/ThemeToggle";

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

const checkContentEditorAccess = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data } = await supabase
    .from("content_editor_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  
  return !!data;
};

const restartOnboardingTour = () => {
  localStorage.removeItem("onboarding_completed");
  sessionStorage.setItem("restart_onboarding", "true");
  window.location.reload();
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "Utilisateur",
  });
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [goldEarned, setGoldEarned] = useState<number>(0);
  const [userId, setUserId] = useState<string>("");
  const [isContentEditor, setIsContentEditor] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  
  const { showPrompt, isIOS, installApp, dismissPrompt } = usePWAInstall();
  const { analytics, isLoading: analyticsLoading } = useDashboardAnalytics(userId || null);

  useEffect(() => {
    fetchUserData();
    fetchRecentNotes();
    fetchGoldEarned();
    checkContentEditorAccessWrapper();
    fetchLeaderboard();
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      }
    });
  }, []);

  const checkContentEditorAccessWrapper = async () => {
    const hasAccess = await checkContentEditorAccess();
    setIsContentEditor(hasAccess);
  };

  const fetchGoldEarned = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("gold_earned")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setGoldEarned(data.gold_earned || 0);
    }
  };

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("user_id", session.user.id)
        .single();

      const userName = profile?.nickname || session.user.email?.split("@")[0] || "Utilisateur";
      setUserData({ name: userName });
    }
  };

  const fetchRecentNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);

      if (data && !error) {
        setRecentNotes(data);
      }
    } catch (error) {
      // Silent fail - notes are not critical
    }
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    
    const { data: topUsers, error } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, nickname, avatar_url, gold_earned, academic_grade")
      .eq("is_system_account", false)
      .order("gold_earned", { ascending: false })
      .limit(5);

    if (error) {
      setLeaderboardLoading(false);
      return;
    }

    const rankedUsers = topUsers?.map((user, index) => ({
      ...user,
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

  return (
    <Layout>
      <Helmet>
        <title>Tableau de bord - Edupreneurs</title>
        <meta name="description" content="Suivez votre progression d'apprentissage, vos statistiques et vos objectifs avec le tableau de bord Edupreneurs." />
        <meta property="og:title" content="Tableau de bord - Edupreneurs" />
        <meta property="og:description" content="Suivez votre progression d'apprentissage avec Edupreneurs." />
      </Helmet>
      <OnboardingTour />
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
                Bienvenue, <span className="break-words">{userData.name}</span>!
              </h2>
              <p className="text-[11px] xs:text-xs sm:text-sm lg:text-base opacity-75 leading-relaxed">
                Continuez votre apprentissage personnalisé avec Eric, votre assistant IA
              </p>
            </div>
          </div>

          {/* Notification & PWA Banners */}
          {userId && <NotificationPermissionBanner userId={userId} />}
          {showPrompt && (
            <PWAInstallPrompt
              isIOS={isIOS}
              onInstall={installApp}
              onDismiss={dismissPrompt}
            />
          )}

          {/* Passion Discovery Banner */}
          <Link to="/passion-discovery">
            <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl mb-4 hover:border-purple-500/70 transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-shrink-0 text-4xl">🎨</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">
                    NOUVEAU : Découvre ta passion & Développement personnel
                    <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-1 rounded-full">TEST</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Explore la musique, les arts, les échecs, l'éducation civique et le développement personnel avec Eric en IA
                  </p>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                    Tester la version interactive →
                  </button>
                </div>
              </CardContent>
            </Card>
          </Link>

          {isContentEditor && (
            <Link to="/content-editor">
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-full">
                      <Edit3 className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Éditeur de Contenu</h3>
                      <p className="text-sm text-muted-foreground">Gérer et créer du contenu</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Test Onboarding Button - Only for specific account */}
          {userId === "48d1e98c-a62c-4d46-ba89-b5bf3faa44be" && (
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <CardContent className="p-6">
                <button
                  onClick={restartOnboardingTour}
                  className="w-full flex items-center gap-4 text-left hover:opacity-80 transition-opacity"
                >
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <Sparkles className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">🎓 Tester le guide</h3>
                    <p className="text-sm text-muted-foreground">Relancer la visite guidée</p>
                  </div>
                </button>
              </CardContent>
            </Card>
          )}

          {/* Analytics Widgets */}
          <div data-tour="analytics-widgets" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

          {/* KPI Cards */}
          <div data-tour="kpi-cards" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-none rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white mx-auto mb-3">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-br from-yellow-500 to-orange-600 bg-clip-text text-transparent mb-1">
                  {goldEarned}
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

          {/* Charts Section */}
          <div data-tour="charts-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <WeeklyActivityChart data={analytics.weeklyActivity} />
            <SubjectProgressChart data={analytics.subjectProgress} />
          </div>

          {/* Insights and Achievements */}
          <div className="space-y-6 mb-8">
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
                  <div className="flex flex-col items-center p-4 rounded-lg border transition-all bg-muted/50 border-muted opacity-50">
                    <Star className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-xs font-medium text-center mb-1">Première Leçon</p>
                    <p className="text-xs text-muted-foreground text-center">Complète ta première leçon</p>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-lg border transition-all bg-muted/50 border-muted opacity-50">
                    <Award className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-xs font-medium text-center mb-1">Apprenant Assidu</p>
                    <p className="text-xs text-muted-foreground text-center">Complète 10 leçons</p>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-lg border transition-all bg-muted/50 border-muted opacity-50">
                    <Trophy className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-xs font-medium text-center mb-1">Maître</p>
                    <p className="text-xs text-muted-foreground text-center">Complète 50 leçons</p>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-lg border transition-all bg-muted/50 border-muted opacity-50">
                    <Flame className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-xs font-medium text-center mb-1">Éclair</p>
                    <p className="text-xs text-muted-foreground text-center">Complète 100 leçons</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard Section */}
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
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
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

          {/* Choose Your Path Section */}
          <Card data-tour="parcours-section" className="border-none rounded-[20px] shadow-md mb-8">
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

                <Card className="border border-border rounded-2xl hover:shadow-md transition-all" onClick={() => navigate("/resources")}>
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
          {recentNotes.length > 0 && (
            <Card className="border-none rounded-[20px] shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Notes récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

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
    </Layout>
  );
};

export default Dashboard;
