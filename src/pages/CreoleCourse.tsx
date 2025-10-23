import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Users, 
  ChevronLeft, 
  Clock, 
  Trophy,
  MessageCircle,
  PenTool,
  Volume2,
  FileText,
  CheckCircle2
} from "lucide-react";
import { creoleLessons7AF } from "@/data/creoleLessons";
import ericTeaching from "@/assets/eric-teaching.png";

const categoryIcons = {
  "Lekti": BookOpen,
  "Kominikasyon Oral": MessageCircle,
  "Gramè": FileText,
  "Vokabilè": Users,
  "Òtograf": PenTool,
  "Pwodiksyon Ekri": FileText
};

const categoryColors = {
  "Lekti": "from-pink-500 to-pink-600",
  "Kominikasyon Oral": "from-purple-500 to-purple-600",
  "Gramè": "from-blue-500 to-blue-600",
  "Vokabilè": "from-green-500 to-green-600",
  "Òtograf": "from-orange-500 to-orange-600",
  "Pwodiksyon Ekri": "from-red-500 to-red-600"
};

export default function CreoleCourse() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const categories = Array.from(new Set(creoleLessons7AF.map(l => l.category)));
  
  const filteredLessons = selectedCategory === "all" 
    ? creoleLessons7AF 
    : creoleLessons7AF.filter(l => l.category === selectedCategory);

  const completedLessons = 0; // This would come from user progress
  const progress = (completedLessons / creoleLessons7AF.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/matieres")}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retounen nan matye yo</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-pink-600 to-purple-600 text-primary-foreground pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-4">
                <Users className="w-12 h-12" />
                <h1 className="text-5xl font-bold">Kreyòl Ayisyen</h1>
              </div>
              <p className="text-xl opacity-90 mb-6">
                Lang, literati ak kilti ayisyèn - 7ème AF
              </p>
              <div className="flex gap-3 justify-center md:justify-start flex-wrap">
                <Badge variant="secondary" className="px-4 py-2">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {creoleLessons7AF.length} Leson
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Trophy className="w-4 h-4 mr-2" />
                  Nivo AF7
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Kreyòl & Fransè
                </Badge>
              </div>
            </div>
            <div className="flex-shrink-0">
              <img 
                src={ericTeaching} 
                alt="Eric - Gid Pedagojik"
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Pwogrè ou</h3>
              <p className="text-sm text-muted-foreground">
                {completedLessons} sou {creoleLessons7AF.length} leson konplete
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold">{Math.round(progress)}%</span>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </Card>

        {/* Category Filter */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Kategori</h3>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              size="sm"
            >
              Tout leson yo
            </Button>
            {categories.map((category) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category}
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => {
            const Icon = categoryIcons[lesson.category];
            const colorClass = categoryColors[lesson.category];
            const isCompleted = false; // This would come from user progress

            return (
              <Card
                key={lesson.id}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/creole-lesson/${lesson.id}`)}
              >
                <div className={`h-1 bg-gradient-to-r ${colorClass}`} />
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {isCompleted && (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    )}
                  </div>

                  <Badge variant="secondary" className="mb-3">
                    {lesson.category}
                  </Badge>

                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {lesson.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {lesson.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{lesson.duration}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {lesson.difficulty}
                    </Badge>
                  </div>

                  <Button className="w-full mt-4">
                    {isCompleted ? "Revize" : "Kòmanse"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="p-8 mt-8 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <img 
                src={ericTeaching} 
                alt="Eric - Asistan IA"
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-3">
                Aprann Kreyòl Ayisyen!
              </h3>
              <p className="text-muted-foreground mb-4">
                Devlope konpetans ou nan lang manman nou an. Aprann gramè, vokabilè, 
                kominikasyon oral ak pwodiksyon ekri an kreyòl. Eric la pou ede w nan chak etap!
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="outline">Gramè kreyòl</Badge>
                <Badge variant="outline">Kominikasyon oral</Badge>
                <Badge variant="outline">Literati kreyòl</Badge>
                <Badge variant="outline">Kilti ayisyèn</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
