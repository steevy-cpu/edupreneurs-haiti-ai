import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Target, FileText, Dumbbell, HelpCircle, StickyNote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const AnglaisLessonAF9 = () => {
  const { lessonSlug } = useParams();
  const navigate = useNavigate();
  const [personalNotes, setPersonalNotes] = useState("");

  useEffect(() => {
    if (lessonSlug) {
      loadPersonalNotes();
    }
  }, [lessonSlug]);

  const loadPersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lesson_notes')
        .select('notes')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonSlug || '')
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
          lesson_id: lessonSlug || '',
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
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert flex-1"
                      dangerouslySetInnerHTML={{ __html: lesson.objectif }}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

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
            <Card>
              <CardContent className="p-6">
                {lesson.introduction ? (
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: lesson.introduction }}
                  />
                ) : (
                  <p className="text-muted-foreground">Introduction non disponible</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contenu">
            <Card>
              <CardContent className="p-6">
                {lesson.contenu ? (
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: lesson.contenu }}
                  />
                ) : (
                  <p className="text-muted-foreground">Contenu non disponible</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exemples">
            <Card>
              <CardContent className="p-6">
                {lesson.exemples_exercices ? (
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
                  />
                ) : (
                  <p className="text-muted-foreground">Exemples non disponibles</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <Card className="p-6">
              <div className="text-center py-12 space-y-4">
                <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground/50" />
                <h3 className="text-xl font-semibold">Quiz Final</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Le quiz pour cette leçon sera bientôt disponible.
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
