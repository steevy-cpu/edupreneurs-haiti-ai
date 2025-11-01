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
import ericStudentDesk from "@/assets/eric-student-desk.png";
import { MusicSelector } from "@/components/MusicSelector";

type Category = "Propriété physique de la matière" | "La chaleur" | "Électricité" | "Les vertébrés" | "Les plantes à fleurs" | "Interaction dans le milieu" | "Activités internes du globe";

// Sciences Expérimentales Course Page - AF7
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
      <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-primary-foreground pt-20 sm:pt-24 md:pt-32 pb-8 sm:pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Beaker className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                  Sciences Expérimentales
                </h1>
              </div>
              <p className="text-base sm:text-lg md:text-xl opacity-90 mb-4 sm:mb-6">
                Physique, chimie, biologie et méthode scientifique - Programme AF7
              </p>
              <div className="flex gap-2 sm:gap-3 justify-center md:justify-start flex-wrap">
                <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  {totalTopics} leçons
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Expériences pratiques
                </Badge>
              </div>
            </div>
            <div className="flex-shrink-0">
              <img 
                src={ericStudentDesk} 
                alt="Eric - Professeur de Sciences" 
                className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain drop-shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
        {/* Music Selector */}
        <div className="mb-6 sm:mb-8">
          <MusicSelector />
        </div>

        {/* Progress Card */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-4">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold mb-1">Votre Progression</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {completedTopics} sur {totalTopics} leçons complétées
              </p>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-primary shrink-0">
              {Math.round(progress)}%
            </div>
          </div>
          <Progress value={progress} className="h-2 sm:h-3" />
        </Card>

        {/* Category Filter */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Filtrer par thème</h3>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10"
                  size="sm"
                >
                  <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                  <span className="sm:hidden">{category.label.length > 10 ? category.label.slice(0, 10) + '...' : category.label}</span>
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${categories.find(c => c.id === topic.category || c.label === topic.category)?.color || 'from-amber-500 to-amber-600'} flex items-center justify-center`}>
                      {isLocked ? (
                        <Lock className="w-7 h-7 text-primary-foreground" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-7 h-7 text-primary-foreground" />
                      ) : (
                        <IconComponent className="w-7 h-7 text-primary-foreground" />
                      )}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${getDifficultyColor(topic.difficulty)} text-primary-foreground border-0`}
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
        <Card className="p-4 sm:p-6 md:p-8 bg-gradient-to-r from-primary/10 to-secondary/10 mb-20 sm:mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <img 
                src={ericTeaching} 
                alt="Eric - Assistant IA" 
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                Besoin d'aide en Sciences ?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                Eric est là pour t'expliquer les phénomènes scientifiques, t'aider avec les expériences 
                et répondre à toutes tes questions sur la physique, la chimie et la biologie !
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="outline" className="text-xs sm:text-sm">Explications simplifiées</Badge>
                <Badge variant="outline" className="text-xs sm:text-sm">Expériences virtuelles</Badge>
                <Badge variant="outline" className="text-xs sm:text-sm">Support 24/7</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}