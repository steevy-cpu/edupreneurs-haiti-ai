import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, BookOpen, CheckCircle2, Lock } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MusicSelector } from "@/components/MusicSelector";
import ericTeaching from "@/assets/eric-teaching.png";

export default function DynamicCoursePage() {
  const { fullSlug } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Remove '-course' suffix if present and decode URL-encoded characters
  const subjectSlug = fullSlug ? decodeURIComponent(fullSlug.replace(/-course$/, '')) : '';

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
            <ChevronLeft className="h-5 w-5" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <MusicSelector />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {subject.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {subject.description || `Cours de ${subject.name}`}
            </p>
            <div className="flex gap-3 flex-wrap">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                {subject.grade_level}
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                {lessons.length} {lessons.length === 1 ? 'leçon' : 'leçons'}
              </Badge>
            </div>
          </div>
          <div className="md:w-64">
            <img 
              src={ericTeaching} 
              alt="Eric" 
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        {/* Progress Section */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Votre progression</h3>
          <Progress value={progress} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {completedLessons.length} sur {lessons.length} leçons complétées ({progress}%)
          </p>
        </Card>

        {/* Lessons List */}
        <h2 className="text-2xl font-bold mb-6">Leçons</h2>
        <div className="grid gap-4">
          {lessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.slug);
            const isLocked = index > 0 && !completedLessons.includes(lessons[index - 1].slug);
            
            return (
              <Card
                key={lesson.id}
                className={`p-6 transition-all ${
                  isLocked 
                    ? 'opacity-60' 
                    : 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                }`}
                onClick={() => {
                  if (!isLocked) {
                    navigate(`/${subjectSlug}/${lesson.slug}`);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted 
                      ? 'bg-green-500/20 text-green-600' 
                      : isLocked
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : isLocked ? (
                      <Lock className="h-6 w-6" />
                    ) : (
                      <BookOpen className="h-6 w-6" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      Leçon {index + 1}: {lesson.title}
                    </h3>
                    {lesson.objectif && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {lesson.objectif.replace(/<[^>]*>/g, '')}
                      </p>
                    )}
                    {isLocked && (
                      <p className="text-sm text-amber-600 mt-2">
                        Complétez la leçon précédente pour débloquer
                      </p>
                    )}
                  </div>

                  {isCompleted && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-700">
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
