import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import {
  aggregateIssuesByCategory,
  getTopIssueCategories,
  ISSUE_CATEGORIES,
} from "@/utils/validationCategories";

interface GradeLevelStats {
  gradeLevelName: string;
  totalLessons: number;
  quizValidated: number;
  activitiesValidated: number;
  quizScore: number;
  activitiesScore: number;
}

interface IssueStats {
  category: string;
  count: number;
  percentage: number;
}

export const ContentQualityDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [gradeLevelStats, setGradeLevelStats] = useState<GradeLevelStats[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalLessons: 0,
    quizValidatedCount: 0,
    quizValidatedPercent: 0,
    activitiesValidatedCount: 0,
    activitiesValidatedPercent: 0,
    avgQuizScore: 0,
    avgActivitiesScore: 0,
    quizIssueStats: [] as IssueStats[],
    activitiesIssueStats: [] as IssueStats[],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch all lessons with their validation details
        const { data: lessons, error } = await supabase
          .from("lessons")
          .select("id, title, grade_level, content_alignment_score, activities_alignment_score, validation_details_json, needs_quiz_regeneration, needs_activities_regeneration")
          .order("grade_level");

        if (error) throw error;
        if (!lessons) {
          setLoading(false);
          return;
        }

        // Aggregate by grade level
        const statsMap = new Map<string, GradeLevelStats>();

        for (const lesson of lessons) {
          const key = lesson.grade_level || "Unknown";
          if (!statsMap.has(key)) {
            statsMap.set(key, {
              gradeLevelName: key,
              totalLessons: 0,
              quizValidated: 0,
              activitiesValidated: 0,
              quizScore: 0,
              activitiesScore: 0,
            });
          }

          const stats = statsMap.get(key)!;
          stats.totalLessons++;

          // Check quiz validation
          if (!lesson.needs_quiz_regeneration && lesson.content_alignment_score !== null) {
            stats.quizValidated++;
            stats.quizScore += lesson.content_alignment_score || 0;
          }

          // Check activities validation
          if (!lesson.needs_activities_regeneration && lesson.activities_alignment_score !== null) {
            stats.activitiesValidated++;
            stats.activitiesScore += lesson.activities_alignment_score || 0;
          }
        }

        const sortedStats = Array.from(statsMap.values()).sort(
          (a, b) => a.gradeLevelName.localeCompare(b.gradeLevelName)
        );

        // Calculate overall stats
        const totalLessons = lessons.length;
        const quizValidated = sortedStats.reduce((sum, s) => sum + s.quizValidated, 0);
        const activitiesValidated = sortedStats.reduce((sum, s) => sum + s.activitiesValidated, 0);
        const quizScoreTotal = sortedStats.reduce((sum, s) => sum + s.quizScore, 0);
        const activitiesScoreTotal = sortedStats.reduce((sum, s) => sum + s.activitiesScore, 0);

        // Aggregate issues by category
        let quizIssuesMap: Record<string, number> = {
          concept_not_in_content: 0,
          specific_data_missing: 0,
          cultural_knowledge: 0,
          formula_missing: 0,
          other: 0,
        };

        let activitiesIssuesMap: Record<string, number> = {
          concept_not_in_content: 0,
          specific_data_missing: 0,
          cultural_knowledge: 0,
          formula_missing: 0,
          other: 0,
        };

        for (const lesson of lessons) {
          if (lesson.validation_details_json) {
            const details = lesson.validation_details_json as any;

            // Process quiz issues
            if (details.quiz?.offContentQuestions) {
              const aggregated = aggregateIssuesByCategory(details.quiz.offContentQuestions);
              Object.entries(aggregated).forEach(([key, count]) => {
                quizIssuesMap[key] = (quizIssuesMap[key] || 0) + count;
              });
            }

            // Process activities issues
            if (details.activities?.offContentActivities) {
              const aggregated = aggregateIssuesByCategory(details.activities.offContentActivities);
              Object.entries(aggregated).forEach(([key, count]) => {
                activitiesIssuesMap[key] = (activitiesIssuesMap[key] || 0) + count;
              });
            }
          }
        }

        const totalQuizIssues = Object.values(quizIssuesMap).reduce((a, b) => a + b, 0);
        const totalActivitiesIssues = Object.values(activitiesIssuesMap).reduce((a, b) => a + b, 0);

        const quizIssueStats = Object.entries(quizIssuesMap)
          .filter(([, count]) => count > 0)
          .map(([category, count]) => ({
            category: ISSUE_CATEGORIES[category as any]?.label || category,
            count,
            percentage: totalQuizIssues > 0 ? (count / totalQuizIssues) * 100 : 0,
          }))
          .sort((a, b) => b.count - a.count);

        const activitiesIssueStats = Object.entries(activitiesIssuesMap)
          .filter(([, count]) => count > 0)
          .map(([category, count]) => ({
            category: ISSUE_CATEGORIES[category as any]?.label || category,
            count,
            percentage: totalActivitiesIssues > 0 ? (count / totalActivitiesIssues) * 100 : 0,
          }))
          .sort((a, b) => b.count - a.count);

        setGradeLevelStats(sortedStats);
        setOverallStats({
          totalLessons,
          quizValidatedCount: quizValidated,
          quizValidatedPercent: totalLessons > 0 ? (quizValidated / totalLessons) * 100 : 0,
          activitiesValidatedCount: activitiesValidated,
          activitiesValidatedPercent: totalLessons > 0 ? (activitiesValidated / totalLessons) * 100 : 0,
          avgQuizScore: quizValidated > 0 ? quizScoreTotal / quizValidated : 0,
          avgActivitiesScore: activitiesValidated > 0 ? activitiesScoreTotal / activitiesValidated : 0,
          quizIssueStats,
          activitiesIssueStats,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Erreur lors du chargement des statistiques");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Contenu Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallStats.totalLessons}</div>
            <p className="text-xs text-muted-foreground mt-1">leçons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quiz Validés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(overallStats.quizValidatedPercent)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overallStats.quizValidatedCount}/{overallStats.totalLessons}
            </p>
            <Progress
              value={overallStats.quizValidatedPercent}
              className="mt-2 h-1.5"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Activités Validées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(overallStats.activitiesValidatedPercent)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overallStats.activitiesValidatedCount}/{overallStats.totalLessons}
            </p>
            <Progress
              value={overallStats.activitiesValidatedPercent}
              className="mt-2 h-1.5"
            />
          </CardContent>
        </Card>
      </div>

      {/* Grade Level Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Qualité par Niveau</CardTitle>
          <CardDescription>Progression de validation par grade level</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {gradeLevelStats.map((stats) => (
            <div key={stats.gradeLevelName} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stats.gradeLevelName}</span>
                <span className="text-xs text-muted-foreground">
                  {stats.quizValidated}/{stats.totalLessons} quiz validés
                </span>
              </div>
              <Progress
                value={(stats.quizValidated / stats.totalLessons) * 100}
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Issues Details */}
      <Tabs defaultValue="quiz" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quiz">Problèmes Quiz</TabsTrigger>
          <TabsTrigger value="activities">Problèmes Activités</TabsTrigger>
        </TabsList>

        <TabsContent value="quiz" className="space-y-4">
          {overallStats.quizIssueStats.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm font-medium">Aucun problème détecté!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Catégories de Problèmes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overallStats.quizIssueStats.map((stat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{stat.category}</span>
                      <span className="text-xs text-muted-foreground">
                        {stat.count} ({stat.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={stat.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          {overallStats.activitiesIssueStats.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-sm font-medium">Aucun problème détecté!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Catégories de Problèmes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overallStats.activitiesIssueStats.map((stat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{stat.category}</span>
                      <span className="text-xs text-muted-foreground">
                        {stat.count} ({stat.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={stat.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
