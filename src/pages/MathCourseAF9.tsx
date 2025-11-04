import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, BookOpen, Calendar, GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  mois: string;
  order_index: number;
  is_published: boolean;
}

const MathCourseAF9 = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      // First, get the subject by slug and grade_level
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id")
        .eq("slug", "mathematiques-af9")
        .eq("grade_level", "AF9")
        .maybeSingle();

      if (subjectError) throw subjectError;

      if (subjectData) {
        // Then get lessons using the subject_id
        const { data, error } = await supabase
          .from("lessons")
          .select("*")
          .eq("subject_id", subjectData.id)
          .eq("grade_level", "AF9")
          .order("order_index", { ascending: true });

        if (error) throw error;
        setLessons(data || []);
      } else {
        toast.error("Matière non trouvée");
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
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
    "Décembre": "from-blue-500/20 to-blue-600/20",
    "Janvier": "from-purple-500/20 to-purple-600/20",
    "Février": "from-pink-500/20 to-pink-600/20",
    "Mars": "from-green-500/20 to-green-600/20",
    "Avril": "from-yellow-500/20 to-yellow-600/20",
    "Mai": "from-orange-500/20 to-orange-600/20",
    "Juin": "from-red-500/20 to-red-600/20",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/matieres")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Mathématiques - 9ème AF
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Maîtriser les techniques opératoires, la géométrie et les transformations
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Card className="flex items-center gap-3 px-6 py-3 border-primary/20">
              <BookOpen className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Total Leçons</p>
                <p className="text-2xl font-bold">{lessons.length}</p>
              </div>
            </Card>
            
            <Card className="flex items-center gap-3 px-6 py-3 border-primary/20">
              <Calendar className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Mois couverts</p>
                <p className="text-2xl font-bold">{Object.keys(groupedByMonth).length}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-3 px-6 py-3 border-primary/20">
              <GraduationCap className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground">Année</p>
                <p className="text-2xl font-bold">2024-2025</p>
              </div>
            </Card>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {monthOrder.map((month) => {
              const monthLessons = groupedByMonth[month];
              if (!monthLessons || monthLessons.length === 0) return null;

              return (
                <div key={month} className="space-y-4">
                  <div className={`p-4 rounded-lg bg-gradient-to-r ${monthColors[month] || "from-gray-500/20 to-gray-600/20"}`}>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Calendar className="h-6 w-6" />
                      {month}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {monthLessons.map((lesson) => (
                      <Card
                        key={lesson.id}
                        className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary/50"
                        onClick={() => {
                          if (lesson.is_published) {
                            navigate(`/mathematiques-af9/${lesson.slug}`);
                          } else {
                            toast.info("Cette leçon sera bientôt disponible !");
                          }
                        }}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start mb-2">
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
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {lesson.objectif}
                          </p>
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

export default MathCourseAF9;
