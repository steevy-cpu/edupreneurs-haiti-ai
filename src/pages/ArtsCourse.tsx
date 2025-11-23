import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2,
  Sparkles,
  Palette,
  Music,
  TrendingUp,
  Target
} from "lucide-react";
import ericThumbUp from "@/assets/eric-thumb-up.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { MusicSelector } from "@/components/MusicSelector";

interface Topic {
  id: string;
  title: string;
  description: string;
  progress: number;
  goldReward: number;
  isLocked: boolean;
  isCompleted: boolean;
  icon: string;
}

const ArtsCourse = () => {
  const navigate = useNavigate();
  const [userGold, setUserGold] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('gold_earned')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setUserGold(profile.gold_earned || 0);
        }

        const { data: completions } = await supabase
          .from('lesson_completions')
          .select('lesson_slug')
          .eq('user_id', user.id)
          .eq('subject', 'arts');

        if (completions) {
          setCompletedLessons(new Set(completions.map(c => c.lesson_slug)));
        }
      }
    };

    fetchUserData();
  }, []);

  const topics: Topic[] = [
    {
      id: "introduction-arts-plastiques-haitiens",
      title: "Introduction aux Arts Plastiques Haïtiens",
      description: "Histoire de l'art haïtien, grands maîtres, courants artistiques (naïf, vodou, contemporain), techniques de base",
      progress: 0,
      goldReward: 100,
      isLocked: false,
      isCompleted: completedLessons.has("introduction-arts-plastiques-haitiens"),
      icon: "🎨"
    },
    {
      id: "musique-traditionnelle-haitienne",
      title: "La Musique Traditionnelle Haïtienne",
      description: "Instruments traditionnels (tambours, tchatcha, vaksin), genres musicaux (vodou, compas, rara, twoubadou), rythmes de base",
      progress: 0,
      goldReward: 110,
      isLocked: false,
      isCompleted: completedLessons.has("musique-traditionnelle-haitienne"),
      icon: "🎵"
    },
    {
      id: "patrimoine-culturel-immateriel-haiti",
      title: "Le Patrimoine Culturel Immatériel d'Haïti",
      description: "Traditions reconnues par l'UNESCO (Soupe Joumou), vodou haïtien, contes et proverbes, danses traditionnelles, artisanat",
      progress: 0,
      goldReward: 120,
      isLocked: false,
      isCompleted: completedLessons.has("patrimoine-culturel-immateriel-haiti"),
      icon: "🇭🇹"
    }
  ];

  const totalProgress = topics.length > 0 
    ? (topics.filter(t => t.isCompleted).length / topics.length) * 100 
    : 0;

  const handleTopicClick = (topicId: string, isLocked: boolean) => {
    if (!isLocked) {
      navigate(`/arts-lesson/${topicId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-500/5">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => navigate("/matieres")} 
              variant="ghost"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-semibold">Retour</span>
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full border border-yellow-500/30">
                <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-foreground">{userGold}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        {/* Hero Section with Eric */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <Badge variant="secondary" className="text-sm font-medium px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
              Programme MENFP - 7ème Année Fondamentale
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
              Arts & Culture
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Découvre la richesse des arts et de la culture haïtienne ! 🎨 Explore l'art plastique, 
              la musique traditionnelle et le patrimoine culturel immatériel d'Haïti.
            </p>

            {/* Progress Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Votre Progression
                  </CardTitle>
                  <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/50">
                    {Math.round(totalProgress)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={totalProgress} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {topics.filter(t => t.isCompleted).length} sur {topics.length} leçons complétées
                  </span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {topics.length - topics.filter(t => t.isCompleted).length} restantes
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="px-4 py-2 border-purple-300 dark:border-purple-700">
                <Palette className="w-4 h-4 mr-2" />
                {topics.length} Leçons
              </Badge>
              <Badge variant="outline" className="px-4 py-2 border-fuchsia-300 dark:border-fuchsia-700">
                <Target className="w-4 h-4 mr-2" />
                Programme 7AF
              </Badge>
            </div>
          </div>

          {/* Eric Image */}
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-fuchsia-400/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-950/50 dark:to-fuchsia-950/50 rounded-3xl p-8 border-2 border-purple-200 dark:border-purple-800 shadow-2xl">
              <img 
                src={ericThumbUp}
                alt="Eric enseignant les arts" 
                className="w-full h-auto rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>

        <MusicSelector />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-fade-in">
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-purple-200 dark:border-purple-800">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Leçons
                </CardTitle>
                <BookOpen className="w-5 h-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                {topics.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Culture haïtienne</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-fuchsia-200 dark:border-fuchsia-800">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-transparent"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Leçons Complétées
                </CardTitle>
                <CheckCircle2 className="w-5 h-5 text-fuchsia-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                {topics.filter(t => t.isCompleted).length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Continue comme ça !</p>
            </CardContent>
          </Card>
        </div>

        {/* Topics Grid */}
        <div className="space-y-8 animate-fade-in">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Music className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            Les Leçons du Cours
          </h2>

          <div className="grid gap-6">
            {topics.map((topic, index) => (
              <Card 
                key={topic.id}
                className={`group cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  topic.isLocked 
                    ? 'opacity-60 cursor-not-allowed border-border/30' 
                    : topic.isCompleted 
                      ? 'border-green-400 dark:border-green-600 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30'
                      : 'border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/30'
                }`}
                onClick={() => handleTopicClick(topic.id, topic.isLocked)}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform ${
                      topic.isCompleted 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                        : 'bg-gradient-to-br from-purple-500 to-fuchsia-500'
                    }`}>
                      {topic.isCompleted ? (
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      ) : (
                        topic.icon
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {topic.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {topic.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                            <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-semibold text-yellow-400">+{topic.goldReward}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <Badge variant={topic.isCompleted ? "default" : "secondary"} className="text-xs">
                          Leçon {index + 1}
                        </Badge>
                        {topic.isCompleted && (
                          <Badge variant="outline" className="text-xs border-green-500/50 text-green-500">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Terminé
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    className={`w-full text-white shadow-lg group-hover:shadow-xl transition-all duration-300 ${
                      topic.isCompleted
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                        : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700'
                    }`}
                    disabled={topic.isLocked}
                  >
                    {topic.isCompleted ? 'Réviser' : 'Commencer'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtsCourse;
