import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  BookOpen,
  CheckCircle,
  Lightbulb,
  FileText,
  Link as LinkIcon
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LessonData {
  id: string;
  title: string;
  objective: string;
  introduction: string;
  content: any;
  exercises: any;
  references: string[];
  month: string;
  youtubeUrl?: string;
}

export default function AnglaisLesson() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('id, slug, title, objectif, introduction, contenu, exemples_exercices, references, mois, youtube_url')
          .eq('slug', topicId)
          .single();

        if (error) throw error;

        setLesson({
          id: data.id,
          title: data.title,
          objective: data.objectif,
          introduction: data.introduction,
          content: data.contenu,
          exercises: data.exemples_exercices,
          references: data.references,
          month: data.mois,
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
    <div className="min-h-screen bg-background">
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
                <p className="text-sm text-muted-foreground">{lesson.month}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Progression de la leçon</span>
            <span className="text-sm font-bold">{progress}%</span>
          </div>
          <Progress value={progress} />
        </Card>

        {/* Objective */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Objectif de la leçon</h3>
              <p className="text-muted-foreground">{lesson.objective}</p>
            </div>
          </div>
        </Card>

        {/* Introduction */}
        {lesson.introduction && (
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Introduction
            </h3>
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: lesson.introduction }}
            />
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="content" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">
              <FileText className="w-4 h-4 mr-2" />
              Contenu
            </TabsTrigger>
            <TabsTrigger value="exercises">
              <CheckCircle className="w-4 h-4 mr-2" />
              Exercices
            </TabsTrigger>
            <TabsTrigger value="references">
              <LinkIcon className="w-4 h-4 mr-2" />
              Références
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <Card className="p-6">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="exercises">
            <Card className="p-6">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.exercises }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="references">
            <Card className="p-6">
              {lesson.references && lesson.references.length > 0 ? (
                <ul className="space-y-2">
                  {lesson.references.map((ref, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <LinkIcon className="w-4 h-4 mt-1 text-primary shrink-0" />
                      <span className="text-muted-foreground">{ref}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Aucune référence disponible</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* YouTube Video Section */}
        {lesson.youtubeUrl && (
          <div className="mb-6">
            <YouTubeVideoSection
              lessonTitle={lesson.title}
              objectives={lesson.objective}
              gradeLevel="AF7"
              customYoutubeUrl={lesson.youtubeUrl}
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/anglais-course')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour au cours
          </Button>
          <Button
            onClick={() => {
              setProgress(100);
              toast.success('Leçon terminée !');
            }}
          >
            Marquer comme terminé
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
