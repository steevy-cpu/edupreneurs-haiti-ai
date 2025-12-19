import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Award,
  FlaskConical,
  MessageCircle,
  Map
} from "lucide-react";

import ericPointingImage from "@/assets/eric-right-pointing.png";
import ericTeaching from "@/assets/eric-teaching.png";
import edupreneursBg from "@/assets/edupreneurs-bg.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MusicSelector } from "@/components/MusicSelector";
import { useSubjects } from "@/hooks/useLessonsCache";
import { supabase } from "@/integrations/supabase/client";

type GradeLevel = "7AF" | "8AF" | "9AF" | "NS1" | "NS2" | "NS3" | "NS4";
type Series = "LLA" | "SES" | "SMP" | "SVT";

interface DisplaySubject {
  id: string;
  title: string;
  description: string;
  icon: any;
  lessons: number;
  exercises: number;
  color: string;
  series?: string | null;
}

interface SeriesOption {
  id: Series;
  name: string;
  fullName: string;
  description: string;
  icon: any;
  color: string;
}

const seriesOptions: SeriesOption[] = [
  {
    id: "LLA",
    name: "LLA",
    fullName: "Lettres, Langues et Arts",
    description: "Pour les passionnés de littérature, langues et expression artistique",
    icon: BookOpen,
    color: "from-purple-500 to-purple-600"
  },
  {
    id: "SES",
    name: "SES",
    fullName: "Sciences Économiques et Sociales",
    description: "Pour comprendre l'économie, la société et les enjeux mondiaux",
    icon: Users,
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "SMP",
    name: "SMP",
    fullName: "Sciences Mathématiques et Physiques",
    description: "Pour les esprits analytiques et scientifiques",
    icon: Calculator,
    color: "from-emerald-500 to-emerald-600"
  },
  {
    id: "SVT",
    name: "SVT",
    fullName: "Sciences de la Vie et de la Terre",
    description: "Pour explorer le vivant et notre planète",
    icon: FlaskConical,
    color: "from-amber-500 to-amber-600"
  }
];

const gradeLevels = [
  { id: "7AF" as GradeLevel, label: "7AF", fullName: "7ème année fondamentale" },
  { id: "8AF" as GradeLevel, label: "8AF", fullName: "8ème année fondamentale" },
  { id: "9AF" as GradeLevel, label: "9AF", fullName: "9ème année fondamentale" },
  { id: "NS1" as GradeLevel, label: "NS1", fullName: "1ère secondaire" },
  { id: "NS2" as GradeLevel, label: "NS2", fullName: "2ème secondaire" },
  { id: "NS3" as GradeLevel, label: "NS3", fullName: "3ème secondaire" },
  { id: "NS4" as GradeLevel, label: "NS4", fullName: "4ème secondaire" }
];

// Icon mapping for database subjects
const iconMap: Record<string, any> = {
  'calculator': Calculator,
  'book-open': BookOpen,
  'flask-conical': FlaskConical,
  'globe': Globe,
  'flag': Flag,
  'message-circle': MessageCircle,
  'map': Map,
  'beaker': Beaker,
  'users': Users,
  'palette': Palette,
  'activity': Activity,
  'languages': Languages,
  'Calculator': Calculator,
  'BookOpen': BookOpen,
  'Languages': Languages,
  'Globe': Globe,
  'MessageSquare': MessageCircle,
  'BookA': BookOpen,
  'PieChart': Calculator,
  'Binary': Calculator,
  'Sigma': Calculator,
  'FlaskConical': FlaskConical,
  'Flask': Beaker,
  'Atom': Beaker,
  'Microscope': Beaker,
  'Dna': Beaker,
  'Leaf': Beaker,
  'Beaker': Beaker,
  'Landmark': Map,
  'Users': Users,
  'Globe2': Globe,
  'BookText': BookOpen,
  'Map': Map,
  'Scale': Users,
  'Palette': Palette,
  'Music': Palette,
  'Drama': Palette,
  'Paintbrush': Palette,
  'Dumbbell': Activity,
  'Trophy': Award,
  'Activity': Activity,
  'Heart': Activity,
  'Laptop': Calculator,
  'Code': Calculator,
  'Database': Calculator,
  'Monitor': Calculator,
  'Cpu': Calculator,
  'Brain': BookOpen,
  'Lightbulb': BookOpen,
  'GraduationCap': GraduationCap,
  'Book': BookOpen,
  'Flag': Flag
};

