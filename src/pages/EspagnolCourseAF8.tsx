import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Languages, Clock, Award } from "lucide-react";
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

const EspagnolCourseAF8 = () => {
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
        .eq('slug', 'espagnol-8af')
        .eq('grade_level', '8AF')
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
        .eq('grade_level', '8AF')
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

  // Strip HTML tags from text
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation Bar */}
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

      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 max-w-6xl mx-auto">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 mb-6 shadow-lg">
              <Languages className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Espagnol AF8
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Programme complet d'espagnol pour la 8ème année fondamentale
            </p>
          </div>
          <div className="flex-shrink-0">
            <OptimizedImage 
              src={ericEdupreneurs} 
              alt="Eric, votre professeur d'espagnol"
              className="w-64 h-64 object-contain"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {monthOrder.map((month) => {
              const monthLessons = groupedByMonth[month];
              if (!monthLessons || monthLessons.length === 0) return null;

              return (
                <div key={month}>
                  <div className={`inline-block mb-4 px-6 py-2 rounded-full bg-gradient-to-r ${monthColors[month]} text-white font-bold text-xl shadow-lg`}>
                    {month}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {monthLessons.map((lesson) => (
                      <Card
                        key={lesson.id}
                        className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
                          lesson.is_published ? 'cursor-pointer' : 'opacity-60'
                        }`}
                        onClick={() => {
                          if (lesson.is_published) {
                            navigate(`/espagnol-af8-lesson/${lesson.slug}`);
                          } else {
                            toast({
                              title: "Leçon non disponible",
                              description: "Cette leçon n'est pas encore publiée",
                            });
                          }
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              Leçon {lesson.order_index}
                            </Badge>
                            {!lesson.is_published && (
                              <Badge variant="secondary" className="text-xs">
                                Bientôt
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {lesson.title}
                          </CardTitle>
                          {lesson.objectif && (
                            <CardDescription className="line-clamp-2">
                              {stripHtml(lesson.objectif)}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>1 semaine</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              <span>50 points</span>
                            </div>
                          </div>
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

export default EspagnolCourseAF8;
