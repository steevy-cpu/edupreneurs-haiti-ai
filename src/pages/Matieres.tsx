import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Calculator, 
  Globe, 
  Beaker, 
  Users, 
  Palette, 
  Activity,
  Languages,
  ChevronLeft,
  GraduationCap,
  Flag,
  Award
} from "lucide-react";

import ericPointingImage from "@/assets/eric-right-pointing.png";
import ericTeaching from "@/assets/eric-teaching.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MusicSelector } from "@/components/MusicSelector";

type GradeLevel = "AF7" | "AF8" | "AF9" | "NS1" | "NS2" | "NS3" | "NS4";

interface Subject {
  id: string;
  title: string;
  description: string;
  icon: any;
  lessons: number;
  exercises: number;
  color: string;
}

const subjects: Subject[] = [
  {
    id: "mathematiques",
    title: "Mathématiques",
    description: "Algèbre, géométrie, arithmétique et résolution de problèmes",
    icon: Calculator,
    lessons: 24,
    exercises: 120,
    color: "from-emerald-500 to-emerald-600"
  },
  {
    id: "francais",
    title: "Français",
    description: "Grammaire, conjugaison, orthographe et littérature",
    icon: BookOpen,
    lessons: 28,
    exercises: 95,
    color: "from-purple-500 to-purple-600"
  },
  {
    id: "sciences",
    title: "Sciences Expérimentales",
    description: "Physique, chimie, biologie et méthode scientifique",
    icon: Beaker,
    lessons: 20,
    exercises: 80,
    color: "from-amber-500 to-amber-600"
  },
  {
    id: "histoire",
    title: "Histoire & Géographie",
    description: "Histoire d'Haïti, géographie mondiale et études sociales",
    icon: Globe,
    lessons: 18,
    exercises: 65,
    color: "from-red-500 to-red-600"
  },
  {
    id: "anglais",
    title: "Anglais",
    description: "Vocabulaire, grammaire et conversation en anglais",
    icon: Languages,
    lessons: 22,
    exercises: 85,
    color: "from-cyan-500 to-cyan-600"
  },
  {
    id: "creole",
    title: "Kreyòl Ayisyen",
    description: "Lang, literati ak kilti ayisyèn",
    icon: Users,
    lessons: 16,
    exercises: 55,
    color: "from-pink-500 to-pink-600"
  },
  {
    id: "arts",
    title: "Arts & Culture",
    description: "Arts plastiques, musique et expression créative",
    icon: Palette,
    lessons: 14,
    exercises: 40,
    color: "from-orange-500 to-orange-600"
  },
  {
    id: "sport",
    title: "Éducation Physique",
    description: "Activités sportives, santé et bien-être",
    icon: Activity,
    lessons: 12,
    exercises: 30,
    color: "from-slate-500 to-slate-600"
  }
];

const gradeLevels = [
  { id: "AF7" as GradeLevel, label: "AF7", fullName: "7ème année fondamentale" },
  { id: "AF8" as GradeLevel, label: "AF8", fullName: "8ème année fondamentale" },
  { id: "AF9" as GradeLevel, label: "AF9", fullName: "9ème année fondamentale" },
  { id: "NS1" as GradeLevel, label: "NS1", fullName: "1ère secondaire" },
  { id: "NS2" as GradeLevel, label: "NS2", fullName: "2ème secondaire" },
  { id: "NS3" as GradeLevel, label: "NS3", fullName: "3ème secondaire" },
  { id: "NS4" as GradeLevel, label: "NS4", fullName: "4ème secondaire" }
];

