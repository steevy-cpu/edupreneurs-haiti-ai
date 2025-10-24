import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  Gamepad2,
  Trophy,
  Lock,
  CheckCircle,
  Star,
  GraduationCap
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

const MathCourse = () => {
  const navigate = useNavigate();
  const [userGold, setUserGold] = useState(0);

  useEffect(() => {
    const fetchUserGold = async () => {
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
      }
    };

    fetchUserGold();
  }, []);

  // AF7 Mathematics Topics - MENFP Program (Chronological Order)
  const topics: Topic[] = [
    // December Week 1 - ENSEMBLES (NEW)
    {
      id: "ensembles",
      title: "Ensembles",
      description: "Vocabulaire, sous-ensembles, opérations (réunion, intersection, complément)",
      progress: 0,
      goldReward: 100,
      isLocked: false,
      isCompleted: false,
      icon: "🔢"
    },
    // December Weeks 1-3 - PLANS ET DROITES (NEW)
    {
      id: "plans-droites",
      title: "Plans et Droites",
      description: "Caractéristiques, droites parallèles/perpendiculaires, médiatrice",
      progress: 0,
      goldReward: 110,
      isLocked: false,
      isCompleted: false,
      icon: "📐"
    },
    // December Week 3 - NOMBRES NATURELS (NEW)
    {
      id: "nombres-naturels",
      title: "Nombres Naturels",
      description: "Opérations, priorités, chaines d'opérations, puissances entières",
      progress: 0,
      goldReward: 90,
      isLocked: false,
      isCompleted: false,
      icon: "🔢"
    },
    // Janvier - Semaine 2
    {
      id: "numeration-binaire",
      title: "Numération Binaire",
      description: "Écrire des nombres en binaire, calculer sommes et différences",
      progress: 0,
      goldReward: 80,
      isLocked: false,
      isCompleted: false,
      icon: "💻"
    },
    {
      id: "polygones",
      title: "Les Polygones",
      description: "Lignes polygonales, définition et description des polygones",
      progress: 0,
      goldReward: 100,
      isLocked: false,
      isCompleted: false,
      icon: "⬡"
    },
    {
      id: "unites-mesures",
      title: "Unités de Mesures",
      description: "Système métrique: longueur, aire, volume, masse, capacité",
      progress: 0,
      goldReward: 90,
      isLocked: false,
      isCompleted: false,
      icon: "📏"
    },
    // Janvier - Semaine 3
    {
      id: "divisibilite",
      title: "Divisibilité",
      description: "Critères de divisibilité par 2, 3, 4, 5, 9, 10, 11",
      progress: 0,
      goldReward: 100,
      isLocked: false,
      isCompleted: false,
      icon: "➗"
    },
    {
      id: "decimaux",
      title: "Décimaux",
      description: "Opérations, comparaison et ordre sur les nombres décimaux",
      progress: 0,
      goldReward: 120,
      isLocked: false,
      isCompleted: false,
      icon: "🔢"
    },
    // Février
    {
      id: "cercle-disque",
      title: "Cercle et Disque",
      description: "Définition, construction, calcul de circonférence et d'aire",
      progress: 0,
      goldReward: 110,
      isLocked: false,
      isCompleted: false,
      icon: "⭕"
    },
    {
      id: "triangles",
      title: "Les Triangles",
      description: "Définition, notation, description et construction",
      progress: 0,
      goldReward: 100,
      isLocked: false,
      isCompleted: false,
      icon: "🔺"
    },
    // Mars
    {
      id: "aires-perimetres",
      title: "Aires et Périmètres",
      description: "Calcul des aires et périmètres de triangles et quadrilatères",
      progress: 0,
      goldReward: 120,
      isLocked: false,
      isCompleted: false,
      icon: "📐"
    },
    {
      id: "proportionnalite",
      title: "Proportionnalité",
      description: "Tableaux, graphiques, pourcentages et échelles",
      progress: 0,
      goldReward: 130,
      isLocked: false,
      isCompleted: false,
      icon: "📊"
    },
    // Avril
    {
      id: "entiers-relatifs",
      title: "Entiers Relatifs",
      description: "Nombres négatifs et positifs, représentation sur un axe",
      progress: 0,
      goldReward: 110,
      isLocked: false,
      isCompleted: false,
      icon: "➕➖"
    },
    {
      id: "volumes-solides",
      title: "Volumes de Solides",
      description: "Calcul du volume et aire latérale: cube, parallélépipède, cylindre",
      progress: 0,
      goldReward: 140,
      isLocked: false,
      isCompleted: false,
      icon: "📦"
    },
    // Mai
    {
      id: "fractions",
      title: "Les Fractions",
      description: "Lecture, écriture, comparaison et opérations sur les fractions",
      progress: 0,
      goldReward: 150,
      isLocked: false,
      isCompleted: false,
      icon: "🍕"
    },
    {
      id: "parallelogrammes",
      title: "Les Parallélogrammes",
      description: "Description et construction des différents parallélogrammes",
      progress: 0,
      goldReward: 100,
      isLocked: false,
      isCompleted: false,
      icon: "◇"
    },
    {
      id: "reperage-quadrillage",
      title: "Repérage sur Quadrillage",
      description: "Chemins, coordonnées et repérage de points",
      progress: 0,
      goldReward: 110,
      isLocked: false,
      isCompleted: false,
      icon: "🗺️"
    },
    // Juin
    {
      id: "transformations",
      title: "Les Transformations",
      description: "Translation et symétrie orthogonale de figures géométriques",
      progress: 0,
      goldReward: 140,
      isLocked: false,
      isCompleted: false,
      icon: "🔄"
    },
    {
      id: "statistiques",
      title: "Statistiques Élémentaires",
      description: "Tableaux, moyennes, médianes, modes et diagrammes",
      progress: 0,
      goldReward: 150,
      isLocked: false,
      isCompleted: false,
      icon: "📈"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/matieres')}
                className="shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-bold truncate">Mathématiques 📐</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">Niveau AF7</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-accent/10 border border-accent/20">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <span className="font-bold gold-text text-sm sm:text-base">{userGold}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
        {/* Course Overview */}
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Programme MENFP - AF7</h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Suis le programme officiel du MENFP avec des leçons interactives, des jeux et des quiz! 🎮
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              16 chapitres couvrant l'algèbre, la géométrie, les mesures et les applications 📚
            </p>
          </div>
          <div className="flex-shrink-0">
            <img 
              src={ericTeaching} 
              alt="Eric - Professeur de Mathématiques" 
              className="w-40 h-40 sm:w-48 sm:h-48 object-contain animate-[float_4s_ease-in-out_infinite]"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        {/* Music Selector */}
        <div className="mb-6 sm:mb-8">
          <MusicSelector />
        </div>

        {/* Topics Grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {topics.map((topic) => (
            <Card 
              key={topic.id}
              className={`p-4 sm:p-6 transition-all ${
                topic.isLocked 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:shadow-lg cursor-pointer hover:-translate-y-1'
              }`}
              onClick={() => !topic.isLocked && navigate(`/math-lesson/${topic.id}`)}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-3xl sm:text-5xl shrink-0">{topic.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold">{topic.title}</h3>
                    {topic.isLocked && <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />}
                    {topic.isCompleted && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success shrink-0" />}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    {topic.description}
                  </p>

                  {/* Progress Bar */}
                  {!topic.isLocked && topic.progress > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progression</span>
                        <span className="text-sm font-bold">{topic.progress}%</span>
                      </div>
                      <Progress value={topic.progress} />
                    </div>
                  )}

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="gap-1">
                      <BookOpen className="w-3 h-3" />
                      Leçon
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Gamepad2 className="w-3 h-3" />
                      Jeux
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Star className="w-3 h-3" />
                      Quiz
                    </Badge>
                  </div>

                  {/* Gold Reward */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold gold-text">+{topic.goldReward} gold</span>
                    </div>
                    {!topic.isLocked && (
                      <Button size="sm">
                        {topic.progress > 0 ? 'Continuer' : 'Commencer'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Progress Summary */}
        <Card className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Ton Progrès Global</h3>
              <p className="text-muted-foreground">Continue à travailler pour débloquer tous les chapitres!</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-1">
                {Math.round(topics.reduce((acc, t) => acc + t.progress, 0) / topics.length)}%
              </div>
              <p className="text-sm text-muted-foreground">Complété</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MathCourse;
