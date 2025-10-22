import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MusicSelector } from "@/components/MusicSelector";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Lesson {
  id: string;
  slug: string;
  title: string;
  objectif: string;
  mois: string;
}

const EspagnolCourse = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        // Get the Espagnol subject
        const { data: subject, error: subjectError } = await supabase
          .from('subjects')
          .select('id')
          .eq('slug', 'espagnol')
          .maybeSingle();

        if (subjectError) throw subjectError;
        if (!subject) {
          toast.error("Matière Espagnol non trouvée");
          return;
        }

        // Fetch lessons for this subject
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, slug, title, objectif, mois')
          .eq('subject_id', subject.id)
          .eq('grade_level', '7AF')
          .eq('is_published', true)
          .order('order_index');

        if (lessonsError) throw lessonsError;

        setLessons(lessonsData || []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        toast.error("Erreur lors du chargement des leçons");
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const handleLessonClick = (slug: string) => {
    navigate(`/espagnol-lesson/${slug}`);
  };

  // Group lessons by month
  const lessonsByMonth = lessons.reduce((acc, lesson) => {
    const month = lesson.mois || 'Sans mois';
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation Bar */}
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/matieres')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <span className="text-6xl">🇪🇸</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Espagnol - 7ème AF
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cours d'espagnol selon le programme MENFP
          </p>
        </div>

        <MusicSelector />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Leçons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{lessons.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Mois Couverts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {Object.keys(lessonsByMonth).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Niveau
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">7AF</div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement des leçons...</p>
          </div>
        ) : lessons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Aucune leçon disponible pour le moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(lessonsByMonth).map(([month, monthLessons]) => (
              <div key={month}>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">{month}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {monthLessons.map((lesson) => (
                    <Card
                      key={lesson.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => handleLessonClick(lesson.slug)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="group-hover:text-primary transition-colors">
                              {lesson.title}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {lesson.objectif}
                            </CardDescription>
                          </div>
                          <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          Commencer la leçon
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EspagnolCourse;
