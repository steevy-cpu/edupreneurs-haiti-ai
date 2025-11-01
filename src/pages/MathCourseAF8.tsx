import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Clock, Award } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  mois: string;
  order_index: number;
  is_published: boolean;
}

const MathCourseAF8 = () => {
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
        .eq('slug', 'matematik-8af')
        .eq('grade_level', 'AF8')
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
        .eq('grade_level', 'AF8')
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
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-6 shadow-lg">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Mathématiques AF8
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Programme complet de mathématiques pour la 8ème année fondamentale
          </p>
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
                  <h2 className="text-2xl font-bold mb-4 text-primary">{month}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {monthLessons.map((lesson) => (
                      <Card
                        key={lesson.id}
                        className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
                          lesson.is_published ? 'cursor-pointer' : 'opacity-60'
                        }`}
                        onClick={() => {
                          if (lesson.is_published) {
                            navigate(`/math-af8-lesson/${lesson.slug}`);
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
                              {lesson.objectif}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>2 semaines</span>
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

export default MathCourseAF8;
