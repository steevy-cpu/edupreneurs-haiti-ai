import { useRef, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CourseLayout, 
  CourseHeader, 
  LessonCard, 
  ProgressCard, 
  MonthSection,
  QuickStatsBar,
  MonthQuickNav,
  AIPracticeSection
} from "@/components/course";
import { groupLessonsByMonth, MONTH_ORDER } from "@/utils/courseHelpers";
import { JudeChatbot } from "@/components/JudeChatbot";
import { useUserGrade, GRADE_LABELS } from "@/hooks/useUserGrade";
import { useCourseData } from "@/hooks/useCourseData";
import { Lock } from "lucide-react";

export default function DynamicCoursePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const monthRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Decode URL-encoded characters
  const subjectSlug = slug ? decodeURIComponent(slug) : '';

  // Unified data fetching with React Query (single re-render)
  const { data, isLoading } = useCourseData(subjectSlug);

  // Extract data with defaults
  const subject = data?.subject ?? null;
  const lessons = data?.lessons ?? [];
  const completedLessons = data?.completedLessons ?? [];

  // Active month state for navigation (for MonthQuickNav highlighting)
  const [activeMonth, setActiveMonth] = useState<string | undefined>();

  // User grade access
  const { userGrade, canAccessGrade, isLoading: gradeLoading, isAuthenticated } = useUserGrade();

  // Filter to only published lessons for progress calculation
  const publishedLessons = lessons.filter(l => l.is_published);
  const completedCount = publishedLessons.filter(l => completedLessons.includes(l.slug)).length;

  // Group lessons by month
  const groupedByMonth = groupLessonsByMonth(lessons);

  // Get available months (that have lessons)
  const availableMonths = useMemo(() => {
    return MONTH_ORDER.filter(month => groupedByMonth[month]?.length > 0);
  }, [groupedByMonth]);

  // Calculate lesson count by month
  const lessonCountByMonth = useMemo(() => {
    const counts: Record<string, number> = {};
    MONTH_ORDER.forEach(month => {
      counts[month] = groupedByMonth[month]?.length || 0;
    });
    return counts;
  }, [groupedByMonth]);

  // Calculate total activities (estimate based on lessons with activites_interactives or quiz_final)
  const totalActivities = useMemo(() => {
    return lessons.reduce((acc, lesson) => {
      let count = 0;
      if (lesson.activites_interactives) count += 2; // Estimate 2 activities per lesson
      if (lesson.quiz_final) count += 1;
      return acc + count;
    }, 0);
  }, [lessons]);

  // Estimate study hours (30 min per lesson average)
  const estimatedHours = Math.ceil(publishedLessons.length * 0.5);

  // Completion rate
  const completionRate = publishedLessons.length > 0 
    ? Math.round((completedCount / publishedLessons.length) * 100) 
    : 0;

  // Handle month click to scroll to section
  const handleMonthClick = (month: string) => {
    setActiveMonth(month);
    const element = monthRefs.current[month];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle AI practice start - navigate to first published lesson
  const handleStartPractice = () => {
    const firstPublishedLesson = publishedLessons[0];
    if (firstPublishedLesson) {
      navigate(`/course/${subjectSlug}/${firstPublishedLesson.slug}`);
    } else {
      toast.info("Aucune leçon disponible pour le moment");
    }
  };

  if (isLoading || gradeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Check grade access AFTER loading subject
  if (subject && isAuthenticated && !canAccessGrade(subject.grade_level)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Accès restreint</h2>
          <p className="text-muted-foreground mb-4">
            Ce cours est pour le niveau <strong>{subject.grade_level}</strong>. 
            Votre compte est enregistré pour <strong>{userGrade ? GRADE_LABELS[userGrade] : 'un autre niveau'}</strong>.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Contactez le support si vous souhaitez changer de niveau.
          </p>
          <Button onClick={() => navigate('/matieres')}>
            Retour aux matières
          </Button>
        </Card>
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
      {/* Enhanced Header */}
      <CourseHeader
        title={subject.name}
        description={subject.description || `Cours de ${subject.name} pour ${subject.grade_level}`}
        gradeLevel={subject.grade_level}
        lessonCount={publishedLessons.length}
        subjectName={subject.name}
        completedCount={completedCount}
      />

      {/* Quick Stats Bar */}
      <QuickStatsBar
        totalLessons={publishedLessons.length}
        totalActivities={totalActivities}
        estimatedHours={estimatedHours}
        completionRate={completionRate}
      />

      {/* AI Practice Section (only for language subjects) */}
      <AIPracticeSection
        subjectName={subject.name}
        subjectSlug={subjectSlug}
        gradeLevel={subject.grade_level}
        onStartPractice={handleStartPractice}
      />

      {/* Month Quick Navigation (only if monthly organization exists) */}
      {hasMonthlyOrganization && availableMonths.length > 1 && (
        <MonthQuickNav
          months={availableMonths}
          activeMonth={activeMonth}
          onMonthClick={handleMonthClick}
          lessonCountByMonth={lessonCountByMonth}
        />
      )}

      {/* Progress Card */}
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
            <div
              key={month}
              ref={(el) => { monthRefs.current[month] = el; }}
            >
              <MonthSection month={month}>
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
            </div>
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

      <JudeChatbot />
    </CourseLayout>
  );
}
