import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    .single();
  
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
      console.error("Error fetching notes:", error);
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
      console.error("Error fetching leaderboard:", error);
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

  const getRankIcon = (rank: number) => {
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
  };

  const getRankBgColor = (rank: number) => {
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
  };

  const topicInfo: { [key: string]: { title: string; icon: string } } = {
    "numeration-binaire": { title: "Numération Binaire", icon: "💻" },
    "polygones": { title: "Les Polygones", icon: "⬡" },
    "divisibilite": { title: "Divisibilité", icon: "➗" },
    "decimaux": { title: "Décimaux", icon: "🔢" },
    "cercle-disque": { title: "Cercle et Disque", icon: "⭕" },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  const subjects = [
    { id: "math", name: "Mathématiques", icon: "🔢", description: "Algèbre, géométrie et calcul" },
    { id: "french", name: "Français", icon: "🇫🇷", description: "Grammaire et littérature" },
    { id: "science", name: "Sciences", icon: "🔬", description: "Physique, chimie et biologie" },
    { id: "history", name: "Histoire", icon: "📜", description: "Histoire d'Haïti et mondiale" },
  ];

  return (
    <Layout>
      <OnboardingTour />
      <div className="min-h-screen bg-gray-950">
        <div className="container mx-auto px-4 py-6 space-y-8 pb-24">
          {/* Welcome Header */}
          <div data-tour="welcome-header" className="relative bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-8 overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-white mb-2">
                Bienvenue, {userData.name}!
              </h1>
              <p className="text-white/90 text-lg">
                Continuez votre apprentissage personnalisé avec Eric, votre assistant IA
              </p>
            </div>
            <div className="absolute right-0 bottom-0 w-48 h-48 opacity-20">
              <img 
                src="/src/assets/eric-waving.png" 
                alt="Eric" 
                className="w-full h-full object-contain"
              />
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
            <Card className="border-2 border-purple-500/50 hover:border-purple-500/70 transition-all cursor-pointer bg-gray-900/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🎨</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        NOUVEAU: Découvre ta passion & Développement personnel
                      </h3>
                      <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded">TEST</span>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Explore la musique, les arts, les échecs, l'éducation civique et le développement personnel avec Eric en IA
                    </p>
                    <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:opacity-90 transition-opacity">
                      Tester la version interactive →
                    </button>
                  </div>
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
          <div data-tour="analytics-widgets" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Learning Streak */}
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-orange-500/20 rounded-full">
                    <Flame className="w-8 h-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Série d'apprentissage</p>
                    <p className="text-3xl font-bold text-white">
                      {analytics.streak} {analytics.streak === 1 ? "jour" : "jours"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Goal */}
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <Target className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Objectif Hebdomadaire</p>
                    <p className="text-2xl font-bold text-white">
                      {analytics.weeklyGoal.current} / {analytics.weeklyGoal.target} leçons
                    </p>
                  </div>
                </div>
                <Progress 
                  value={Math.min((analytics.weeklyGoal.current / analytics.weeklyGoal.target) * 100, 100)} 
                  className="h-2 bg-gray-700" 
                />
              </CardContent>
            </Card>

            {/* Study Time */}
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <Clock className="w-8 h-8 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Temps d'étude</p>
                    <p className="text-3xl font-bold text-white">
                      {Math.floor(analytics.studyTimeThisWeek / 60)}h {analytics.studyTimeThisWeek % 60}min
                    </p>
                    <p className="text-xs text-gray-400">Cette semaine</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KPI Cards */}
          <div data-tour="kpi-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900/50 border-gray-800/50 hover:bg-gray-900/70 transition-all backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-500 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <p className="text-4xl font-bold text-white mb-1">{goldEarned}</p>
                <p className="text-sm text-gray-400">Golds gagnés</p>
                <p className="text-xs text-gray-500">+0 cette semaine</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800/50 hover:bg-gray-900/70 transition-all backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <p className="text-4xl font-bold text-white mb-1">{analytics.totalLessonsCompleted}</p>
                <p className="text-sm text-gray-400">Leçons complétées</p>
                <p className="text-xs text-gray-500">0 cette semaine</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800/50 hover:bg-gray-900/70 transition-all backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-2xl flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <p className="text-4xl font-bold text-white mb-1">{analytics.averageScore}%</p>
                <p className="text-sm text-gray-400">Score moyen</p>
                <p className="text-xs text-gray-500">Continue! 💪</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800/50 hover:bg-gray-900/70 transition-all backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-500 rounded-2xl flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <p className="text-4xl font-bold text-white mb-1">{Math.round(analytics.studyTimeThisWeek / 60)}h</p>
                <p className="text-sm text-gray-400">Temps d'étude</p>
                <p className="text-xs text-gray-500">Cette semaine</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div data-tour="charts-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeeklyActivityChart data={analytics.weeklyActivity} />
            <SubjectProgressChart data={analytics.subjectProgress} />
          </div>

          {/* Leaderboard Section */}
          <Card data-tour="leaderboard-section" className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Classement
              </CardTitle>
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
          <Card data-tour="parcours-section" className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <GraduationCap className="w-6 h-6" />
                Choisissez votre parcours
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all cursor-pointer bg-gray-800/50" onClick={() => navigate("/matieres")}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Programme complet</h3>
                  <p className="text-sm text-gray-400">
                    Explorez toutes les matières et leçons disponibles
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-secondary/20 hover:border-secondary/40 transition-all cursor-pointer bg-gray-800/50" onClick={() => navigate("/resources")}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Révisions</h3>
                  <p className="text-sm text-gray-400">
                    Révisez vos leçons et préparez vos examens
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Recent Notes */}
          {recentNotes.length > 0 && (
            <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
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
          <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Star className="w-6 h-6" />
                Matières
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {subjects.map((subject) => (
                  <div key={subject.id} className="p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg hover:shadow-lg transition-all cursor-pointer">
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
