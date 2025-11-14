import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle,
  Star,
  GraduationCap,
  Dumbbell,
  Heart,
  Trophy
} from "lucide-react";
import ericTeaching from "@/assets/eric-chair-desk.avif";
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
      // Fetch user gold
      const { data: profile } = await supabase
        .from('profiles')
        .select('gold_earned')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setUserGold(profile.gold_earned || 0);
      }

      // Fetch completed lessons
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
      // Get subject ID first
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

      // Fetch lessons from database
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-500/10">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/matieres')}
              className="gap-1 sm:gap-2 hover:bg-primary/10 text-sm sm:text-base px-2 sm:px-4"
              size="sm"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Retour</span>
            </Button>
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <MusicSelector />
              <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full border border-yellow-500/30">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-500" />
                <span className="font-bold text-yellow-600 dark:text-yellow-400 text-xs sm:text-sm md:text-base">{userGold}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 space-y-3 sm:space-y-4">
          <div className="inline-block">
            <Badge variant="secondary" className="mb-3 sm:mb-4 text-sm sm:text-base md:text-lg px-4 sm:px-6 py-1.5 sm:py-2">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Éducation Physique - 7AF
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent leading-tight px-2">
            Éducation Physique et Sportive
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Développez vos compétences physiques, sportives et votre santé à travers une pratique régulière
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="p-4 sm:p-6 mb-8 sm:mb-10 md:mb-12 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-orange-500/10 rounded-xl flex-shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg">Votre Progression</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {lessons.filter(l => l.isCompleted).length} sur {lessons.length} leçons complétées
                </p>
              </div>
            </div>
            <div className="text-right self-end sm:self-auto">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                {Math.round(totalProgress)}%
              </div>
            </div>
          </div>
          <Progress value={totalProgress} className="h-2 sm:h-3" />
        </Card>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
          {loading ? (
            <div className="col-span-full text-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground">Chargement des leçons...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="col-span-full text-center py-8 sm:py-12">
              <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground/50" />
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">Aucune leçon disponible pour le moment</p>
            </div>
          ) : (
            lessons.map((lesson) => (
              <Card
                key={lesson.id}
                className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${
                  lesson.isCompleted
                    ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30"
                    : lesson.isLocked
                    ? "opacity-60 cursor-not-allowed border-border/30"
                    : "hover:border-orange-500/40 border-border/30"
                }`}
                onClick={() => handleLessonClick(lesson.slug, lesson.isLocked)}
              >
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {/* Icon and Status */}
                  <div className="flex items-start justify-between">
                    <div className="text-3xl sm:text-4xl mb-2">{lesson.icon}</div>
                    {lesson.isCompleted && (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                    )}
                    {lesson.isLocked && (
                      <div className="text-muted-foreground text-xs sm:text-sm">🔒</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="font-bold text-base sm:text-lg leading-tight group-hover:text-orange-600 transition-colors line-clamp-2">
                      {lesson.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {lesson.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border/30">
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-yellow-600 dark:text-yellow-400">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                      <span className="font-semibold">+{lesson.goldReward}</span>
                    </div>
                    <Button
                      variant={lesson.isCompleted ? "outline" : "default"}
                      size="sm"
                      className={`text-xs sm:text-sm ${lesson.isCompleted ? "border-green-500/30" : ""}`}
                      disabled={lesson.isLocked}
                    >
                      {lesson.isCompleted ? "Revoir" : "Commencer"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Eric Mascot Section */}
        <Card className="overflow-hidden bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4 order-2 md:order-1">
              <div className="inline-block">
                <Badge variant="secondary" className="mb-1 sm:mb-2 text-xs sm:text-sm">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Votre Assistant IA
                </Badge>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Besoin d'aide avec l'Éducation Physique ?</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Eric, votre assistant IA, peut vous aider à comprendre les techniques sportives, 
                la nutrition et la santé. Posez-lui vos questions !
              </p>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 w-full sm:w-auto text-sm sm:text-base"
                size="sm"
              >
                <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                Parler avec Eric
              </Button>
            </div>
            <div className="flex items-center justify-center order-1 md:order-2">
              <img
                src={ericTeaching}
                alt="Eric - Assistant IA"
                className="w-full max-w-[200px] sm:max-w-xs rounded-lg shadow-lg"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EducationPhysiqueCourse;
