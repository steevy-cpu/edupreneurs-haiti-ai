import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Target, BookOpen, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Progress } from "@/components/ui/progress";
import { MusicSelector } from "@/components/MusicSelector";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LessonData {
  id: string;
  title: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  references: string[];
  mois: string;
}

const EspagnolLesson = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress] = useState(0);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!topicId) return;

      try {
        const { data: subject } = await supabase
          .from('subjects')
          .select('id')
          .eq('slug', 'espagnol')
          .maybeSingle();

        if (!subject) {
          toast.error("Matière non trouvée");
          navigate('/espagnol-course');
          return;
        }

        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('subject_id', subject.id)
          .eq('slug', topicId)
          .eq('is_published', true)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setLesson({
            id: data.id,
            title: data.title,
            objectif: data.objectif || '',
            introduction: data.introduction || '',
            contenu: data.contenu || '',
            exemples_exercices: data.exemples_exercices || '',
            references: data.references || [],
            mois: data.mois || ''
          });
        } else {
          toast.error("Leçon non trouvée");
          navigate('/espagnol-course');
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
        toast.error("Erreur lors du chargement de la leçon");
        navigate('/espagnol-course');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [topicId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Chargement de la leçon...</p>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation Bar */}
      <nav className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/espagnol-course')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au cours
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Lesson Header */}
        <div className="mb-8 space-y-4">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {lesson.mois}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {lesson.title}
          </h1>
        </div>

        <MusicSelector />

        {/* Progress Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Progression de la leçon</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">{progress}% complété</p>
          </CardContent>
        </Card>

        {/* Objective Card */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Objectif de la leçon</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{lesson.objectif}</p>
          </CardContent>
        </Card>

        {/* Introduction */}
        {lesson.introduction && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <CardTitle>Introduction</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {lesson.introduction}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="content" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="exercises">Exercices</TabsTrigger>
            <TabsTrigger value="references">Références</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle>Contenu du cours</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                <div 
                  className="whitespace-pre-line leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: lesson.contenu.replace(/\n/g, '<br/>') }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <CardTitle>Exemples et Exercices</CardTitle>
                </div>
                <CardDescription>
                  Pratiquez ce que vous avez appris
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                <div 
                  className="whitespace-pre-line leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices.replace(/\n/g, '<br/>') }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="references" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Références</CardTitle>
                <CardDescription>
                  Sources et ressources complémentaires
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lesson.references && lesson.references.length > 0 ? (
                  <ul className="space-y-2">
                    {lesson.references.map((ref, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{ref}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Aucune référence disponible</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/espagnol-course')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au cours
          </Button>
          <Button className="gap-2">
            Marquer comme terminé
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EspagnolLesson;
