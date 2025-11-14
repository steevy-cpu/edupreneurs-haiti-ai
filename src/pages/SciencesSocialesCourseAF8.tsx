import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Clock, Award, Globe } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OptimizedImage } from "@/components/OptimizedImage";
import ericPhoto from "@/assets/eric-edupreneurs.png";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  mois: string;
  order_index: number;
  is_published: boolean;
}

const SciencesSocialesCourseAF8 = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, slug, objectif, mois, order_index, is_published')
        .eq('subject_id', (
          await supabase
            .from('subjects')
            .select('id')
            .eq('slug', 'sciences-sociales-8af')
            .eq('grade_level', 'AF8')
            .single()
        ).data?.id)
        .order('order_index');

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
    const month = lesson.mois || "Sans mois";
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  const monthOrder = ["Décembre", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin"];


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
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 mb-6 shadow-lg">
              <Globe className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Sciences Sociales AF8
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Explorez l'histoire et la géographie haïtienne et mondiale
            </p>
          </div>
          <div className="hidden md:block">
            <OptimizedImage 
              src={ericPhoto}
              alt="Eric - Professeur"
              className="w-64 h-64 object-cover rounded-2xl shadow-lg"
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
                  <h2 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400">{month}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {monthLessons.map((lesson) => (
                      <Card
                        key={lesson.id}
                        className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
                          lesson.is_published ? 'cursor-pointer' : 'opacity-60'
                        }`}
                        onClick={() => {
                          if (lesson.is_published) {
                            navigate(`/sciences-sociales-af8-lesson/${lesson.slug}`);
                          } else {
                            toast.info("Cette leçon n'est pas encore publiée");
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
                          <CardTitle className="text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                            {lesson.title}
                          </CardTitle>
                          {lesson.objectif && (
                            <CardDescription 
                              className="line-clamp-2"
                            >
                              {lesson.objectif.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>1-2 semaines</span>
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

export default SciencesSocialesCourseAF8;
