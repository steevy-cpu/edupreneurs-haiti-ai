import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import ericMath from "@/assets/eric-math.png";
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
          .eq('subject', 'mathematiques');

        if (completions) {
          setCompletedLessons(new Set(completions.map(c => c.lesson_slug)));
        }
      }
    };

    fetchUserData();
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-to-r from-blue-600 to-indigo-700 text-primary-foreground shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/matieres')}
                className="shrink-0 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Mathématiques</h1>
                  <p className="text-sm text-primary-foreground/80">7ème Année Fondamentale</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20">
                <Trophy className="w-5 h-5 text-primary-foreground" />
                <span className="font-bold text-primary-foreground">{userGold}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Course Overview */}
        <Card className="mb-8 overflow-hidden border border-border bg-card">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex items-center justify-center">
              <img src={ericMath} alt="Eric enseignant" className="w-full h-auto object-contain rounded-lg" />
            </div>
            <CardContent className="md:w-2/3 p-6">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Aperçu du Cours</h2>
              <p className="text-muted-foreground mb-4">
                Bienvenue dans le cours de Mathématiques pour la 7ème année fondamentale ! 
                Explore l'algèbre, la géométrie, les mesures et bien plus à travers 
                des leçons interactives et des activités ludiques.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">{topics.length} chapitres complets</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Jeux et activités interactives</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">{completedLessons.size} chapitres complétés</span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <MusicSelector />

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {topics.map((topic, index) => {
            const isCompleted = completedLessons.has(topic.id);
            const goldReward = topic.goldReward;
            
            return (
              <Card 
                key={topic.id} 
                className={`transition-all duration-300 hover:shadow-xl border border-border bg-card ${
                  topic.isLocked 
                    ? 'opacity-60 cursor-not-allowed' 
                    : isCompleted ? 'border-2 border-green-500' : 'hover:scale-105'
                }`}
                onClick={() => !topic.isLocked && navigate(`/math-lesson/${topic.id}`)}
              >
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-foreground">{topic.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{topic.icon}</p>
                      </div>
                    </div>
                    {isCompleted && (
                      <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {topic.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <BookOpen className="w-3 h-3 mr-1" />
                        Leçon
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Gamepad2 className="w-3 h-3 mr-1" />
                        Jeux
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Quiz
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-1 text-accent">
                        <Trophy className="w-4 h-4" />
                        <span className="font-bold">{goldReward}</span>
                      </div>
                      {!topic.isLocked && (
                        <Button>
                          {isCompleted ? 'Revoir' : 'Commencer'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Progress Summary */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-primary-foreground border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Ton Progrès</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Chapitres complétés</span>
                  <span className="font-bold">{completedLessons.size}/{topics.length}</span>
                </div>
                <Progress value={Math.round((completedLessons.size / topics.length) * 100)} className="h-3 bg-primary-foreground/30" />
              </div>
              <p className="text-sm opacity-90">
                Continue comme ça ! Chaque chapitre complété te rapproche de la maîtrise des mathématiques.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MathCourse;
