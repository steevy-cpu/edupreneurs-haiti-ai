import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle,
  Star,
  GraduationCap,
  Palette,
  Music,
  Heart
} from "lucide-react";
import ericTeaching from "@/assets/eric-chair-desk.avif";
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
        // Fetch user gold
        const { data: profile } = await supabase
          .from('profiles')
          .select('gold_earned')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setUserGold(profile.gold_earned || 0);
        }

        // Fetch completed lessons
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

  // Arts & Culture Topics for 7AF
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => navigate("/matieres")} 
              variant="ghost" 
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Retour</span>
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full border border-yellow-500/30">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-foreground">{userGold}</span>
              </div>
              <MusicSelector />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 mb-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-pink-500/20">
                <Palette className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Arts & Culture
                </h1>
                <p className="text-muted-foreground mt-1">7ème Année Fondamentale (7AF)</p>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Découvre la richesse des arts et de la culture haïtienne ! 🎨 Explore l'art plastique, 
              la musique traditionnelle et le patrimoine culturel immatériel d'Haïti reconnu par l'UNESCO.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progression du cours</span>
                <span className="font-semibold text-foreground">{Math.round(totalProgress)}%</span>
              </div>
              <Progress value={totalProgress} className="h-3" />
            </div>

            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <BookOpen className="w-4 h-4 mr-2" />
                {topics.length} Leçons
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <GraduationCap className="w-4 h-4 mr-2" />
                Niveau 7AF
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Heart className="w-4 h-4 mr-2" />
                Culture Haïtienne
              </Badge>
            </div>
          </div>

          <div className="flex-shrink-0 lg:w-96">
            <img 
              src={ericTeaching}
              alt="Eric enseignant les arts" 
              className="w-full h-auto rounded-3xl shadow-2xl border-4 border-border/50"
            />
          </div>
        </div>

        {/* Topics Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full" />
            Les Leçons du Cours
          </h2>

          <div className="grid gap-4">
            {topics.map((topic, index) => (
              <Card 
                key={topic.id}
                className={`group relative overflow-hidden transition-all duration-300 ${
                  topic.isLocked 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:shadow-xl hover:scale-[1.02] cursor-pointer'
                } ${
                  topic.isCompleted 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : 'border-border/50'
                }`}
                onClick={() => handleTopicClick(topic.id, topic.isLocked)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                        topic.isCompleted 
                          ? 'bg-green-500/20 ring-2 ring-green-500/50' 
                          : 'bg-gradient-to-br from-orange-500/20 to-pink-500/20'
                      }`}>
                        {topic.isCompleted ? (
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        ) : (
                          topic.icon
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-orange-500 transition-colors">
                            {topic.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {topic.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
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
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Terminé
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Course Info */}
        <Card className="mt-8 p-6 bg-gradient-to-br from-orange-500/10 to-pink-500/10 border-orange-500/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-orange-500/20">
              <Music className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                À propos du cours Arts & Culture
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Ce cours explore la richesse artistique et culturelle d'Haïti, première République noire indépendante. 
                Tu découvriras l'art plastique haïtien mondialement reconnu, la musique traditionnelle et ses rythmes 
                uniques, ainsi que le patrimoine culturel immatériel inscrit à l'UNESCO comme la Soupe Joumou.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ArtsCourse;
