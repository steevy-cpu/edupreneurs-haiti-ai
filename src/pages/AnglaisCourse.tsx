import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  Languages,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Target
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import ericRightPointing from "@/assets/eric-right-pointing.png";
import { MusicSelector } from "@/components/MusicSelector";
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objective: string;
  month: string;
}

const stripHtml = (html: string) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export default function AnglaisCourse() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedLessonSlugs, setCompletedLessonSlugs] = useState<Set<string>>(new Set());
  const [userGold, setUserGold] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: subject, error: subjectError } = await supabase
          .from('subjects')
          .select('id')
          .eq('slug', 'anglais')
          .eq('grade_level', '7AF')
          .single();

        if (subjectError) throw subjectError;

        if (subject) {
          const { data: lessonsData, error: lessonsError } = await supabase
            .from('lessons')
            .select('id, slug, title, objectif, mois')
            .eq('subject_id', subject.id)
            .order('order_index', { ascending: true });

          if (lessonsError) throw lessonsError;

          const mapped = (lessonsData || []).map(l => ({
            id: l.id,
            slug: l.slug,
            title: l.title,
            objective: l.objectif,
            month: l.mois
          }));
          setLessons(mapped);

          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('gold_earned')
              .eq('user_id', user.id)
              .single();

            if (profile) {
              setUserGold(profile.gold_earned || 0);
            }

            const { data: completions, error: completionsError } = await supabase
              .from('lesson_completions')
              .select('lesson_slug')
              .eq('user_id', user.id)
              .eq('subject', 'anglais');

            if (completionsError) {
              console.error('Error fetching completions:', completionsError);
            } else if (completions) {
              setCompletedLessonSlugs(new Set(completions.map(c => c.lesson_slug)));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching lessons:', error);
        toast.error('Erreur lors du chargement des leçons');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalLessons = lessons.length;
  const completedLessons = completedLessonSlugs.size;
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const groupedByMonth = lessons.reduce((acc, lesson) => {
    const month = lesson.month || 'Sans mois';
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  const monthColors = [
    'from-sky-500 to-cyan-600',
    'from-cyan-500 to-blue-600',
    'from-blue-500 to-indigo-600',
    'from-indigo-500 to-purple-600',
    'from-purple-500 to-fuchsia-600',
    'from-fuchsia-500 to-pink-600',
    'from-pink-500 to-rose-600'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-sky-500/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-sky-500/5">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/matieres")}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-semibold">Retour</span>
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full border border-yellow-500/30">
                <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-foreground">{userGold}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        {/* Hero Section with Eric */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <Badge variant="secondary" className="text-sm font-medium px-4 py-1.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300">
              Programme MENFP - 7ème Année Fondamentale
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent">
              Anglais
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Master English language skills through interactive lessons, vocabulary, grammar, and conversation practice 🇺🇸
            </p>

            {/* Progress Card */}
            <Card className="bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30 border-2 border-sky-200 dark:border-sky-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    Votre Progression
                  </CardTitle>
                  <Badge variant="secondary" className="bg-sky-100 dark:bg-sky-900/50">
                    {Math.round(progress)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {completedLessons} sur {totalLessons} leçons complétées
                  </span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400">
                    {totalLessons - completedLessons} restantes
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="px-4 py-2 border-sky-300 dark:border-sky-700">
                <Languages className="w-4 h-4 mr-2" />
                {totalLessons} Leçons
              </Badge>
              <Badge variant="outline" className="px-4 py-2 border-cyan-300 dark:border-cyan-700">
                <Target className="w-4 h-4 mr-2" />
                Programme 7AF
              </Badge>
            </div>
          </div>

          {/* Eric Image */}
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-cyan-400/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-sky-950/50 dark:to-cyan-950/50 rounded-3xl p-8 border-2 border-sky-200 dark:border-sky-800 shadow-2xl">
              <img 
                src={ericRightPointing} 
                alt="Eric enseigne l'anglais" 
                className="w-full h-auto rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>

        <MusicSelector />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-fade-in">
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-sky-200 dark:border-sky-800">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Leçons
                </CardTitle>
                <BookOpen className="w-5 h-5 text-sky-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                {totalLessons}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Disponibles maintenant</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-cyan-200 dark:border-cyan-800">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Leçons Complétées
                </CardTitle>
                <CheckCircle2 className="w-5 h-5 text-cyan-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {completedLessons}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Bien joué !</p>
            </CardContent>
          </Card>
        </div>

        {/* Lessons Grid */}
        <div className="space-y-8 animate-fade-in">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-sky-600 dark:text-sky-400" />
            Programme de l'année
          </h2>

          {Object.entries(groupedByMonth).map(([month, monthLessons], monthIndex) => (
            <div key={month} className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${monthColors[monthIndex % monthColors.length]} flex items-center justify-center text-white font-bold shadow-lg`}>
                  {monthIndex + 1}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{month}</h3>
                  <p className="text-sm text-muted-foreground">
                    {monthLessons.length} {monthLessons.length === 1 ? 'leçon' : 'leçons'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthLessons.map((lesson, lessonIndex) => {
                  const isCompleted = completedLessonSlugs.has(lesson.slug);
                  
                  return (
                    <Card
                      key={lesson.id}
                      className={`group cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                        isCompleted 
                          ? 'border-green-400 dark:border-green-600 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30' 
                          : 'border-sky-200 dark:border-sky-800 hover:border-sky-400 dark:hover:border-sky-600 bg-gradient-to-br from-white to-sky-50/50 dark:from-gray-900 dark:to-sky-950/30'
                      }`}
                      onClick={() => navigate(`/anglais-lesson/${lesson.slug}`)}
                    >
                      <CardHeader className="relative">
                        <div className="absolute top-4 right-4 flex gap-2">
                          {isCompleted && (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Complété
                            </Badge>
                          )}
                          <Badge variant="secondary" className="bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300">
                            #{lessonIndex + 1}
                          </Badge>
                        </div>
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform ${
                          isCompleted 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                            : `bg-gradient-to-br ${monthColors[monthIndex % monthColors.length]}`
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-7 h-7 text-white" />
                          ) : (
                            <Languages className="w-7 h-7 text-white" />
                          )}
                        </div>
                        <CardTitle className="text-lg group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
                          {lesson.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                          {stripHtml(lesson.objective)}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <Button
                          className={`w-full text-white shadow-lg group-hover:shadow-xl transition-all duration-300 ${
                            isCompleted
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                              : 'bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700'
                          }`}
                        >
                          {isCompleted ? 'Réviser' : 'Commencer'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
