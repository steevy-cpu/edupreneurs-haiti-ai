import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  BookOpen,
  Target,
  FileText,
  Dumbbell,
  HelpCircle,
  StickyNote
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
  const [personalNotes, setPersonalNotes] = useState("");

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
      loadPersonalNotes();
    }
  }, [topicId, navigate]);

  const loadPersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lesson_notes')
        .select('notes')
        .eq('user_id', user.id)
        .eq('lesson_id', topicId || '')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setPersonalNotes(data.notes || "");
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const savePersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour sauvegarder vos notes");
        return;
      }

      const { error } = await supabase
        .from('lesson_notes')
        .upsert({
          user_id: user.id,
          lesson_id: topicId || '',
          notes: personalNotes,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Vos notes personnelles ont été enregistrées avec succès");
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error("Impossible de sauvegarder vos notes");
    }
  };

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
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Objectif de la leçon</h3>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.objectif }}
              />
            </div>
          </div>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="introduction" className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
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
            <TabsTrigger value="notes">
              <StickyNote className="w-4 h-4 mr-2" />
              Mes Notes
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

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Mes Notes Personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Écrivez vos notes ici..."
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  className="min-h-[300px]"
                />
                <Button onClick={savePersonalNotes} className="w-full">
                  <StickyNote className="w-4 h-4 mr-2" />
                  Sauvegarder mes notes
                </Button>
              </CardContent>
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
