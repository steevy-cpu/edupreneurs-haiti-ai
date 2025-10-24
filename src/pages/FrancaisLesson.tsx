import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Target, FileText, PenTool } from "lucide-react";
import { francaisLessons7AF } from "@/data/francaisLessons";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { supabase } from "@/integrations/supabase/client";

const FrancaisLesson = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);

  const lesson = francaisLessons7AF.find(l => l.id === topicId);

  useEffect(() => {
    const fetchYoutubeUrl = async () => {
      if (!topicId) return;
      
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('youtube_url')
          .eq('slug', topicId)
          .maybeSingle();

        if (data && !error) {
          setYoutubeUrl(data.youtube_url);
        }
      } catch (error) {
        console.error('Error fetching YouTube URL:', error);
      }
    };

    fetchYoutubeUrl();
  }, [topicId]);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Leçon non trouvée</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Cette leçon n'existe pas ou n'est pas encore disponible.
            </p>
            <Button onClick={() => navigate("/francais-course")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au cours
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentIndex = francaisLessons7AF.findIndex(l => l.id === topicId);
  const previousLesson = currentIndex > 0 ? francaisLessons7AF[currentIndex - 1] : null;
  const nextLesson = currentIndex < francaisLessons7AF.length - 1 ? francaisLessons7AF[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/francais-course")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au cours
        </Button>

        <Card className="mb-8 border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">{lesson.mois}</p>
                <CardTitle className="text-3xl mb-4">{lesson.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Objectif
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{lesson.objectif}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                {lesson.introduction}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Contenu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                {lesson.contenu}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-purple-600" />
                Exemples et Exercices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                {lesson.exemplesExercices}
              </div>
            </CardContent>
          </Card>

          {/* YouTube Video Section */}
          {youtubeUrl && (
            <YouTubeVideoSection
              lessonTitle={lesson.title}
              objectives={lesson.objectif}
              gradeLevel="AF7"
              customYoutubeUrl={youtubeUrl}
            />
          )}
        </div>

        <div className="flex justify-between mt-8">
          {previousLesson ? (
            <Button
              variant="outline"
              onClick={() => navigate(`/francais-lesson/${previousLesson.id}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Leçon précédente
            </Button>
          ) : (
            <div />
          )}
          {nextLesson && (
            <Button
              onClick={() => navigate(`/francais-lesson/${nextLesson.id}`)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Leçon suivante
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FrancaisLesson;
