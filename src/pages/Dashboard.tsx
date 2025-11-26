import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Coins,
  ChartLine,
  CreditCard,
  UserCheck,
  BookOpen,
  Calendar,
  Trophy,
  Award,
  Target
} from "lucide-react";
import ericThumbsUp from "@/assets/eric-main01.png";
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { LearningStreakWidget } from "@/components/dashboard/LearningStreakWidget";
import { WeeklyGoalWidget } from "@/components/dashboard/WeeklyGoalWidget";
import { StudyTimeWidget } from "@/components/dashboard/StudyTimeWidget";
import { WeeklyActivityChart } from "@/components/dashboard/WeeklyActivityChart";
import { SubjectProgressChart } from "@/components/dashboard/SubjectProgressChart";
import { LearningInsightsPanel } from "@/components/dashboard/LearningInsightsPanel";
import { AchievementsBadges } from "@/components/dashboard/AchievementsBadges";

interface Note {
  id: string;
  lesson_topic: string;
  content: string;
  updated_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "Utilisateur",
    gold: 0,
    level: 1,
    progress: 0,
    affiliations: 0,
  });
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);

  const [goldEarned, setGoldEarned] = useState<number>(0);

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isContentEditor, setIsContentEditor] = useState(false);
  
  // PWA Install hook
  const { showPrompt, isIOS, installApp, dismissPrompt } = usePWAInstall();
  
  // Analytics hook
  const { analytics, isLoading: analyticsLoading } = useDashboardAnalytics(currentUserId || null);

  useEffect(() => {
    fetchUserData();
    fetchRecentNotes();
    fetchGoldEarned();
    checkContentEditorAccess();
    
    // Get current user ID for notification dialog
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
      }
    });
  }, []);

  const checkContentEditorAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: editorRole } = await supabase
      .from('content_editor_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    setIsContentEditor(editorRole && ['admin', 'editor'].includes(editorRole.role));
  };

  const fetchGoldEarned = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('gold_earned')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setGoldEarned(data.gold_earned || 0);
    }
  };

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Fetch nickname from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('user_id', session.user.id)
        .single();

      const userName = profile?.nickname || session.user.email?.split("@")[0] || "Utilisateur";
      setUserData(prev => ({ ...prev, name: userName }));
    }
  };

  const fetchRecentNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (data && !error) {
        setRecentNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const topicInfo: { [key: string]: { title: string; icon: string } } = {
    "numeration-binaire": { title: "Numération Binaire", icon: "💻" },
    "polygones": { title: "Les Polygones", icon: "⬡" },
    "unites-mesures": { title: "Unités de Mesures", icon: "📏" },
    "divisibilite": { title: "Divisibilité", icon: "➗" },
    "decimaux": { title: "Décimaux", icon: "🔢" },
    "cercle-disque": { title: "Cercle et Disque", icon: "⭕" },
    "triangles": { title: "Les Triangles", icon: "🔺" },
    "aires-perimetres": { title: "Aires et Périmètres", icon: "📐" },
    "proportionnalite": { title: "Proportionnalité", icon: "📊" },
    "entiers-relatifs": { title: "Entiers Relatifs", icon: "➕➖" },
    "volumes-solides": { title: "Volumes de Solides", icon: "📦" },
    "fractions": { title: "Les Fractions", icon: "🍕" },
    "parallelogrammes": { title: "Les Parallélogrammes", icon: "◇" },
    "reperage-quadrillage": { title: "Repérage sur Quadrillage", icon: "🗺️" },
    "transformations": { title: "Les Transformations", icon: "🔄" },
    "statistiques": { title: "Statistiques Élémentaires", icon: "📈" }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const subjects = [
    { id: "math", name: "Mathématiques", icon: "🔢", progress: 45, description: "Algèbre, géométrie et calcul" },
    { id: "french", name: "Français", icon: "🇫🇷", progress: 60, description: "Grammaire, conjugaison et littérature" },
    { id: "science", name: "Sciences", icon: "🔬", progress: 30, description: "Physique, chimie et biologie" },
    { id: "history", name: "Histoire", icon: "📜", progress: 20, description: "Histoire d'Haïti et mondiale" },
  ];

  return (
    <div className="pt-14 sm:pt-16 px-3 sm:px-4 lg:px-8 pb-8 sm:pb-12">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        
        {/* Notification Permission Banner */}
        {currentUserId && <NotificationPermissionBanner userId={currentUserId} />}
        
        {/* PWA Install Banner */}
        {showPrompt && (
          <PWAInstallPrompt
            isIOS={isIOS}
            onInstall={installApp}
            onDismiss={dismissPrompt}
          />
        )}
        
        {/* Welcome Header */}
        <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-3 xs:p-4 sm:p-6 lg:p-8 rounded-xl xs:rounded-2xl sm:rounded-[20px] mb-3 xs:mb-4 sm:mb-6 lg:mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <div className="w-full h-full bg-gradient-radial from-white/20 to-transparent animate-[float_20s_ease-in-out_infinite]" />
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

        {/* Content Editor Access (Only for editors/admins) */}
        {isContentEditor && (
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl mb-4">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-shrink-0 text-4xl">✏️</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  Éditeur de Contenu
                  <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">ÉDITEUR</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Créez et gérez le contenu des cours avec l'assistance de l'IA
                </p>
                <Button 
                  onClick={() => navigate("/content-editor")}
                  className="bg-gradient-to-r from-primary to-purple-500 hover:opacity-90"
                >
                  Accéder à l'éditeur →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TEST: Passion Discovery Section */}
        <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl mb-4">
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
              <Button 
                onClick={() => navigate("/passion-test")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              >
                Tester la version interactive →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Header Section */}
        {analyticsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <LearningStreakWidget streak={analytics.streak} />
            <WeeklyGoalWidget current={analytics.weeklyGoal.current} target={analytics.weeklyGoal.target} />
            <StudyTimeWidget weeklyMinutes={analytics.studyTimeThisWeek} monthlyMinutes={analytics.studyTimeThisMonth} />
          </div>
        )}

        {/* Enhanced KPI Cards */}
        {analyticsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-tour="stats-section">
            <Card className="border-none rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white mx-auto mb-3">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-br from-yellow-500 to-orange-600 bg-clip-text text-transparent mb-1">
                  {goldEarned}
                </div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">Golds gagnés</div>
                <p className="text-xs text-muted-foreground">
                  +{analytics.weeklyLessons * 10} cette semaine
                </p>
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
                <p className="text-xs text-muted-foreground">
                  {analytics.weeklyLessons} cette semaine
                </p>
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
                <p className="text-xs text-muted-foreground">
                  {analytics.averageScore >= 80 ? "Excellent! 🎯" : "Continue! 💪"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white mx-auto mb-3">
                  <Target className="w-6 h-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-br from-purple-500 to-purple-700 bg-clip-text text-transparent mb-1">
                  {Math.floor(analytics.studyTimeThisWeek / 60)}h
                </div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">Temps d'étude</div>
                <p className="text-xs text-muted-foreground">
                  Cette semaine
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        {analyticsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <WeeklyActivityChart data={analytics.weeklyActivity} />
            <SubjectProgressChart data={analytics.subjectProgress} />
          </div>
        )}

        {/* Learning Insights & Achievements */}
        {!analyticsLoading && (
          <div className="space-y-6 mb-8">
            <LearningInsightsPanel analytics={analytics} />
            <AchievementsBadges 
              achievements={analytics.achievements} 
              totalLessons={analytics.totalLessonsCompleted}
            />
          </div>
        )}

        {/* Parcours */}
        <Card className="border-none rounded-[20px] shadow-md mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Choisissez votre parcours</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Programme complet par chapitres ou rattrapage ciblé. Votre agent IA vous guidera, expliquera simplement, puis vous proposera des quiz.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border border-border rounded-2xl hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <strong className="block mb-2">Programme complet</strong>
                  <p className="text-muted-foreground text-sm mb-4">
                    Chapitres du MENFP pour votre niveau.
                  </p>
                  <Button 
                    className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] hover:opacity-90"
                    onClick={() => navigate("/math-course")}
                  >
                    Suivre le programme
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border rounded-2xl hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <strong className="block mb-2">Rattrapage</strong>
                  <p className="text-muted-foreground text-sm mb-4">
                    Révisez des matières précises.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white"
                    onClick={() => navigate("/math-course")}
                  >
                    Je veux réviser
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Recent Notes Section */}
        {recentNotes.length > 0 && (
          <Card className="border-none rounded-[20px] shadow-md mb-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="text-primary" size={20} />
                Mes notes récentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotes.map((note) => {
                const topic = topicInfo[note.lesson_topic];
                return (
                  <div
                    key={note.id}
                    className="border border-border rounded-2xl p-4 bg-gradient-to-br from-muted/30 to-card hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/math-lesson/${note.lesson_topic}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{topic?.icon || "📝"}</span>
                          <h5 className="text-sm font-bold truncate">
                            {topic?.title || note.lesson_topic}
                          </h5>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {note.content.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Calendar size={12} />
                        {formatDate(note.updated_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Subjects and Featured */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subjects */}
          <Card className="border-none rounded-[20px] shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Matières (MENFP)</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/matieres")}
                className="text-primary hover:text-primary"
              >
                Voir tout →
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="border border-border rounded-2xl p-5 bg-gradient-to-br from-muted/30 to-card hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => navigate("/math-course")}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{subject.icon}</span>
                    <h5 className="text-lg font-bold">{subject.name}</h5>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{subject.description}</p>
                  <Progress value={subject.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">{subject.progress}% complété</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Featured */}
          <Card className="border-none rounded-[20px] shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">À la une pour votre niveau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4 text-sm text-amber-800 dark:text-amber-200">
                <strong>Astuce:</strong> commencez par « Décimaux » en Mathématiques (7e). Cliquez sur « Lire la leçon ».
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border border-border rounded-2xl hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <strong className="block mb-2">Décimaux — Lecture</strong>
                    <p className="text-muted-foreground text-sm mb-4">
                      Explications simples avec schémas.
                    </p>
                    <Button 
                      className="w-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] hover:opacity-90"
                      onClick={() => navigate("/math-lesson/decimaux")}
                    >
                      Lire la leçon
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-border rounded-2xl hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <strong className="block mb-2">Décimaux — Quiz</strong>
                    <p className="text-muted-foreground text-sm mb-4">
                      Vérifiez votre compréhension et gagnez des golds.
                    </p>
                    <Button 
                      variant="outline"
                      className="w-full border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white"
                      onClick={() => navigate("/math-lesson/decimaux")}
                    >
                      Passer le quiz
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
};

export default Dashboard;
