import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AnglaisLessonAF9 = () => {
  const { lessonSlug } = useParams();
  const navigate = useNavigate();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["anglais-af9-lesson", lessonSlug],
    queryFn: async () => {
      const { data: subjectData } = await supabase
        .from("subjects")
        .select("id")
        .eq("slug", "anglais-af9")
        .eq("grade_level", "AF9")
        .single();

      if (!subjectData) throw new Error("Subject not found");

      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("subject_id", subjectData.id)
        .eq("slug", lessonSlug)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8">
          <p className="text-muted-foreground">Leçon non trouvée</p>
          <Button onClick={() => navigate("/anglais-af9")} className="mt-4">
            Retour aux leçons
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/anglais-af9")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux leçons
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{lesson.mois || "N/A"}</Badge>
              <Badge variant="outline">Leçon {lesson.order_index}</Badge>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{lesson.title}</CardTitle>
                {lesson.objectif && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Target className="w-4 h-4 mt-1 flex-shrink-0" />
                    <p>{lesson.objectif}</p>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {lesson.introduction && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Introduction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {lesson.introduction}
              </p>
            </CardContent>
          </Card>
        )}

        {lesson.contenu && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Contenu de la leçon</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.contenu }}
              />
            </CardContent>
          </Card>
        )}

        {lesson.exemples_exercices && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Exercices et exemples</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/anglais-af9")}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Toutes les leçons
          </Button>
          <Button
            onClick={() => {
              // Navigate to next lesson logic could go here
              navigate("/anglais-af9");
            }}
            className="flex-1"
          >
            Leçon suivante →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnglaisLessonAF9;
