import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Languages, Clock, Award, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OptimizedImage } from "@/components/OptimizedImage";
import ericEdupreneurs from "@/assets/eric-edupreneurs.png";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  mois: string;
  order_index: number;
  is_published: boolean;
}

const EspagnolCourseAF9 = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data: subject } = await supabase
        .from('subjects')
        .select('id')
        .eq('slug', 'espagnol-af9')
        .eq("grade_level", "9AF")
        .single();

      if (!subject) {
        toast({
          title: "Erreur",
          description: "Matière non trouvée",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('subject_id', subject.id)
        .eq('grade_level', '9AF')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les leçons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupedByMonth = lessons.reduce((acc, lesson) => {
    const month = lesson.mois || 'Non classé';
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  const monthOrder = ['Décembre', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'];
  const monthColors: Record<string, string> = {
    'Décembre': 'from-orange-500 to-amber-600',
    'Janvier': 'from-amber-500 to-yellow-600',
    'Février': 'from-yellow-500 to-orange-600',
    'Mars': 'from-orange-600 to-red-600',
    'Avril': 'from-red-500 to-orange-500',
    'Mai': 'from-amber-600 to-orange-700',
    'Juin': 'from-yellow-600 to-amber-700'
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    let text = tmp.textContent || tmp.innerText || '';
    text = text.replace(/🎯\s*Objectifs\s*:?\s*/gi, '').trim();
    return text;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/matieres")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux matières
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 max-w-6xl mx-auto">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Languages className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">9ème Année Fondamentale</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              Cours d'Espagnol
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Maîtrise de la langue espagnole : communication, grammaire et expression écrite et orale
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center md:justify-start">
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {lessons.length} leçons
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Award className="h-3 w-3" />
                Programme MENFP
              </Badge>
            </div>
          </div>
          <div className="flex-shrink-0">
            <OptimizedImage
              src={ericEdupreneurs}
              alt="Eric - Assistant d'apprentissage"
              className="w-48 h-48 object-contain"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : lessons.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Aucune leçon disponible pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8 max-w-6xl mx-auto">
            {monthOrder.map((month) => {
              const monthLessons = groupedByMonth[month];
              if (!monthLessons || monthLessons.length === 0) return null;

              return (
                <div key={month} className="space-y-4">
                  <div className={`bg-gradient-to-r ${monthColors[month]} p-6 rounded-lg shadow-lg`}>
                    <h2 className="text-2xl font-bold text-white mb-2">{month}</h2>
                    <p className="text-white/90 text-sm">{monthLessons.length} leçon(s)</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {monthLessons.map((lesson) => (
                      <Card
                        key={lesson.id}
                        className="hover:shadow-lg transition-all cursor-pointer group"
                        onClick={() => navigate(`/espagnol-af9/${lesson.slug}`)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              {lesson.title}
                            </CardTitle>
                            {lesson.is_published && (
                              <Badge variant="secondary" className="shrink-0">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Publié
                              </Badge>
                            )}
                          </div>
                          {lesson.objectif && (
                            <CardDescription className="mt-2">
                              {stripHtml(lesson.objectif)}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full" variant="default">
                            Commencer la leçon
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EspagnolCourseAF9;
