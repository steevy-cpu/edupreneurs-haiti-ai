import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CourseLayout, CourseHeader, LessonCard, ProgressCard, MonthSection } from "@/components/course";
import { groupLessonsByMonth, MONTH_ORDER, BaseLesson, BaseSubject } from "@/utils/courseHelpers";
import { EricChatbot } from "@/components/EricChatbot";

export default function DynamicCoursePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<BaseSubject | null>(null);
  const [lessons, setLessons] = useState<BaseLesson[]>([]);
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

      // Load published lessons for this subject (including unpublished for "coming soon")
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('subject_id', subjectData.id)
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
      toast.error("Erreur lors du chargement du cours");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter to only published lessons for progress calculation
  const publishedLessons = lessons.filter(l => l.is_published);
  const completedCount = publishedLessons.filter(l => completedLessons.includes(l.slug)).length;

  // Group lessons by month
  const groupedByMonth = groupLessonsByMonth(lessons);

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
          <p className="text-muted-foreground mb-4">
            La matière "{subjectSlug}" n'existe pas dans notre base de données.
          </p>
          <Button onClick={() => navigate('/matieres')}>
            Retour aux matières
          </Button>
        </Card>
      </div>
    );
  }

  // Check if we have lessons organized by month
  const hasMonthlyOrganization = lessons.some(l => l.mois && l.mois !== "Sans mois");

  return (
    <CourseLayout>
      <CourseHeader
        title={subject.name}
        description={subject.description || `Cours de ${subject.name} pour ${subject.grade_level}`}
        gradeLevel={subject.grade_level}
        lessonCount={publishedLessons.length}
        subjectName={subject.name}
      />

      <ProgressCard
        completedLessons={completedCount}
        totalLessons={publishedLessons.length}
      />

      {/* Lessons organized by month or as simple list */}
      {hasMonthlyOrganization ? (
        // Month-based organization
        MONTH_ORDER.map((month) => {
          const monthLessons = groupedByMonth[month];
          if (!monthLessons || monthLessons.length === 0) return null;

          return (
            <MonthSection key={month} month={month}>
              {monthLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  title={lesson.title}
                  objectif={lesson.objectif}
                  orderIndex={lesson.order_index}
                  isPublished={lesson.is_published ?? false}
                  isCompleted={completedLessons.includes(lesson.slug)}
                  subjectSlug={subjectSlug}
                  lessonSlug={lesson.slug}
                  onClick={() => {
                    if (lesson.is_published) {
                      navigate(`/course/${subjectSlug}/${lesson.slug}`);
                    } else {
                      toast.info("Cette leçon n'est pas encore disponible");
                    }
                  }}
                />
              ))}
            </MonthSection>
          );
        })
      ) : (
        // Simple grid layout for lessons without monthly organization
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              title={lesson.title}
              objectif={lesson.objectif}
              orderIndex={lesson.order_index}
              isPublished={lesson.is_published ?? false}
              isCompleted={completedLessons.includes(lesson.slug)}
              subjectSlug={subjectSlug}
              lessonSlug={lesson.slug}
              onClick={() => {
                if (lesson.is_published) {
                  navigate(`/course/${subjectSlug}/${lesson.slug}`);
                } else {
                  toast.info("Cette leçon n'est pas encore disponible");
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Handle lessons with "Sans mois" separately if they exist */}
      {hasMonthlyOrganization && groupedByMonth["Sans mois"]?.length > 0 && (
        <MonthSection month="Sans mois">
          {groupedByMonth["Sans mois"].map((lesson) => (
            <LessonCard
              key={lesson.id}
              title={lesson.title}
              objectif={lesson.objectif}
              orderIndex={lesson.order_index}
              isPublished={lesson.is_published ?? false}
              isCompleted={completedLessons.includes(lesson.slug)}
              subjectSlug={subjectSlug}
              lessonSlug={lesson.slug}
              onClick={() => {
                if (lesson.is_published) {
                  navigate(`/course/${subjectSlug}/${lesson.slug}`);
                } else {
                  toast.info("Cette leçon n'est pas encore disponible");
                }
              }}
            />
          ))}
        </MonthSection>
      )}

      {lessons.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Aucune leçon disponible pour le moment.
          </p>
        </Card>
      )}

      <EricChatbot />
    </CourseLayout>
  );
}
