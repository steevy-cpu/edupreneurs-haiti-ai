import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  BookOpen,
  Target,
  FileText,
  Dumbbell,
  HelpCircle
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LessonData {
  id: string;
  title: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  mois: string;
  youtubeUrl?: string;
}

export default function AnglaisLesson() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('id, slug, title, objectif, introduction, contenu, exemples_exercices, mois, youtube_url')
          .eq('slug', topicId)
          .eq('is_published', true)
          .single();

        if (error) throw error;

        setLesson({
          id: data.id,
          title: data.title,
          objectif: data.objectif,
          introduction: data.introduction,
          contenu: data.contenu,
          exemples_exercices: data.exemples_exercices,
          mois: data.mois,
          youtubeUrl: data.youtube_url
        });
      } catch (error) {
        console.error('Error fetching lesson:', error);
        toast.error('Erreur lors du chargement de la leçon');
        navigate('/anglais-course');
      } finally {
        setLoading(false);
      }
    };

    if (topicId) {
      fetchLesson();
    }
  }, [topicId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/anglais-course')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-xl font-bold truncate">{lesson.title}</h1>
                {lesson.mois && (
                  <Badge variant="secondary" className="mt-1">
                    {lesson.mois}
                  </Badge>
                )}
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Objective Card */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-start gap-3">
            <Target className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Objectif de la leçon</h3>
              <p className="text-muted-foreground">{lesson.objectif}</p>
            </div>
          </div>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="introduction" className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="introduction">
              <BookOpen className="w-4 h-4 mr-2" />
              Introduction
            </TabsTrigger>
            <TabsTrigger value="contenu">
              <FileText className="w-4 h-4 mr-2" />
              Contenu
            </TabsTrigger>
            <TabsTrigger value="exemples">
              <Dumbbell className="w-4 h-4 mr-2" />
              Exemples
            </TabsTrigger>
            <TabsTrigger value="quiz">
              <HelpCircle className="w-4 h-4 mr-2" />
              Quiz Final
            </TabsTrigger>
          </TabsList>

          <TabsContent value="introduction">
            <Card className="p-6">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.introduction }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="contenu">
            <Card className="p-6">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.contenu }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="exemples">
            <Card className="p-6">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <Card className="p-6">
              <div className="text-center py-12 space-y-4">
                <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground/50" />
                <h3 className="text-xl font-semibold">Quiz Final</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Le quiz pour cette leçon sera bientôt disponible. Continuez à réviser le contenu et les exemples!
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* YouTube Video Section */}
        {lesson.youtubeUrl && (
          <div className="mb-6">
            <YouTubeVideoSection
              lessonTitle={lesson.title}
              objectives={lesson.objectif}
              gradeLevel="AF7"
              customYoutubeUrl={lesson.youtubeUrl}
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/anglais-course')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour au cours
          </Button>
        </div>
      </div>
    </div>
  );
}
