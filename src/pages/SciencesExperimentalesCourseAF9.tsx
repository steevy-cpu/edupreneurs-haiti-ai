import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, FlaskConical, BookOpen, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  mois: string | null;
  order_index: number;
  is_published: boolean;
}

export default function SciencesExpérimentalesCourseAF9() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id")
        .eq("slug", "sciences-experimentales")
        .eq("grade_level", "AF9")
        .single();

      if (subjectError) throw subjectError;

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("id, title, slug, objectif, mois, order_index, is_published")
        .eq("subject_id", subjectData.id)
        .order("order_index", { ascending: true });

      if (lessonsError) throw lessonsError;

      setLessons(lessonsData || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Erreur lors du chargement des leçons");
    } finally {
      setLoading(false);
    }
  };

  const groupedByMonth = lessons.reduce((acc, lesson) => {
    const month = lesson.mois || "Non classé";
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  const monthOrder = [
    "Décembre",
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin"
  ];

  const monthColors: Record<string, string> = {
    "Décembre": "from-blue-500 to-blue-600",
    "Janvier": "from-purple-500 to-purple-600",
    "Février": "from-pink-500 to-pink-600",
    "Mars": "from-green-500 to-green-600",
    "Avril": "from-orange-500 to-orange-600",
    "Mai": "from-teal-500 to-teal-600",
    "Juin": "from-emerald-500 to-emerald-600"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/matieres")}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-semibold">Matières</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-emerald-500 to-emerald-600 text-primary-foreground pt-28 md:pt-32 pb-12 md:pb-16 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FlaskConical className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold">Sciences Expérimentales</h1>
              <p className="text-sm md:text-lg opacity-90">9ème Année Fondamentale</p>
            </div>
          </div>
          <p className="text-base md:text-xl opacity-90 max-w-2xl">
            Explorez la physique, la biologie, la géologie et l'environnement selon le programme MENFP
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Course Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Total de leçons</h3>
            </div>
            <p className="text-3xl font-bold text-primary">{lessons.length}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Mois couverts</h3>
            </div>
            <p className="text-3xl font-bold text-primary">{Object.keys(groupedByMonth).length}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Année scolaire</h3>
            </div>
            <p className="text-3xl font-bold text-primary">2024-2025</p>
          </Card>
        </div>

        {/* Lessons by Month */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {monthOrder.map((month) => {
              const monthLessons = groupedByMonth[month];
              if (!monthLessons || monthLessons.length === 0) return null;

              return (
                <div key={month}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-1 flex-grow bg-gradient-to-r ${monthColors[month] || "from-gray-500 to-gray-600"}`} />
                    <h2 className="text-2xl font-bold">{month}</h2>
                    <div className={`h-1 flex-grow bg-gradient-to-r ${monthColors[month] || "from-gray-500 to-gray-600"}`} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {monthLessons.map((lesson) => (
                      <Card
                        key={lesson.id}
                        className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          if (lesson.is_published) {
                            navigate(`/sciences-experimentales-af9/${lesson.slug}`);
                          } else {
                            toast.info("Cette leçon sera bientôt disponible");
                          }
                        }}
                      >
                        <div className={`h-1 bg-gradient-to-r ${monthColors[month] || "from-gray-500 to-gray-600"}`} />
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                              {lesson.title}
                            </h3>
                            {lesson.is_published ? (
                              <Badge variant="default">Publié</Badge>
                            ) : (
                              <Badge variant="secondary">Bientôt</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <strong>Objectif:</strong> {lesson.objectif}
                          </p>
                        </div>
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
}
