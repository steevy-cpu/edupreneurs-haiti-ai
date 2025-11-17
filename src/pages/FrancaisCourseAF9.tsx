import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Clock, Award, CheckCircle2 } from "lucide-react";
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

const FrancaisCourseAF9 = () => {
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
        .eq('slug', 'francais-9af')
        .eq("grade_level", "9AF")
        .maybeSingle();

      if (!subject) {
        // Try alternative slug
        const { data: altSubject } = await supabase
          .from('subjects')
          .select('id')
          .eq('slug', 'français-9af')
          .eq("grade_level", "9AF")
          .maybeSingle();
        
        if (!altSubject) {
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
          .eq('subject_id', altSubject.id)
          .eq('grade_level', '9AF')
          .order('order_index', { ascending: true });

        if (error) throw error;
        setLessons(data || []);
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
    'Décembre': 'from-blue-500 to-indigo-600',
    'Janvier': 'from-indigo-500 to-purple-600',
    'Février': 'from-purple-500 to-pink-600',
    'Mars': 'from-pink-600 to-rose-600',
    'Avril': 'from-rose-500 to-red-500',
    'Mai': 'from-blue-600 to-indigo-700',
    'Juin': 'from-indigo-600 to-purple-700'
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    let text = tmp.textContent || tmp.innerText || '';
    text = text.replace(/🎯\s*Objectifs\s*:?\s*/gi, '').trim();
    return text;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border/50">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container mx-auto px-4 py-8 relative">
          <Button
            variant="ghost"
            onClick={() => navigate('/matieres')}
            className="mb-6 hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux matières
          </Button>

          <div className="flex flex-col md:flex-row items-center gap-8 max-w-6xl mx-auto">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 backdrop-blur-sm">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <Badge variant="secondary" className="mb-2">9ème AF</Badge>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Français
                  </h1>
                </div>
              </div>
              <p className="text-lg text-muted-foreground">
                Maîtrisez la langue française à travers la littérature, la grammaire et l'expression écrite
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">{lessons.length} leçons</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground">50 points par leçon</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl" />
              <OptimizedImage
                src={ericEdupreneurs}
                alt="Eric - Votre assistant d'apprentissage"
                className="relative w-64 h-64 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lessons Content */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : lessons.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Aucune leçon disponible</CardTitle>
              <CardDescription>
                Les leçons pour cette matière seront bientôt disponibles.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8">
            {monthOrder.map((month) => {
              const monthLessons = groupedByMonth[month];
              if (!monthLessons || monthLessons.length === 0) return null;

              return (
                <div key={month} className="space-y-4">
                  <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${monthColors[month]} text-white shadow-lg`}>
                    <Clock className="h-5 w-5" />
                    <h2 className="text-xl font-bold">{month}</h2>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {monthLessons.map((lesson) => (
                      <Card
                        key={lesson.id}
                        className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm"
                        onClick={() => navigate(`/francais-af9/${lesson.slug}`)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                              {lesson.title}
                            </CardTitle>
                            {lesson.is_published && (
                              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                          <CardDescription className="line-clamp-3">
                            {stripHtml(lesson.objectif)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            Commencer
                            <ArrowLeft className="ml-2 h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
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

export default FrancaisCourseAF9;
