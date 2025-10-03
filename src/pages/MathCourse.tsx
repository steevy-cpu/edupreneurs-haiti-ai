import { useState } from "react";
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
  const [userGold] = useState(250);

  const topics: Topic[] = [
    {
      id: "nombres-entiers",
      title: "Les Nombres Entiers",
      description: "Comprendre les opérations sur les nombres entiers positifs et négatifs",
      progress: 75,
      goldReward: 100,
      isLocked: false,
      isCompleted: false,
      icon: "🔢"
    },
    {
      id: "equations-second-degre",
      title: "Équations du Second Degré",
      description: "Résoudre les équations quadratiques avec plusieurs méthodes",
      progress: 0,
      goldReward: 150,
      isLocked: false,
      isCompleted: false,
      icon: "📈"
    },
    {
      id: "fonctions",
      title: "Les Fonctions",
      description: "Étudier les fonctions linéaires, affines et polynomiales",
      progress: 0,
      goldReward: 150,
      isLocked: true,
      isCompleted: false,
      icon: "📊"
    },
    {
      id: "geometrie",
      title: "Géométrie dans l'Espace",
      description: "Volumes, surfaces et calculs dans l'espace 3D",
      progress: 0,
      goldReward: 200,
      isLocked: true,
      isCompleted: false,
      icon: "📐"
    },
    {
      id: "probabilites",
      title: "Probabilités",
      description: "Calculer des probabilités et analyser des situations aléatoires",
      progress: 0,
      goldReward: 150,
      isLocked: true,
      isCompleted: false,
      icon: "🎲"
    },
    {
      id: "suites",
      title: "Suites Numériques",
      description: "Suites arithmétiques, géométriques et leur convergence",
      progress: 0,
      goldReward: 200,
      isLocked: true,
      isCompleted: false,
      icon: "🔄"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Mathématiques 📐</h1>
                  <p className="text-sm text-muted-foreground">Niveau Terminale</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <Trophy className="w-5 h-5 text-accent" />
              <span className="font-bold gold-text">{userGold}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Course Overview */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Programme de Mathématiques</h2>
          <p className="text-lg text-muted-foreground">
            Apprends en t'amusant avec des activités interactives, des jeux et des quiz! 🎮
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {topics.map((topic) => (
            <Card 
              key={topic.id}
              className={`p-6 transition-all ${
                topic.isLocked 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:shadow-lg cursor-pointer hover:-translate-y-1'
              }`}
              onClick={() => !topic.isLocked && navigate(`/math-lesson/${topic.id}`)}
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl">{topic.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">{topic.title}</h3>
                    {topic.isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                    {topic.isCompleted && <CheckCircle className="w-5 h-5 text-success" />}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
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
