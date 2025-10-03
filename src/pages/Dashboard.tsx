import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  GraduationCap, 
  Trophy, 
  Sparkles, 
  BookOpen, 
  Target,
  TrendingUp,
  Award,
  Play
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import goldRewards from "@/assets/gold-rewards.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userGold] = useState(250);
  const [userLevel] = useState("Terminale");
  const [userName] = useState("Étudiant");

  const subjects = [
    { id: "math", name: "Mathématiques", progress: 45, icon: "📐", color: "text-primary" },
    { id: "physics", name: "Physique", progress: 30, icon: "⚛️", color: "text-secondary" },
    { id: "chemistry", name: "Chimie", progress: 60, icon: "🧪", color: "text-success" },
    { id: "french", name: "Français", progress: 75, icon: "🇫🇷", color: "text-accent" },
  ];

  const recentAchievements = [
    { title: "Premier Quiz Réussi", gold: 50, icon: "🎯" },
    { title: "Série de 5 jours", gold: 100, icon: "🔥" },
    { title: "Expert Mathématiques", gold: 150, icon: "🏆" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">EDUPRENEURS</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <img src={goldRewards} alt="Gold" className="w-6 h-6" />
                <span className="font-bold gold-text">{userGold}</span>
              </div>
              <Avatar className="cursor-pointer hover:ring-2 ring-primary transition-all">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                  {userName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Bienvenue, <span className="gradient-text">{userName}</span>! 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            Prêt à continuer votre parcours d'apprentissage?
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  <span className="text-sm text-muted-foreground">Gold Total</span>
                </div>
                <p className="text-3xl font-bold gold-text">{userGold}</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6 text-secondary" />
                  <span className="text-sm text-muted-foreground">Niveau</span>
                </div>
                <p className="text-2xl font-bold">{userLevel}</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-success" />
                  <span className="text-sm text-muted-foreground">Progression</span>
                </div>
                <p className="text-3xl font-bold">52%</p>
              </Card>
            </div>

            {/* Subjects Progress */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Mes Matières</h2>
                <Button variant="ghost" size="sm">
                  Voir tout →
                </Button>
              </div>

              <div className="grid gap-4">
                {subjects.map((subject) => (
                  <Card 
                    key={subject.id} 
                    className="p-6 hover:bg-card/80 transition-all cursor-pointer group"
                    onClick={() => subject.id === 'math' && navigate('/math-course')}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl">{subject.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{subject.name}</h3>
                        <div className="flex items-center gap-3">
                          <Progress value={subject.progress} className="flex-1" />
                          <span className="text-sm font-medium">{subject.progress}%</span>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          subject.id === 'math' && navigate('/math-course');
                        }}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Continuer
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="p-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
              <div className="flex items-center gap-4 mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="text-xl font-bold">Suggestion du jour</h3>
                  <p className="text-muted-foreground">Votre assistant IA recommande</p>
                </div>
              </div>
              <p className="text-lg mb-6">
                Commencez par le chapitre "Équations du second degré" en Mathématiques. 
                Vous êtes sur le point de maîtriser ce concept! 💪
              </p>
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                Commencer maintenant
              </Button>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Gold Card */}
            <Card className="p-6 bg-gradient-to-br from-accent/10 to-yellow-500/10 border-accent/20">
              <div className="flex items-center gap-3 mb-4">
                <img src={goldRewards} alt="Récompenses" className="w-16 h-16" />
                <div>
                  <h3 className="text-xl font-bold gold-text">Vos Récompenses</h3>
                  <p className="text-sm text-muted-foreground">Continuez à accumuler du gold!</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-sm">Avatar Premium</span>
                  <span className="gold-text font-bold">100 🪙</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-sm">Cours Particulier</span>
                  <span className="gold-text font-bold">500 🪙</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-sm">10 MB Internet</span>
                  <span className="gold-text font-bold">150 🪙</span>
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-accent to-yellow-500 hover:opacity-90">
                Boutique de récompenses
              </Button>
            </Card>

            {/* Recent Achievements */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-secondary" />
                <h3 className="text-xl font-bold">Succès Récents</h3>
              </div>

              <div className="space-y-4">
                {recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs gold-text font-bold">+{achievement.gold} gold</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Study Streak */}
            <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🔥</div>
                <div>
                  <h3 className="text-xl font-bold">Série d'étude</h3>
                  <p className="text-sm text-muted-foreground">Continuez votre momentum!</p>
                </div>
              </div>
              <p className="text-4xl font-bold text-success mb-2">5 jours</p>
              <p className="text-sm text-muted-foreground">
                Vous êtes à 2 jours de débloquer un badge spécial! 🎯
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
