import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  mois: string;
  order_index: number;
  is_published: boolean;
}

const CreoleCourseAF8 = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      // First get the subject
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('slug', 'creole-8af')
        .eq('grade_level', '8AF')
        .single();

      if (subjectError) throw subjectError;

      // Then get all lessons for this subject
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
      toast.error("Erreur lors du chargement des leçons");
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

  const monthOrder = ['Décembre', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet'];

  const monthColors: Record<string, string> = {
    'Décembre': 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    'Janvier': 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
    'Février': 'from-red-500/10 to-orange-500/10 border-red-500/20',
    'Mars': 'from-green-500/10 to-emerald-500/10 border-green-500/20',
    'Avril': 'from-yellow-500/10 to-amber-500/10 border-yellow-500/20',
    'Mai': 'from-indigo-500/10 to-blue-500/10 border-indigo-500/20',
    'Juin': 'from-teal-500/10 to-cyan-500/10 border-teal-500/20',
    'Juillet': 'from-orange-500/10 to-red-500/10 border-orange-500/20',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-teal-500 mb-4">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
            Créole - AF8
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Programme complet de créole haïtien pour la classe de AF8
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {monthOrder.map((month) => {
              const monthLessons = groupedByMonth[month];
              if (!monthLessons || monthLessons.length === 0) return null;

              return (
                <div key={month} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">{month}</h2>
                    <span className="text-sm text-muted-foreground">
                      {monthLessons.length} leçon{monthLessons.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {monthLessons.map((lesson) => (
                      <Card
                        key={lesson.id}
                        className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 bg-gradient-to-br ${monthColors[month] || 'from-primary/10 to-secondary/10'}`}
                        onClick={() => {
                          if (lesson.is_published) {
                            navigate(`/creole-af8-lesson/${lesson.slug}`);
                          } else {
                            toast.info("Cette leçon sera bientôt disponible");
                          }
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {lesson.title}
                            </CardTitle>
                            {!lesson.is_published && (
                              <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded-full">
                                Bientôt
                              </span>
                            )}
                          </div>
                          <CardDescription className="line-clamp-2">
                            {lesson.objectif}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="w-4 h-4" />
                            <span>Leçon {lesson.order_index}</span>
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

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Button
            onClick={() => navigate("/matieres")}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux matières
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreoleCourseAF8;
