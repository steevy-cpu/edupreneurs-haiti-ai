import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, BookOpen, Calendar, GraduationCap, Languages, Sparkles, TrendingUp, Award, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MusicSelector } from "@/components/MusicSelector";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ericStudentDesk from "@/assets/eric-student-desk.png";

interface Lesson {
  id: string;
  slug: string;
  title: string;
  objectif: string;
  mois: string;
}

const EspagnolCourse = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedLessonSlugs, setCompletedLessonSlugs] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the Espagnol subject
        const { data: subject, error: subjectError } = await supabase
          .from('subjects')
          .select('id')
          .eq('slug', 'espagnol')
          .maybeSingle();

        if (subjectError) throw subjectError;
        if (!subject) {
          toast.error("Matière Espagnol non trouvée");
          return;
        }

        // Fetch lessons for this subject
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, slug, title, objectif, mois')
          .eq('subject_id', subject.id)
          .eq('grade_level', '7AF')
          .eq('is_published', true)
          .order('order_index');

        if (lessonsError) throw lessonsError;

        setLessons(lessonsData || []);

        // Fetch completed lessons
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: completions } = await supabase
            .from('lesson_completions')
            .select('lesson_slug')
            .eq('user_id', user.id)
            .eq('subject', 'espagnol');

          if (completions) {
            setCompletedLessonSlugs(completions.map(c => c.lesson_slug));
          }
        }
      } catch (error) {
        console.error('Error fetching lessons:', error);
        toast.error("Erreur lors du chargement des leçons");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLessonClick = (slug: string) => {
    navigate(`/espagnol-lesson/${slug}`);
  };

  // Group lessons by month
  const lessonsByMonth = lessons.reduce((acc, lesson) => {
    const month = lesson.mois || 'Sans mois';
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const completedCount = completedLessonSlugs.length;
  const totalCount = lessons.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-amber-50 dark:from-orange-950/20 dark:via-background dark:to-amber-950/20">
      {/* Navigation Bar with gradient */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-orange-200/50 dark:border-orange-800/50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/matieres')}
            className="gap-2 hover:bg-orange-100 dark:hover:bg-orange-900/30"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Retour aux matières</span>
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Enhanced Hero Section with Eric */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <Badge variant="secondary" className="text-sm font-medium px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
              Programme MENFP - 7ème Année Fondamentale
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 bg-clip-text text-transparent">
              Cours d'Espagnol
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              ¡Hola! Découvre la langue et la culture hispanophone à travers des leçons interactives et engageantes 🌎
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="px-4 py-2 border-orange-300 dark:border-orange-700">
                <GraduationCap className="w-4 h-4 mr-2" />
                Débutant
              </Badge>
              <Badge variant="outline" className="px-4 py-2 border-amber-300 dark:border-amber-700">
                <Sparkles className="w-4 h-4 mr-2" />
                Interactif
              </Badge>
              <Badge variant="outline" className="px-4 py-2 border-red-300 dark:border-red-700">
                <Award className="w-4 h-4 mr-2" />
                Certifié MENFP
              </Badge>
            </div>

            {/* Progress Card */}
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-2 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    Votre Progression
                  </CardTitle>
                  <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/50">
                    {progressPercentage}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progressPercentage} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {completedCount} sur {totalCount} leçons complétées
                  </span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {totalCount - completedCount} restantes
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Eric Image */}
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/50 dark:to-amber-950/50 rounded-3xl p-8 border-2 border-orange-200 dark:border-orange-800 shadow-2xl">
              <img 
                src={ericStudentDesk} 
                alt="Eric enseigne l'espagnol" 
                className="w-full h-auto rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>

        <MusicSelector />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-fade-in">
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-orange-200 dark:border-orange-800">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Leçons
                </CardTitle>
                <BookOpen className="w-5 h-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                {lessons.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Disponibles maintenant</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-amber-200 dark:border-amber-800">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Mois Couverts
                </CardTitle>
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {Object.keys(lessonsByMonth).length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Progression structurée</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4 animate-pulse">
              <Languages className="w-12 h-12 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-lg text-muted-foreground">Chargement des leçons...</p>
          </div>
        ) : lessons.length === 0 ? (
          <Card className="border-dashed border-2 border-orange-300 dark:border-orange-700">
            <CardContent className="py-16 text-center">
              <Languages className="w-16 h-16 mx-auto mb-4 text-orange-400" />
              <p className="text-lg text-muted-foreground">
                Aucune leçon disponible pour le moment.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Les leçons seront bientôt ajoutées !
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Calendar className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                Programme de l'année
              </h2>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                {lessons.length} leçons
              </Badge>
            </div>

            <Accordion type="single" collapsible defaultValue={Object.keys(lessonsByMonth)[0]} className="space-y-4">
              {Object.entries(lessonsByMonth).map(([month, monthLessons], index) => (
                <AccordionItem 
                  key={month} 
                  value={month}
                  className="border-2 rounded-xl overflow-hidden bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/20 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                          {index + 1}
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            {month}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {monthLessons.length} {monthLessons.length === 1 ? 'leçon' : 'leçons'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/30">
                        Mois {index + 1}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                      {monthLessons.map((lesson, lessonIndex) => {
                        const isCompleted = completedLessonSlugs.includes(lesson.slug);
                        return (
                          <Card
                            key={lesson.id}
                            className={`group cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-orange-950/30 ${
                              isCompleted 
                                ? 'border-green-400 dark:border-green-600 ring-2 ring-green-200 dark:ring-green-900' 
                                : 'border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600'
                            }`}
                            onClick={() => handleLessonClick(lesson.slug)}
                          >
                            <CardHeader className="relative">
                              <div className="absolute top-4 right-4 flex gap-2">
                                {isCompleted && (
                                  <Badge className="bg-green-500 hover:bg-green-600">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Complété
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300">
                                  #{lessonIndex + 1}
                                </Badge>
                              </div>
                              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform ${
                                isCompleted 
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                                  : 'bg-gradient-to-br from-orange-500 to-amber-500'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle2 className="w-7 h-7 text-white" />
                                ) : (
                                  <BookOpen className="w-7 h-7 text-white" />
                                )}
                              </div>
                              <CardTitle className="text-lg group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                                {lesson.title}
                              </CardTitle>
                              <CardDescription className="mt-2 line-clamp-3 text-sm">
                                {stripHtml(lesson.objectif)}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Button
                                className={`w-full text-white shadow-lg group-hover:shadow-xl transition-all duration-300 ${
                                  isCompleted
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                    : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700'
                                }`}
                              >
                                <span>{isCompleted ? 'Réviser' : 'Commencer'}</span>
                                <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Motivational CTA at bottom */}
        {lessons.length > 0 && (
          <Card className="mt-12 border-2 border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 overflow-hidden">
            <CardContent className="py-12 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-red-500/10"></div>
              <div className="relative z-10 space-y-4">
                <Sparkles className="w-12 h-12 mx-auto text-orange-600 dark:text-orange-400 mb-4" />
                <h3 className="text-2xl font-bold">Prêt à commencer ton voyage en espagnol ? 🚀</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Chaque leçon t'apprend du nouveau vocabulaire, de la grammaire et te rapproche de la maîtrise de l'espagnol !
                </p>
                <Button 
                  size="lg"
                  className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => handleLessonClick(lessons[0].slug)}
                >
                  <Languages className="w-5 h-5 mr-2" />
                  Commencer maintenant
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EspagnolCourse;
