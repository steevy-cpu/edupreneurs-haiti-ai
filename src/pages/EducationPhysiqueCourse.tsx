import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2,
  Sparkles,
  Dumbbell,
  TrendingUp,
  Target
} from "lucide-react";
import ericCelebrating from "@/assets/eric-celebrating.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { MusicSelector } from "@/components/MusicSelector";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  description?: string;
  progress: number;
  goldReward: number;
  isLocked: boolean;
  isCompleted: boolean;
  icon: string;
}

const EducationPhysiqueCourse = () => {
  const navigate = useNavigate();
  const [userGold, setUserGold] = useState(0);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchLessons();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('gold_earned')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setUserGold(profile.gold_earned || 0);
      }

      const { data: completions } = await supabase
        .from('lesson_completions')
        .select('lesson_slug')
        .eq('user_id', user.id)
        .eq('subject', 'education-physique');

      if (completions) {
        setCompletedLessons(new Set(completions.map(c => c.lesson_slug)));
      }
    }
  };

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('slug', 'education-physique')
        .eq('grade_level', '7AF')
        .single();

      if (subjectError || !subjectData) {
        console.error('Error fetching subject:', subjectError);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('subject_id', subjectData.id)
        .eq('grade_level', '7AF')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching lessons:', error);
        return;
      }

      if (data) {
        const formattedLessons: Lesson[] = data.map((lesson, index) => ({
          id: lesson.slug,
          title: lesson.title,
          slug: lesson.slug,
          description: lesson.objectif || '',
          progress: 0,
          goldReward: 100 + (index * 10),
          isLocked: false,
          isCompleted: completedLessons.has(lesson.slug),
          icon: getIconForLesson(index)
        }));
        setLessons(formattedLessons);
      }
    } catch (error) {
      console.error('Error in fetchLessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconForLesson = (index: number): string => {
    const icons = ["🏃", "🤸", "⚡", "🏃‍♂️", "🦘", "⚽", "🏀", "🏐", "🤸‍♂️", "🥗", "🩹", "🎯"];
    return icons[index] || "🏋️";
  };

  const totalProgress = lessons.length > 0 
    ? (lessons.filter(l => l.isCompleted).length / lessons.length) * 100 
    : 0;

  const handleLessonClick = (lessonSlug: string, isLocked: boolean) => {
    if (!isLocked) {
      navigate(`/education-physique-lesson/${lessonSlug}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-red-500/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-red-500/5">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/matieres')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
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
            <Badge variant="secondary" className="text-sm font-medium px-4 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
              Programme MENFP - 7ème Année Fondamentale
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">
              Éducation Physique
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Développez vos compétences physiques, sportives et votre santé à travers une pratique régulière 💪
            </p>

            {/* Progress Card */}
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-red-200 dark:border-red-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                    Votre Progression
                  </CardTitle>
                  <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/50">
                    {Math.round(totalProgress)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={totalProgress} className="h-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {lessons.filter(l => l.isCompleted).length} sur {lessons.length} leçons complétées
                  </span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {lessons.length - lessons.filter(l => l.isCompleted).length} restantes
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="px-4 py-2 border-red-300 dark:border-red-700">
                <Dumbbell className="w-4 h-4 mr-2" />
                {lessons.length} Leçons
              </Badge>
              <Badge variant="outline" className="px-4 py-2 border-orange-300 dark:border-orange-700">
                <Target className="w-4 h-4 mr-2" />
                Programme 7AF
              </Badge>
            </div>
          </div>

          {/* Eric Image */}
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50 rounded-3xl p-8 border-2 border-red-200 dark:border-red-800 shadow-2xl">
              <img
                src={ericCelebrating}
                alt="Eric - Coach sportif"
                className="w-full h-auto rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>

        <MusicSelector />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-fade-in">
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-red-200 dark:border-red-800">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Leçons
                </CardTitle>
                <BookOpen className="w-5 h-5 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                {lessons.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Disponibles maintenant</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-orange-200 dark:border-orange-800">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Leçons Complétées
                </CardTitle>
                <CheckCircle2 className="w-5 h-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {lessons.filter(l => l.isCompleted).length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Excellent travail !</p>
            </CardContent>
          </Card>
        </div>

        {/* Lessons Grid */}
        <div className="space-y-8 animate-fade-in">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-red-600 dark:text-red-400" />
            Programme de l'année
          </h2>

          {lessons.length === 0 ? (
            <Card className="border-dashed border-2 border-red-300 dark:border-red-700">
              <CardContent className="py-16 text-center">
                <Dumbbell className="w-16 h-16 mx-auto mb-4 text-red-400" />
                <p className="text-lg text-muted-foreground">
                  Aucune leçon disponible pour le moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => {
                const isCompleted = lesson.isCompleted;
                
                return (
                  <Card
                    key={lesson.id}
                    className={`group cursor-pointer overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      lesson.isLocked
                        ? 'opacity-60 cursor-not-allowed border-border/30'
                        : isCompleted
                          ? 'border-green-400 dark:border-green-600 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30'
                          : 'border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 bg-gradient-to-br from-white to-red-50/50 dark:from-gray-900 dark:to-red-950/30'
                    }`}
                    onClick={() => handleLessonClick(lesson.slug, lesson.isLocked)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl">{lesson.icon}</div>
                        {isCompleted && (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                      <CardTitle className="text-lg group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 mb-2">
                        {lesson.title}
                      </CardTitle>
                      <div 
                        className="text-sm text-muted-foreground line-clamp-2 prose-sm prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: lesson.description || '' }}
                      />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between pt-4 border-t border-border/30">
                        <div className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                          <Sparkles className="w-4 h-4 fill-current" />
                          <span className="font-semibold">+{lesson.goldReward}</span>
                        </div>
                        {isCompleted && (
                          <Badge variant="outline" className="border-green-500/50 text-green-500">
                            Complété
                          </Badge>
                        )}
                      </div>
                      <Button
                        className={`w-full text-white shadow-lg group-hover:shadow-xl transition-all duration-300 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                            : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                        }`}
                        disabled={lesson.isLocked}
                      >
                        {isCompleted ? 'Revoir' : 'Commencer'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationPhysiqueCourse;
