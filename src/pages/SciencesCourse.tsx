import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  Beaker,
  BookOpen,
  Brain,
  Zap,
  Lock,
  CheckCircle2,
  FlaskConical,
  Flame,
  Leaf,
  Mountain,
  Fish
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { sciencesTopics } from "@/data/sciencesLessons";
import ericTeaching from "@/assets/eric-teaching.png";
import { MusicSelector } from "@/components/MusicSelector";

type Category = "Propriété physique de la matière" | "La chaleur" | "Électricité" | "Les vertébrés" | "Les plantes à fleurs" | "Interaction dans le milieu" | "Activités internes du globe";

export default function SciencesCourse() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");

  const categories: { id: Category | "all"; label: string; icon: any; color: string }[] = [
    { id: "all", label: "Tous les thèmes", icon: Beaker, color: "from-amber-500 to-amber-600" },
    { id: "Propriété physique de la matière", label: "Matière", icon: FlaskConical, color: "from-blue-500 to-blue-600" },
    { id: "La chaleur", label: "Chaleur", icon: Flame, color: "from-red-500 to-red-600" },
    { id: "Électricité", label: "Électricité", icon: Zap, color: "from-yellow-500 to-yellow-600" },
    { id: "Les vertébrés", label: "Vertébrés", icon: Fish, color: "from-green-500 to-green-600" },
    { id: "Les plantes à fleurs", label: "Plantes", icon: Leaf, color: "from-emerald-500 to-emerald-600" },
    { id: "Interaction dans le milieu", label: "Écologie", icon: Brain, color: "from-purple-500 to-purple-600" },
    { id: "Activités internes du globe", label: "Géologie", icon: Mountain, color: "from-slate-500 to-slate-600" }
  ];

  const filteredTopics = selectedCategory === "all" 
    ? sciencesTopics 
    : sciencesTopics.filter(topic => topic.category === selectedCategory);

  const totalTopics = sciencesTopics.length;
  const completedTopics = 0; // Will be dynamic with user progress
  const progress = (completedTopics / totalTopics) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case "Débutant": return "bg-green-500";
      case "Intermédiaire": return "bg-yellow-500";
      case "Avancé": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getTopicIcon = (category: string) => {
    const categoryObj = categories.find(c => c.label === category || c.id === category);
    return categoryObj ? categoryObj.icon : Beaker;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/matieres")}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-semibold">Retour aux Matières</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-primary-foreground pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Beaker className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold">
                  Sciences Expérimentales
                </h1>
              </div>
              <p className="text-xl opacity-90 mb-6">
                Physique, chimie, biologie et méthode scientifique - Programme AF7
              </p>
              <div className="flex gap-3 justify-center md:justify-start flex-wrap">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {totalTopics} leçons
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Brain className="w-4 h-4 mr-2" />
                  Expériences pratiques
                </Badge>
              </div>
            </div>
            <div className="flex-shrink-0">
              <img 
                src={ericTeaching} 
                alt="Eric - Professeur de Sciences" 
                className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Music Selector */}
        <div className="mb-8">
          <MusicSelector />
        </div>

        {/* Progress Card */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold mb-1">Votre Progression</h3>
              <p className="text-sm text-muted-foreground">
                {completedTopics} sur {totalTopics} leçons complétées
              </p>
            </div>
            <div className="text-3xl font-bold text-primary">
              {Math.round(progress)}%
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </Card>

        {/* Category Filter */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Filtrer par thème</h3>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="gap-2"
                >
                  <IconComponent className="w-4 h-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredTopics.map((topic, index) => {
            const isLocked = false; // Will be dynamic with user progress
            const isCompleted = false; // Will be dynamic with user progress
            const IconComponent = getTopicIcon(topic.category);
            
            return (
              <Card
                key={topic.id}
                className={`group hover:shadow-xl transition-all duration-300 ${!isLocked ? 'hover:-translate-y-2 cursor-pointer' : 'opacity-60'}`}
                onClick={() => !isLocked && navigate(`/sciences-lesson/${topic.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${categories.find(c => c.id === topic.category || c.label === topic.category)?.color || 'from-amber-500 to-amber-600'} flex items-center justify-center`}>
                      {isLocked ? (
                        <Lock className="w-7 h-7 text-white" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-7 h-7 text-white" />
                      ) : (
                        <IconComponent className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${getDifficultyColor(topic.difficulty)} text-white border-0`}
                    >
                      {topic.difficulty}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {topic.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Badge variant="outline" className="text-xs">
                      {topic.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {topic.duration}
                    </span>
                    {isCompleted && (
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Terminé
                      </span>
                    )}
                  </div>

                  {!isLocked && (
                    <Button
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/sciences-lesson/${topic.id}`);
                      }}
                    >
                      {isCompleted ? "Revoir" : "Commencer"}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Eric Help Section */}
        <Card className="p-8 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <img 
                src={ericTeaching} 
                alt="Eric - Assistant IA" 
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-3">
                Besoin d'aide en Sciences ?
              </h3>
              <p className="text-muted-foreground mb-4">
                Eric est là pour t'expliquer les phénomènes scientifiques, t'aider avec les expériences 
                et répondre à toutes tes questions sur la physique, la chimie et la biologie !
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="outline">Explications simplifiées</Badge>
                <Badge variant="outline">Expériences virtuelles</Badge>
                <Badge variant="outline">Support 24/7</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}