// Color mapping for database subjects
const colorMap: Record<string, string> = {
  'blue': 'from-blue-500 to-blue-600',
  'purple': 'from-purple-500 to-purple-600',
  'green': 'from-green-500 to-green-600',
  'orange': 'from-orange-500 to-orange-600',
  'indigo': 'from-indigo-500 to-indigo-600',
  'red': 'from-red-500 to-red-600',
  'teal': 'from-teal-500 to-teal-600',
  'emerald': 'from-emerald-500 to-emerald-600',
  'amber': 'from-amber-500 to-amber-600',
  'cyan': 'from-cyan-500 to-cyan-600',
  'rose': 'from-rose-500 to-rose-600',
  'pink': 'from-pink-500 to-pink-600',
  'slate': 'from-slate-500 to-slate-600'
};

export default function Matieres() {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>("7AF");
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { subjects: dbSubjects, isLoading } = useSubjects(refreshTrigger);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});

  const currentGrade = gradeLevels.find(g => g.id === selectedGrade);
  const isNS3OrNS4 = selectedGrade === "NS3" || selectedGrade === "NS4";
  
  // Fetch actual lesson counts from database
  useEffect(() => {
    const fetchLessonCounts = async () => {
      try {
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, slug')
          .eq('grade_level', selectedGrade);

        if (subjectsError) throw subjectsError;

        const { data: lessons, error } = await supabase
          .from('lessons')
          .select('subject_id, id')
          .eq('grade_level', selectedGrade)
          .eq('is_published', true);

        if (error) throw error;

        // Count lessons per subject and map by slug
        const counts: Record<string, number> = {};
        lessons?.forEach(lesson => {
          const subject = subjectsData?.find(s => s.id === lesson.subject_id);
          if (subject) {
            counts[subject.slug] = (counts[subject.slug] || 0) + 1;
          }
        });
        
        setLessonCounts(counts);
      } catch (error) {
        console.error('Error fetching lesson counts:', error);
      }
    };

    fetchLessonCounts();
  }, [selectedGrade, refreshTrigger]);
  
  // Filter subjects by selected grade and series (for NS3/NS4)
  const filteredSubjects = dbSubjects.filter(s => {
    if (s.grade_level !== selectedGrade) return false;
    if (isNS3OrNS4 && selectedSeries) {
      return s.series === selectedSeries;
    }
    return true;
  });
  
  // Transform database subjects to display format
  const displaySubjects: DisplaySubject[] = filteredSubjects.map(s => ({
    id: s.slug,
    title: s.name,
    description: s.description || '',
    icon: iconMap[s.icon_name || 'BookOpen'] || BookOpen,
    lessons: lessonCounts[s.slug] || 0,
    exercises: s.exercise_count || 0,
    color: colorMap[s.color || 'blue'] || 'from-blue-500 to-blue-600'
  }));

  const totalLessons = displaySubjects.reduce((sum, s) => sum + s.lessons, 0);
  const totalExercises = displaySubjects.reduce((sum, s) => sum + s.exercises, 0);

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
            <div className="flex items-center gap-2">
              <MusicSelector />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Header with Eric */}
      <div className="relative pt-32 pb-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${edupreneursBg})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-bold mb-4 flex items-center justify-center md:justify-start gap-3 text-white">
                <GraduationCap className="w-12 h-12" />
                Programmes Académiques
              </h1>
              <p className="text-xl mb-6 text-white">
                Contenu aligné sur le programme officiel du Ministère de l'Éducation Nationale et de la Formation Professionnelle d'Haïti (MENFP)
              </p>
            </div>
            <div className="hidden md:block">
              <img 
                src={ericTeaching}
                alt="Eric enseignant"
                className="w-64 h-64 object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Grade Level Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center">Sélectionnez votre niveau</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {gradeLevels.map((grade) => (
              <Button
                key={grade.id}
                variant={selectedGrade === grade.id ? "default" : "outline"}
                onClick={() => {
                  setSelectedGrade(grade.id);
                  setSelectedSeries(null);
                }}
                className="min-w-[80px]"
              >
                {grade.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Series Selection for NS3/NS4 */}
        {isNS3OrNS4 && !selectedSeries && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-center mb-6">
              Choisissez votre série
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {seriesOptions.map((series) => {
                const IconComponent = series.icon;
                return (
                  <Card
                    key={series.id}
                    className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden"
                    onClick={() => setSelectedSeries(series.id)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${series.color}`} />
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${series.color} flex items-center justify-center`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-center mb-2">{series.name}</h4>
                      <p className="text-sm font-semibold text-center mb-3 text-muted-foreground">
                        {series.fullName}
                      </p>
                      <p className="text-sm text-center text-muted-foreground">
                        {series.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Back to series button for NS3/NS4 when a series is selected */}
        {isNS3OrNS4 && selectedSeries && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedSeries(null)}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour aux séries
            </Button>
          </div>
        )}

        {/* Current Grade Display - Only show if not waiting for series selection */}
        {(!isNS3OrNS4 || selectedSeries) && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {currentGrade?.fullName} ({currentGrade?.label})
              {selectedSeries && ` - ${seriesOptions.find(s => s.id === selectedSeries)?.fullName}`}
            </h2>
            <p className="text-muted-foreground">
              Découvrez les matières fondamentales qui préparent à l'excellence académique
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {((!isNS3OrNS4 && displaySubjects.length > 0) || (isNS3OrNS4 && selectedSeries && displaySubjects.length > 0)) && !isLoading ? (
          <>
            {/* Stats Section */}
            <Card className="p-6 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {displaySubjects.length}
                  </div>
                  <div className="text-sm text-muted-foreground font-semibold">
                    Matières
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {totalLessons > 0 ? `${totalLessons}+` : '0'}
                  </div>
                  <div className="text-sm text-muted-foreground font-semibold">
                    Leçons
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {totalExercises > 0 ? `${totalExercises}+` : '0'}
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

            {/* Exam Preparation Section for 9AF */}
            {selectedGrade === '9AF' && (
              <Card className="p-6 mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Award className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2">
                      Préparation aux Examens Officiels
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Prépare-toi pour l'examen officiel de 9ème AF avec Eric! Pratique avec les questions de l'examen 2025 et reçois des explications personnalisées pour chaque concept.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <Badge variant="secondary" className="text-sm">
                        18 exercices officiels
                      </Badge>
                      <Badge variant="secondary" className="text-sm">
                        Tuteur IA Eric
                      </Badge>
                      <Badge variant="secondary" className="text-sm">
                        Vidéos explicatives
                      </Badge>
                      <Badge variant="secondary" className="text-sm">
                        Points de récompense
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      size="lg"
                      onClick={() => navigate('/examens-officiels')}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold"
                    >
                      Commencer la préparation
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {displaySubjects.map((subject) => {
                const IconComponent = subject.icon;
                const hasContent = subject.lessons > 0;
                
                return (
                  <Card
                    key={subject.id}
                    className={`group transition-all duration-300 overflow-hidden ${
                      hasContent ? 'hover:shadow-xl hover:-translate-y-2 cursor-pointer' : ''
                    }`}
                    onClick={() => {
                      if (hasContent) {
                        navigate(`/course/${subject.id}`);
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
                          {subject.lessons} {subject.lessons === 1 ? 'leçon' : 'leçons'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {subject.exercises} {subject.exercises === 1 ? 'exercice' : 'exercices'}
                        </Badge>
                      </div>

                      {hasContent ? (
                        <Button
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/course/${subject.id}`);
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
        ) : null}

        {/* No subjects message */}
        {!isLoading && displaySubjects.length === 0 && (!isNS3OrNS4 || selectedSeries) && (
          <Card className="p-8 text-center mb-8">
            <p className="text-muted-foreground">
              Aucune matière disponible pour ce niveau. Les contenus sont en cours de développement.
            </p>
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
