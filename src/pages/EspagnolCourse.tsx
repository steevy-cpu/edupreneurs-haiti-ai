import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, BookOpen, Calendar, GraduationCap, Languages, Sparkles, TrendingUp, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MusicSelector } from "@/components/MusicSelector";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  useEffect(() => {
    const fetchLessons = async () => {
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
      } catch (error) {
        console.error('Error fetching lessons:', error);
        toast.error("Erreur lors du chargement des leçons");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50 dark:from-purple-950/20 dark:via-background dark:to-blue-950/20">
      {/* Navigation Bar with gradient */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-purple-200/50 dark:border-purple-800/50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/matieres')}
            className="gap-2 hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Retour aux matières</span>
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Enhanced Hero Section with animations */}
        <div className="text-center mb-16 space-y-6 animate-fade-in">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative p-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 shadow-2xl">
              <Languages className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <Badge variant="secondary" className="text-sm font-medium px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
              Programme MENFP - 7ème Année Fondamentale
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-scale-in">
              Espagnol
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Découvre la langue et la culture hispanophone à travers des leçons interactives et engageantes 🌎
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge variant="outline" className="px-4 py-2 border-purple-300 dark:border-purple-700">
              <GraduationCap className="w-4 h-4 mr-2" />
              Débutant
            </Badge>
            <Badge variant="outline" className="px-4 py-2 border-pink-300 dark:border-pink-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Interactif
            </Badge>
            <Badge variant="outline" className="px-4 py-2 border-blue-300 dark:border-blue-700">
              <Award className="w-4 h-4 mr-2" />
              Certifié MENFP
            </Badge>
          </div>
        </div>

        <MusicSelector />

        {/* Enhanced Stats Cards with gradients and animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in">
          <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border-purple-200 dark:border-purple-800 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Leçons
                </CardTitle>
                <BookOpen className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {lessons.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Disponibles maintenant</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border-pink-200 dark:border-pink-800 group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Mois Couverts
                </CardTitle>
                <Calendar className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {Object.keys(lessonsByMonth).length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Progression structurée</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border-blue-200 dark:border-blue-800 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ton Niveau
                </CardTitle>
                <TrendingUp className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                7AF
              </div>
              <p className="text-sm text-muted-foreground mt-1">En progression</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4 animate-pulse">
              <Languages className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-lg text-muted-foreground">Chargement des leçons...</p>
          </div>
        ) : lessons.length === 0 ? (
          <Card className="border-dashed border-2 border-purple-300 dark:border-purple-700">
            <CardContent className="py-16 text-center">
              <Languages className="w-16 h-16 mx-auto mb-4 text-purple-400" />
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
                <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
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
                  className="border-2 rounded-xl overflow-hidden bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                          {index + 1}
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {month}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {monthLessons.length} {monthLessons.length === 1 ? 'leçon' : 'leçons'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/30">
                        Mois {index + 1}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                      {monthLessons.map((lesson, lessonIndex) => (
                        <Card
                          key={lesson.id}
                          className="group cursor-pointer overflow-hidden border-2 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/30"
                          onClick={() => handleLessonClick(lesson.slug)}
                        >
                          <CardHeader className="relative">
                            <div className="absolute top-4 right-4">
                              <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                                #{lessonIndex + 1}
                              </Badge>
                            </div>
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                              <BookOpen className="w-7 h-7 text-white" />
                            </div>
                            <CardTitle className="text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                              {lesson.title}
                            </CardTitle>
                            <CardDescription className="mt-2 line-clamp-3 text-sm">
                              {lesson.objectif}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
                            >
                              <span>Commencer</span>
                              <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Motivational CTA at bottom */}
        {lessons.length > 0 && (
          <Card className="mt-12 border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 overflow-hidden">
            <CardContent className="py-12 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10"></div>
              <div className="relative z-10 space-y-4">
                <Sparkles className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400 mb-4" />
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
