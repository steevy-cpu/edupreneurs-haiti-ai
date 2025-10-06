import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Coins,
  ChartLine,
  CreditCard,
  UserCheck,
  BookOpen,
  Calendar
} from "lucide-react";
import ericThumbsUp from "@/assets/eric-thumbs-up.png";

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

  useEffect(() => {
    fetchUserData();
    fetchRecentNotes();
    fetchGoldEarned();
  }, []);

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
        {/* Welcome Header */}
        <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[20px] mb-4 sm:mb-6 lg:mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <div className="w-full h-full bg-gradient-radial from-white/20 to-transparent animate-[float_20s_ease-in-out_infinite]" />
          </div>
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-1 sm:mb-2">
                Bienvenue, <span>{userData.name}</span>!
              </h2>
              <p className="text-xs sm:text-sm lg:text-base opacity-75 leading-relaxed">
                Continuez votre apprentissage personnalisé avec Eric, votre assistant IA
              </p>
            </div>
            <img 
              src={ericThumbsUp} 
              alt="Eric vous encourage" 
              className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 object-contain animate-[float_3s_ease-in-out_infinite] hidden sm:block"
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-5 mb-4 sm:mb-6 lg:mb-8">
          <Card className="border-none rounded-xl sm:rounded-2xl lg:rounded-[20px] shadow-md hover:shadow-lg hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-3 sm:p-5 lg:p-7 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(25_100%_50%)] flex items-center justify-center text-white text-base sm:text-xl lg:text-2xl mx-auto mb-1.5 sm:mb-2 lg:mb-4">
                <Coins className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] bg-clip-text text-transparent mb-0.5 sm:mb-1 lg:mb-2">
                {goldEarned}
              </div>
              <div className="text-[10px] sm:text-xs lg:text-sm font-semibold text-muted-foreground">Golds gagnés</div>
            </CardContent>
          </Card>

          <Card className="border-none rounded-xl sm:rounded-2xl lg:rounded-[20px] shadow-md hover:shadow-lg hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-3 sm:p-5 lg:p-7 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] flex items-center justify-center text-white text-base sm:text-xl lg:text-2xl mx-auto mb-1.5 sm:mb-2 lg:mb-4">
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] bg-clip-text text-transparent mb-0.5 sm:mb-1 lg:mb-2">
                {userData.affiliations}
              </div>
              <div className="text-[10px] sm:text-xs lg:text-sm font-semibold text-muted-foreground">Affiliations</div>
            </CardContent>
          </Card>

          <Card className="border-none rounded-xl sm:rounded-2xl lg:rounded-[20px] shadow-md hover:shadow-lg hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-3 sm:p-5 lg:p-7 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-[hsl(var(--success))] to-[hsl(160_84%_32%)] flex items-center justify-center text-white text-base sm:text-xl lg:text-2xl mx-auto mb-1.5 sm:mb-2 lg:mb-4">
                <ChartLine className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] bg-clip-text text-transparent mb-0.5 sm:mb-1 lg:mb-2">
                {userData.progress}%
              </div>
              <div className="text-[10px] sm:text-xs lg:text-sm font-semibold text-muted-foreground">Progression</div>
            </CardContent>
          </Card>

          <Card className="border-none rounded-xl sm:rounded-2xl lg:rounded-[20px] shadow-md hover:shadow-lg hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-3 sm:p-5 lg:p-7 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-[hsl(262_83%_58%)] to-[hsl(262_83%_50%)] flex items-center justify-center text-white text-base sm:text-xl lg:text-2xl mx-auto mb-1.5 sm:mb-2 lg:mb-4">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
              <div className="text-base sm:text-xl lg:text-2xl xl:text-3xl font-extrabold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] bg-clip-text text-transparent mb-0.5 sm:mb-1 lg:mb-2">
                200 HTG
              </div>
              <div className="text-[10px] sm:text-xs lg:text-sm font-semibold text-muted-foreground">Abonnement / mois</div>
            </CardContent>
          </Card>
        </div>

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
                <strong>Astuce:</strong> commencez par « Nombres entiers » en Mathématiques (7e). Cliquez sur « Lire la leçon ».
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border border-border rounded-2xl hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <strong className="block mb-2">Nombres entiers — Lecture</strong>
                    <p className="text-muted-foreground text-sm mb-4">
                      Explications simples avec schémas.
                    </p>
                    <Button 
                      className="w-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] hover:opacity-90"
                      onClick={() => navigate("/math-lesson/integers")}
                    >
                      Lire la leçon
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-border rounded-2xl hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <strong className="block mb-2">Nombres entiers — Quiz</strong>
                    <p className="text-muted-foreground text-sm mb-4">
                      Vérifiez votre compréhension et gagnez des golds.
                    </p>
                    <Button 
                      variant="outline"
                      className="w-full border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white"
                      onClick={() => navigate("/math-lesson/integers")}
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
