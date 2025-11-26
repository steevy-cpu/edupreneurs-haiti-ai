import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, BookOpen, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MusicSelector } from "@/components/MusicSelector";
import ericTeaching from "@/assets/eric-teaching.png";
import ericScientist from "@/assets/eric-scientist.png";
import ericBiologist from "@/assets/eric-biologist.png";
import ericComputer from "@/assets/eric-computer.png";
import ericMath from "@/assets/eric-math.png";

export default function DynamicCoursePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Decode URL-encoded characters
  const subjectSlug = slug ? decodeURIComponent(slug) : '';

  useEffect(() => {
    loadSubjectAndLessons();
  }, [subjectSlug]);

  const loadSubjectAndLessons = async () => {
    try {
      setIsLoading(true);
      
      // Load subject using the slug
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('slug', subjectSlug)
        .maybeSingle();

      if (subjectError) throw subjectError;
      
      // Check if subject was found
      if (!subjectData) {
        console.error('Subject not found for slug:', subjectSlug);
        setSubject(null);
        setIsLoading(false);
        return;
      }
      
      setSubject(subjectData);

      // Load published lessons for this subject
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('subject_id', subjectData.id)
        .eq('is_published', true)
        .order('order_index');

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // Load completed lessons for current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: completions } = await supabase
          .from('lesson_completions')
          .select('lesson_slug')
          .eq('user_id', user.id);
        
        if (completions) {
          setCompletedLessons(completions.map(c => c.lesson_slug));
        }
      }
    } catch (error) {
      console.error('Error loading subject:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const progress = lessons.length > 0 
    ? Math.round((completedLessons.length / lessons.length) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Matière non trouvée</h2>
          <Button onClick={() => navigate('/matieres')}>
            Retour aux matières
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/matieres')} className="gap-2">
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Retour</span>
          </Button>
          <div className="flex items-center gap-2 sm:gap-3">
            <MusicSelector />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              {subject.name}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
              {subject.description || `Cours de ${subject.name}`}
            </p>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <Badge variant="secondary" className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2">
                {subject.grade_level}
              </Badge>
              <Badge variant="secondary" className="text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2">
                {lessons.length} {lessons.length === 1 ? 'leçon' : 'leçons'}
              </Badge>
            </div>
          </div>
          <div className="w-full md:w-64 flex justify-center">
            <img 
              src={
                subject.name.toLowerCase().includes('mathématique')
                  ? ericMath
                  : subject.name.toLowerCase().includes('informatique')
                  ? ericComputer
                  : subject.name.toLowerCase().includes('chimie') 
                  ? ericScientist 
                  : subject.name.toLowerCase().includes('biologie') || subject.name.toLowerCase().includes('géologie')
                  ? ericBiologist
                  : ericTeaching
              } 
              alt="Eric" 
              className="w-48 sm:w-56 md:w-full h-auto rounded-lg"
            />
          </div>
        </div>

        {/* Progress Section */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Votre progression</h3>
          <Progress value={progress} className="mb-2" />
          <p className="text-xs sm:text-sm text-muted-foreground">
            {completedLessons.length} sur {lessons.length} leçons complétées ({progress}%)
          </p>
        </Card>

        {/* Lessons List */}
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Leçons</h2>
        <div className="grid gap-3 sm:gap-4">
          {lessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.slug);
            
            return (
              <Card
                key={lesson.id}
                className="p-4 sm:p-6 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/course/${subjectSlug}/${lesson.slug}`)}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted 
                      ? 'bg-green-500/20 text-green-600' 
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                    ) : (
                      <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2">
                      Leçon {index + 1}: {lesson.title}
                    </h3>
                    {lesson.objectif && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {lesson.objectif.replace(/<[^>]*>/g, '')}
                      </p>
                    )}
                  </div>

                  {isCompleted && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-700 text-xs shrink-0">
                      Complété
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {lessons.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Aucune leçon disponible pour le moment.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
