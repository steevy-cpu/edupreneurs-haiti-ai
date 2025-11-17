import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, BookOpen, Calendar, GraduationCap, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { OptimizedImage } from "@/components/OptimizedImage";
import { EricChatbot } from "@/components/EricChatbot";
import ericEdupreneurs from "@/assets/eric-edupreneurs.png";
import { CardDescription } from "@/components/ui/card";

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
        .eq("grade_level", "9AF")
        .maybeSingle();

      if (subjectError) throw subjectError;

      if (subjectData) {
        // Then get lessons using the subject_id
        const { data, error } = await supabase
          .from("lessons")
          .select("*")
          .eq("subject_id", subjectData.id)
          .eq("grade_level", "9AF")
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
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 mb-8 md:mb-12 max-w-6xl mx-auto">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-4 md:mb-6 shadow-lg">
              <BookOpen className="h-8 w-8 md:h-10 md:w-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Mathématiques AF9
            </h1>
            <p className="text-base md:text-xl text-muted-foreground mb-4 md:mb-6">
              Maîtriser les techniques opératoires, la géométrie et les transformations
            </p>
          </div>
          <div className="flex-shrink-0">
            <OptimizedImage
              src={ericEdupreneurs}
              alt="Eric - Votre assistant d'apprentissage"
              className="w-32 md:w-48 lg:w-64 h-auto"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <Card className="text-center p-4 md:p-6 border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
            <div className="flex justify-center mb-2 md:mb-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md">
                <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1 md:mb-2">
              {lessons.length}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">Leçons disponibles</p>
          </Card>
          <Card className="text-center p-4 md:p-6 border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
            <div className="flex justify-center mb-2 md:mb-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md">
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1 md:mb-2">
              {Object.keys(groupedByMonth).length}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">Mois de cours</p>
          </Card>
          <Card className="text-center p-4 md:p-6 border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background sm:col-span-2 lg:col-span-1">
            <div className="flex justify-center mb-2 md:mb-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md">
                <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1 md:mb-2">
              9ème AF
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">Année Fondamentale</p>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12 md:pb-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {monthOrder.map((month) => {
              const monthLessons = groupedByMonth[month];
              if (!monthLessons || monthLessons.length === 0) return null;

              return (
                <div key={month} className="space-y-3 md:space-y-4">
                  <div className={`p-3 md:p-4 rounded-lg bg-gradient-to-r ${monthColors[month] || "from-gray-500/20 to-gray-600/20"}`}>
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                      <Calendar className="h-5 w-5 md:h-6 md:w-6" />
                      {month}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
                        <CardHeader className="p-4 md:p-6">
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
                          <CardTitle className="text-base md:text-lg group-hover:text-primary transition-colors line-clamp-2">
                            {lesson.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                            {stripHtml(lesson.objectif)}
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

      {/* Eric Chatbot */}
      <EricChatbot />
    </div>
  );
};

export default MathCourseAF9;