export default function Matieres() {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>("AF7");

  const currentGrade = gradeLevels.find(g => g.id === selectedGrade);
  const totalLessons = subjects.reduce((sum, s) => sum + s.lessons, 0);
  const totalExercises = subjects.reduce((sum, s) => sum + s.exercises, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-semibold">EDUPRENEURS</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Header with Eric */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-primary-foreground pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-bold mb-4 flex items-center justify-center md:justify-start gap-3">
                <GraduationCap className="w-12 h-12" />
                Programmes Académiques
              </h1>
              <p className="text-xl opacity-90 mb-6">
                Explorez nos matières du programme haïtien - De la 7ème année fondamentale à la 4ème secondaire
              </p>
              <div className="flex gap-3 justify-center md:justify-start flex-wrap">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Flag className="w-4 h-4 mr-2" />
                  Aligné MENFP
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Globe className="w-4 h-4 mr-2" />
                  FR / HT
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <Award className="w-4 h-4 mr-2" />
                  Certifié
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Music Selector */}
        <div className="mb-8">
          <MusicSelector />
        </div>

        {/* Grade Level Selector */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold text-center mb-6">
            Choisissez votre niveau
          </h3>
          <div className="flex gap-2 justify-center flex-wrap">
            {gradeLevels.map((grade) => (
              <Button
                key={grade.id}
                variant={selectedGrade === grade.id ? "default" : "outline"}
                onClick={() => setSelectedGrade(grade.id)}
                className="min-w-[80px]"
              >
                {grade.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Current Grade Display */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {currentGrade?.fullName} ({currentGrade?.label})
          </h2>
          <p className="text-muted-foreground">
            Découvrez les matières fondamentales qui préparent à l'excellence académique
          </p>
        </div>

        {selectedGrade === "AF7" ? (
          <>
            {/* Stats Section */}
            <Card className="p-6 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {subjects.length}
                  </div>
                  <div className="text-sm text-muted-foreground font-semibold">
                    Matières
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {totalLessons}+
                  </div>
                  <div className="text-sm text-muted-foreground font-semibold">
                    Leçons
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {totalExercises}+
                  </div>
                  <div className="text-sm text-muted-foreground font-semibold">
                    Exercices
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    ∞
                  </div>
                  <div className="text-sm text-muted-foreground font-semibold">
                    Possibilités
                  </div>
                </div>
              </div>
            </Card>

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {subjects.map((subject, index) => {
            const IconComponent = subject.icon;
            const hasContent = subject.id === 'mathematiques' || subject.id === 'sciences' || subject.id === 'anglais';
            
            return (
              <Card
                key={subject.id}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden"
                onClick={() => {
                  if (hasContent) {
                    const courseRoute = subject.id === 'mathematiques' 
                      ? '/math-course' 
                      : subject.id === 'anglais'
                      ? '/anglais-course'
                      : '/sciences-course';
                    navigate(courseRoute);
                  }
                }}
              >
                <div className={`h-1 bg-gradient-to-r ${subject.color}`} />
                
                <div className="p-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {subject.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {subject.description}
                  </p>

                  <div className="flex gap-2 mb-4 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {subject.lessons} leçons
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {subject.exercises} exercices
                    </Badge>
                  </div>

                {hasContent ? (
                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      const courseRoute = subject.id === 'mathematiques' 
                        ? '/math-course' 
                        : subject.id === 'anglais'
                        ? '/anglais-course'
                        : '/sciences-course';
                      navigate(courseRoute);
                    }}
                  >
                    Commencer
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant="secondary"
                    disabled
                  >
                    Bientôt disponible
                  </Button>
                )}
                </div>
              </Card>
            );
          })}
            </div>
          </>
        ) : (
          <Card className="p-12 mb-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-2xl font-bold mb-3">Bientôt Disponible!</h3>
              <p className="text-muted-foreground mb-4">
                Le contenu pour {currentGrade?.fullName} ({currentGrade?.label}) sera disponible très prochainement.
              </p>
              <p className="text-sm text-muted-foreground">
                Pour l'instant, explorez notre programme complet pour AF7 👆
              </p>
              <Button 
                onClick={() => setSelectedGrade("AF7")}
                className="mt-6"
              >
                Voir le programme AF7
              </Button>
            </div>
          </Card>
        )}

        {/* Eric Mascot Section */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <img 
                src={ericPointingImage} 
                alt="Eric - Assistant IA" 
                className="w-48 h-48 object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-3">
                Besoin d'aide pour choisir ?
              </h3>
              <p className="text-muted-foreground mb-4">
                Eric, votre guide pédagogique, est là pour vous aider à choisir les bonnes matières 
                et à comprendre le programme. Cliquez sur l'icône flottante pour discuter avec lui !
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="outline">Conseils personnalisés</Badge>
                <Badge variant="outline">Orientation académique</Badge>
                <Badge variant="outline">Support 24/7</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
