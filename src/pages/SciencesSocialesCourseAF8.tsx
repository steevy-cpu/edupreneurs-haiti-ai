import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, BookOpen, Clock, Calendar } from "lucide-react";
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

  const monthColors: Record<string, string> = {
    "Décembre": "from-blue-500/20 to-cyan-500/20",
    "Janvier": "from-purple-500/20 to-pink-500/20",
    "Février": "from-green-500/20 to-emerald-500/20",
    "Mars": "from-orange-500/20 to-red-500/20",
    "Avril": "from-yellow-500/20 to-amber-500/20",
    "Mai": "from-indigo-500/20 to-blue-500/20",
    "Juin": "from-teal-500/20 to-cyan-500/20"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/matieres")}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour aux matières
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Sciences Sociales - AF8
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explorez l'histoire et la géographie haïtienne et mondiale
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center space-y-2 bg-gradient-to-br from-primary/10 to-transparent">
                <BookOpen className="h-8 w-8 mx-auto text-primary" />
                <div className="text-3xl font-bold">{lessons.length}</div>
                <div className="text-sm text-muted-foreground">Leçons</div>
              </Card>
              <Card className="p-6 text-center space-y-2 bg-gradient-to-br from-secondary/10 to-transparent">
                <Calendar className="h-8 w-8 mx-auto text-secondary-foreground" />
                <div className="text-3xl font-bold">{Object.keys(groupedByMonth).length}</div>
                <div className="text-sm text-muted-foreground">Mois</div>
              </Card>
              <Card className="p-6 text-center space-y-2 bg-gradient-to-br from-accent/10 to-transparent">
                <Clock className="h-8 w-8 mx-auto text-accent-foreground" />
                <div className="text-3xl font-bold">2024-2025</div>
                <div className="text-sm text-muted-foreground">Année scolaire</div>
              </Card>
            </div>

            <div className="space-y-8">
              {monthOrder.map((month) => {
                const monthLessons = groupedByMonth[month];
                if (!monthLessons) return null;

                return (
                  <div key={month} className="space-y-4">
                    <div className={`p-6 rounded-lg bg-gradient-to-r ${monthColors[month]} border`}>
                      <h2 className="text-2xl font-bold">{month}</h2>
                      <p className="text-sm text-muted-foreground">
                        {monthLessons.length} leçon{monthLessons.length > 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {monthLessons.map((lesson) => (
                        <Card
                          key={lesson.id}
                          className="p-6 space-y-4 hover:shadow-lg transition-all cursor-pointer group"
                          onClick={() => {
                            if (lesson.is_published) {
                              navigate(`/sciences-sociales-af8-lesson/${lesson.slug}`);
                            } else {
                              toast.info("Cette leçon sera bientôt disponible");
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                                {lesson.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {lesson.objectif}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              Leçon {lesson.order_index}
                            </Badge>
                            {!lesson.is_published && (
                              <Badge variant="secondary" className="text-xs">
                                Bientôt
                              </Badge>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SciencesSocialesCourseAF8;
