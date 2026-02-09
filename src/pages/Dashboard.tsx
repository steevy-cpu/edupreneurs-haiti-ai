import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { useFirstTimeUser } from "@/contexts/FirstTimeUserContext";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics";
import { useBannerPriority } from "@/hooks/useBannerPriority";
import { useVisitor } from "@/contexts/VisitorContext";
import { visitorDashboardData } from "@/data/visitorDemoData";
import { PageHeader } from "@/components/shared/PageHeader";
import { WordOfTheDayCard } from "@/components/dashboard/WordOfTheDayCard";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { DashboardFullSkeleton } from "@/components/shared/SkeletonLoaders";

// Feature-level state interface for independent loading/error states
interface FeatureState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

interface Note {
  id: string;
  lesson_id: string;
  notes: string | null;
  updated_at: string;
  lesson_slug?: string;
  lesson_title?: string;
  subject_slug?: string;
  subject_name?: string;
}

interface LeaderboardUser {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  gold_earned: number;
  academic_grade: string;
  rank: number;
}

interface RecentSubjectProgress {
  subject: string;
  subjectSlug: string;
  lastLessonSlug: string;
  lastLessonTitle: string;
  progress: number;
  lastActivity: string;
}

const Dashboard = () => {
  const { restartTour } = useFirstTimeUser();
  const navigate = useNavigate();
  const { isVisitor } = useVisitor();
  const { user: authUser, isLoading: isAuthLoading, isAuthenticated } = useSessionAuth();

  const [profileFeature, setProfileFeature] = useState<FeatureState<{ name: string; gold: number }>>({
    data: { name: isVisitor ? "Visiteur" : "Utilisateur", gold: isVisitor ? visitorDashboardData.goldEarned : 0 },
    loading: !isVisitor,
    error: null
  });

  const [notesFeature, setNotesFeature] = useState<FeatureState<Note[]>>({
    data: [], loading: true, error: null
  });

  const [leaderboardFeature, setLeaderboardFeature] = useState<FeatureState<LeaderboardUser[]>>({
    data: [], loading: true, error: null
  });

  const [recentSubjectsFeature, setRecentSubjectsFeature] = useState<FeatureState<RecentSubjectProgress[]>>({
    data: [], loading: true, error: null
  });

  const [isContentEditor, setIsContentEditor] = useState(false);
  const [totalLessonsCompleted, setTotalLessonsCompleted] = useState(isVisitor ? visitorDashboardData.lessonsCompleted : 0);

  const userId = authUser?.id || "";

  const { showPrompt, isIOS, isPromptAvailable, installApp, dismissPrompt } = usePWAInstall();
  const { analytics, isLoading: analyticsLoading } = useDashboardAnalytics(
    isVisitor || !userId ? null : userId
  );
  const { dismissBanner, isBannerDismissed, getActiveBanner } = useBannerPriority();

  // Two-phase loading
  useEffect(() => {
    if (isVisitor) {
      setProfileFeature(prev => ({ ...prev, loading: false }));
      fetchLeaderboard();
      return;
    }
    if (isAuthLoading) return;
    if (!isAuthenticated || !authUser) {
      navigate("/auth/login", { replace: true });
      return;
    }
    fetchCriticalUserData(authUser.id);
    fetchLeaderboard();
    const deferTimer = setTimeout(() => {
      fetchNonCriticalUserData(authUser.id);
    }, 500);
    return () => clearTimeout(deferTimer);
  }, [navigate, isVisitor, isAuthLoading, isAuthenticated, authUser]);

  const fetchCriticalUserData = async (currentUserId: string) => {
    setProfileFeature(prev => ({ ...prev, loading: true, error: null }));
    setRecentSubjectsFeature(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [profileResult, recentActivityResult] = await Promise.all([
        supabase.from("profiles").select("nickname, gold_earned, academic_grade").eq("user_id", currentUserId).maybeSingle(),
        supabase.from("lesson_completions").select("subject, lesson_slug, completed_at").eq("user_id", currentUserId).order("completed_at", { ascending: false }).limit(20),
      ]);
      if (profileResult.data) {
        setProfileFeature({
          data: { name: profileResult.data.nickname || "Utilisateur", gold: profileResult.data.gold_earned || 0 },
          loading: false, error: null
        });
      } else {
        setProfileFeature(prev => ({ ...prev, loading: false }));
      }
      if (recentActivityResult.data && !recentActivityResult.error) {
        await processRecentActivity(recentActivityResult.data, profileResult.data?.academic_grade);
      } else {
        setRecentSubjectsFeature(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      setProfileFeature(prev => ({ ...prev, loading: false, error: error as Error }));
      setRecentSubjectsFeature(prev => ({ ...prev, loading: false, error: error as Error }));
    }
  };

  const fetchNonCriticalUserData = async (currentUserId: string) => {
    setNotesFeature(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [notesResult, editorResult, completionsResult] = await Promise.all([
        supabase.from("lesson_notes").select("*").eq("user_id", currentUserId).order("updated_at", { ascending: false }).limit(5),
        supabase.from("content_editor_roles").select("role").eq("user_id", currentUserId).maybeSingle(),
        supabase.from("lesson_completions").select("id", { count: "exact" }).eq("user_id", currentUserId),
      ]);
      if (notesResult.data && notesResult.data.length > 0) {
        await enrichNotesWithNavigation(notesResult.data, currentUserId);
      } else if (notesResult.data) {
        setNotesFeature({ data: notesResult.data, loading: false, error: null });
      } else {
        setNotesFeature(prev => ({ ...prev, loading: false }));
      }
      setIsContentEditor(!!editorResult.data);
      setTotalLessonsCompleted(completionsResult.count || 0);
    } catch (error) {
      setNotesFeature(prev => ({ ...prev, loading: false, error: error as Error }));
    }
  };

  const processRecentActivity = async (activityData: any[], userGrade?: string) => {
    const subjectMap = new Map<string, { subject: string; lastLessonSlug: string; lastActivity: string; count: number }>();
    for (const completion of activityData) {
      if (!subjectMap.has(completion.subject)) {
        subjectMap.set(completion.subject, { subject: completion.subject, lastLessonSlug: completion.lesson_slug, lastActivity: completion.completed_at, count: 1 });
      } else {
        subjectMap.get(completion.subject)!.count++;
      }
    }
    const { data: availableSubjects } = await supabase.from("subjects").select("id, slug, name, grade_level");
    const gradeToUse = userGrade || '9AF';
    const findSubjectSlug = (subjectName: string): string => {
      const normalizedName = subjectName.toLowerCase().replace('é', 'e');
      const gradeSlugVariants = [`${normalizedName}-${gradeToUse.toLowerCase()}`, `${normalizedName}-af${gradeToUse.replace(/\D/g, '')}`, `${normalizedName}-${gradeToUse.replace(/(\d+)(\w+)/i, '$2$1').toLowerCase()}`];
      for (const variant of gradeSlugVariants) {
        const match = availableSubjects?.find(s => s.slug === variant);
        if (match) return match.slug;
      }
      const gradeMatch = availableSubjects?.find(s => s.slug.startsWith(normalizedName) && s.grade_level === gradeToUse);
      if (gradeMatch) return gradeMatch.slug;
      const partialMatch = availableSubjects?.find(s => s.slug.startsWith(normalizedName));
      if (partialMatch) return partialMatch.slug;
      return subjectName;
    };
    const subjectDisplayNames: Record<string, string> = {
      'mathematiques': 'Mathématiques', 'mathématiques': 'Mathématiques', 'francais': 'Français',
      'sciences': 'Sciences', 'sciences-sociales': 'Sciences Sociales', 'espagnol': 'Espagnol',
      'anglais': 'Anglais', 'creole': 'Créole'
    };
    const recentSubjectsData: RecentSubjectProgress[] = Array.from(subjectMap.values()).slice(0, 3).map(item => ({
      subject: subjectDisplayNames[item.subject] || item.subject,
      subjectSlug: findSubjectSlug(item.subject),
      lastLessonSlug: item.lastLessonSlug,
      lastLessonTitle: item.lastLessonSlug.replace(/-/g, ' '),
      progress: Math.min(item.count * 10, 100),
      lastActivity: item.lastActivity
    }));
    setRecentSubjectsFeature({ data: recentSubjectsData, loading: false, error: null });
  };

  const enrichNotesWithNavigation = async (notes: Note[], currentUserId: string) => {
    const lessonIds = [...new Set(notes.map(n => n.lesson_id))];
    const { data: lessonsWithSubjects } = await supabase.from("lessons").select("slug, title, subjects(slug, name, grade_level)").in("slug", lessonIds);
    const { data: profile } = await supabase.from("profiles").select("academic_grade").eq("user_id", currentUserId).maybeSingle();
    const userGrade = profile?.academic_grade || '9AF';
    const lessonMap = new Map<string, { lesson_slug: string; lesson_title: string; subject_slug: string; subject_name: string }>();
    lessonsWithSubjects?.forEach(lesson => {
      const subjectData = lesson.subjects as { slug: string; name: string; grade_level: string } | null;
      const existing = lessonMap.get(lesson.slug);
      if (!existing || subjectData?.grade_level === userGrade) {
        lessonMap.set(lesson.slug, { lesson_slug: lesson.slug, lesson_title: lesson.title, subject_slug: subjectData?.slug || '', subject_name: subjectData?.name || '' });
      }
    });
    const enhancedNotes: Note[] = notes.map(note => ({ ...note, ...lessonMap.get(note.lesson_id) }));
    setNotesFeature({ data: enhancedNotes, loading: false, error: null });
  };

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardFeature(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data: topUsers, error } = await supabase.rpc('get_leaderboard_profiles', { limit_count: 5 });
      if (error) { setLeaderboardFeature(prev => ({ ...prev, loading: false, error: error as unknown as Error })); return; }
      const rankedUsers = topUsers?.map((user: any, index: number) => ({ ...user, full_name: user.nickname || "Étudiant", rank: index + 1 })) || [];
      setLeaderboardFeature({ data: rankedUsers, loading: false, error: null });
    } catch (error) {
      setLeaderboardFeature(prev => ({ ...prev, loading: false, error: error as Error }));
    }
  }, []);

  const topicInfo = useMemo(() => ({
    "numeration-binaire": { title: "Numération Binaire", icon: "💻" },
    "polygones": { title: "Les Polygones", icon: "⬡" },
    "divisibilite": { title: "Divisibilité", icon: "➗" },
    "decimaux": { title: "Décimaux", icon: "🔢" },
    "cercle-disque": { title: "Cercle et Disque", icon: "⭕" },
  }), []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  }, []);

  const activeBanner = getActiveBanner([
    { id: 'pwa', priority: 1, show: showPrompt },
    { id: 'passion', priority: 2, show: !isBannerDismissed('passion') },
  ]);

  if (isAuthLoading && !isVisitor) {
    return <DashboardFullSkeleton />;
  }

  return (
    <>
      <Helmet>
        <title>Tableau de bord - Edupreneurs</title>
        <meta name="description" content="Suivez votre progression d'apprentissage, vos statistiques et vos objectifs avec le tableau de bord Edupreneurs." />
        <meta property="og:title" content="Tableau de bord - Edupreneurs" />
        <meta property="og:description" content="Suivez votre progression d'apprentissage avec Edupreneurs." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 lg:pb-8 space-y-6">
          {/* Always visible: Welcome Header */}
          <div data-tour="welcome-header">
            <PageHeader
              title={profileFeature.loading ? "Bienvenue..." : `Bienvenue, ${profileFeature.data.name}!`}
              subtitle="Continuez votre apprentissage personnalisé avec Jude, votre assistant IA"
              variant="gradient"
              showThemeToggle={true}
            />
          </div>

          {/* Always visible: Word of the Day */}
          <WordOfTheDayCard />

          {/* Tab-based content */}
          <DashboardTabs
            overview={{
              recentSubjectsFeature,
              onRetryRecentSubjects: () => authUser && fetchCriticalUserData(authUser.id),
              analytics: {
                streak: analytics.streak,
                weeklyGoal: analytics.weeklyGoal,
                gold: profileFeature.data.gold,
                totalLessonsCompleted: analytics.totalLessonsCompleted,
                weeklyLessons: analytics.weeklyLessons,
                averageScore: analytics.averageScore,
                studyTimeThisWeek: analytics.studyTimeThisWeek,
              },
              activeBanner,
              showPrompt,
              isIOS,
              isPromptAvailable,
              installApp,
              dismissPrompt,
              dismissBanner,
              isContentEditor,
              showOnboardingTest: userId === "48d1e98c-a62c-4d46-ba89-b5bf3faa44be",
              restartTour,
            }}
            progress={{
              profileLoading: profileFeature.loading,
              gold: profileFeature.data.gold,
              analytics: {
                totalLessonsCompleted: analytics.totalLessonsCompleted,
                weeklyLessons: analytics.weeklyLessons,
                averageScore: analytics.averageScore,
                studyTimeThisWeek: analytics.studyTimeThisWeek,
                weeklyActivity: analytics.weeklyActivity,
                subjectProgress: analytics.subjectProgress,
              },
              analyticsLoading,
              totalLessonsCompleted,
              fullAnalytics: analytics,
            }}
            community={{
              leaderboardFeature,
              notesFeature,
              onRetryLeaderboard: fetchLeaderboard,
              onRetryNotes: () => authUser && fetchNonCriticalUserData(authUser.id),
              formatDate,
              topicInfo,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
