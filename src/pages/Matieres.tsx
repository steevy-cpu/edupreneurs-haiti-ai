import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Award,
  FlaskConical,
  MessageCircle,
  Map
} from "lucide-react";

import ericPointingImage from "@/assets/eric-right-pointing.png";
import ericTeaching from "@/assets/eric-teaching.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MusicSelector } from "@/components/MusicSelector";
import { useSubjects } from "@/hooks/useLessonsCache";
import { supabase } from "@/integrations/supabase/client";

type GradeLevel = "7AF" | "8AF" | "9AF" | "NS1" | "NS2" | "NS3" | "NS4";
type Series = "LLA" | "SES" | "SMP" | "SVT";

interface Subject {
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
    id: "sciences-sociales",
    title: "Sciences Sociales",
    description: "Histoire d'Haïti, géographie mondiale et études sociales",
    icon: Globe,
    lessons: 30,
    exercises: 65,
    color: "from-orange-500 to-amber-500"
  },
  {
    id: "anglais",
    title: "Anglais",
    description: "Vocabulaire, grammaire et conversation en anglais",
    icon: Languages,
    lessons: 23,
    exercises: 90,
    color: "from-cyan-500 to-cyan-600"
  },
  {
    id: "espagnol",
    title: "Espagnol",
    description: "Cours d'espagnol selon le programme MENFP",
    icon: Flag,
    lessons: 23,
    exercises: 85,
    color: "from-rose-500 to-rose-600"
  },
  {
    id: "creole",
    title: "Kreyòl Ayisyen",
    description: "Lang, literati ak kilti ayisyèn",
    icon: Users,
    lessons: 30,
    exercises: 90,
    color: "from-pink-500 to-pink-600"
  },
  {
    id: "arts",
    title: "Arts & Culture",
    description: "Arts plastiques, musique et expression créative",
    icon: Palette,
    lessons: 3,
    exercises: 0,
    color: "from-orange-500 to-orange-600"
  },
  {
    id: "education-physique",
    title: "Éducation Physique",
    description: "Activités sportives, santé et bien-être",
    icon: Activity,
    lessons: 12,
    exercises: 30,
    color: "from-orange-500 to-red-600"
  }
];

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
  'languages': Languages
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
  
  // Merge database subjects with hardcoded subjects for 7AF
  const displaySubjects = selectedGrade === "7AF" 
    ? [
        ...subjects.map(s => ({
          ...s,
          lessons: lessonCounts[s.id] || s.lessons,
        })),
        ...filteredSubjects
          .filter(dbSubject => !subjects.some(s => s.id === dbSubject.slug))
          .map(s => ({
            id: s.slug,
            title: s.name,
            description: s.description || '',
            icon: iconMap[s.icon_name || 'book-open'] || BookOpen,
            lessons: lessonCounts[s.slug] || 0,
            exercises: s.exercise_count || 0,
            color: colorMap[s.color || 'blue'] || 'from-blue-500 to-blue-600'
          }))
      ]
    : filteredSubjects.map(s => ({
        id: s.slug,
        title: s.name,
        description: s.description || '',
        icon: iconMap[s.icon_name || 'book-open'] || BookOpen,
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
                onClick={() => {
                  setSelectedGrade(grade.id);
                  setSelectedSeries(null); // Reset series when grade changes
                }}
                className="min-w-[80px]"
              >
                {grade.label}
              </Button>
            ))}
          </div>
        </Card>

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

        {((!isNS3OrNS4 && displaySubjects.length > 0) || (isNS3OrNS4 && selectedSeries && displaySubjects.length > 0)) ? (
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

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {displaySubjects.map((subject, index) => {
            const IconComponent = subject.icon;
            // Check if subject has published lessons
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
                      const isMath = subject.id === 'mathematiques' || subject.id === 'matematik-8af' || subject.id === 'mathematiques-af9';
                      const isSciences = subject.id === 'sciences' || subject.id === 'sciences-experimentales-8af' || subject.id === 'sciences-experimentales' || subject.id === 'sciences-experimentales-7af';
                      const isAnglais = subject.id === 'anglais' || subject.id === 'anglais-8af' || subject.id === 'anglais-af9';
                      const isEspagnol = subject.id === 'espagnol' || subject.id === 'espagnol-8af' || subject.id === 'espagnol-af9';
                      
                      let courseRoute;
                      const isCreole = subject.id === 'creole' || subject.id === 'creole-8af';
                      const isSciencesSociales = subject.id === 'sciences-sociales' || subject.id === 'sciences-sociales-8af';
                      if (isMath) {
                        courseRoute = selectedGrade === '9AF' ? '/mathematiques-af9' : (selectedGrade === '8AF' ? '/math-af8-course' : '/math-course');
                      } else if (isSciences) {
                        courseRoute = selectedGrade === '9AF' ? '/sciences-experimentales-af9' : (selectedGrade === '8AF' ? '/sciences-af8-course' : '/sciences-experimentales-7af');
                      } else if (isAnglais) {
                        courseRoute = selectedGrade === '9AF' ? '/anglais-af9' : (selectedGrade === '8AF' ? '/anglais-af8-course' : '/anglais-course');
                      } else if (isEspagnol) {
                        courseRoute = selectedGrade === '9AF' ? '/espagnol-af9' : (selectedGrade === '8AF' ? '/espagnol-af8-course' : '/espagnol-course');
                      } else if (isCreole) {
                        courseRoute = selectedGrade === '8AF' ? '/creole-af8-course' : '/creole-course';
                      } else if (isSciencesSociales) {
                        courseRoute = selectedGrade === '8AF' ? '/sciences-sociales-af8-course' : '/sciences-sociales-course';
                      } else if (subject.id === 'francais') {
                        courseRoute = '/francais-course';
                      } else if (subject.id === 'arts') {
                        courseRoute = '/arts-course';
                      } else if (subject.id === 'education-physique') {
                        courseRoute = '/education-physique-course';
                      } else if (subject.id === 'francais-9af' || subject.id === 'français-9af') {
                        courseRoute = '/francais-af9';
                      } else {
                        // For dynamically created subjects, use new route format
                        courseRoute = `/course/${subject.id}`;
                      }
                      
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
