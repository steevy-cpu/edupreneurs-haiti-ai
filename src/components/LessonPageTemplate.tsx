import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BookOpen, FileText, Gamepad2, Target, Lightbulb, ArrowLeft, Save, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { HTMLQuizParser } from "@/components/HTMLQuizParser";
import { useTTS } from "@/hooks/useTTS";

interface LessonData {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  youtube_url?: string;
  grade_level: string;
  activites_interactives?: string;
  quiz_final?: string;
}

interface LessonPageTemplateProps {
  lesson: LessonData;
  lessonSlug: string;
  subjectName: string;
  subjectSlug: string;
  gradeLevel: string;
  ericImage: string;
}

export const LessonPageTemplate = ({
  lesson,
  lessonSlug,
  subjectName,
  subjectSlug,
  gradeLevel,
  ericImage
}: LessonPageTemplateProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [personalNotes, setPersonalNotes] = useState("");
  const { stop } = useTTS();

  useEffect(() => {
    loadPersonalNotes();
  }, [lessonSlug]);

  const loadPersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lesson_notes')
        .select('notes')
        .eq('lesson_id', lessonSlug)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPersonalNotes(data.notes || '');
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const savePersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour sauvegarder des notes",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('lesson_notes')
        .upsert({
          lesson_id: lessonSlug,
          user_id: user.id,
          notes: personalNotes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'lesson_id,user_id'
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Notes sauvegardées avec succès",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border/50">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative">
          <Button
            variant="ghost"
            onClick={() => {
              stop();
              navigate(`/${subjectSlug}`);
            }}
            className="mb-4 sm:mb-6 hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-base">Retour au cours</span>
          </Button>

          <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-8 max-w-6xl mx-auto">
            <div className="flex-1 space-y-2 sm:space-y-4 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs sm:text-sm">{gradeLevel}</Badge>
                <Badge variant="outline" className="text-xs sm:text-sm">{subjectName}</Badge>
              </div>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent break-words">
                {lesson.title}
              </h1>
              <div 
                className="text-muted-foreground lesson-content text-sm sm:text-base" 
                dangerouslySetInnerHTML={{ __html: lesson.objectif }}
              />
              <div className="flex gap-2 flex-wrap">
                <TextToSpeechButton
                  text={`${lesson.title}. ${lesson.objectif}. ${lesson.introduction || ''}`}
                  sectionName="lesson-header"
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                />
                <DownloadLessonButton 
                  subjectName={subjectName}
                  lessonData={{
                    title: lesson.title,
                    objectif: lesson.objectif,
                    introduction: lesson.introduction,
                    contenu: lesson.contenu,
                    exemples_exercices: lesson.exemples_exercices,
                    youtube_url: lesson.youtube_url,
                    grade_level: lesson.grade_level
                  }} 
                />
              </div>
            </div>

            <div className="relative hidden sm:block flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl" />
              <img
                src={ericImage}
                alt="Eric enseignant"
                className="relative w-32 h-32 sm:w-48 sm:h-48 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto p-1 gap-1">
            <TabsTrigger value="introduction" className="flex-col sm:flex-row py-2 sm:py-3 text-xs sm:text-sm gap-1">
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Introduction</span>
              <span className="sm:hidden text-[10px]">Intro</span>
            </TabsTrigger>
            <TabsTrigger value="contenu" className="flex-col sm:flex-row py-2 sm:py-3 text-xs sm:text-sm gap-1">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Contenu</span>
              <span className="sm:hidden text-[10px]">Cours</span>
            </TabsTrigger>
            <TabsTrigger value="exemples" className="flex-col sm:flex-row py-2 sm:py-3 text-xs sm:text-sm gap-1">
              <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Exemples</span>
              <span className="sm:hidden text-[10px]">Ex</span>
            </TabsTrigger>
            <TabsTrigger value="activites" className="flex-col sm:flex-row py-2 sm:py-3 text-xs sm:text-sm gap-1">
              <Gamepad2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Activités</span>
              <span className="sm:hidden text-[10px]">Act</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex-col sm:flex-row py-2 sm:py-3 text-xs sm:text-sm col-span-2 sm:col-span-1 gap-1">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Mes notes</span>
              <span className="sm:hidden text-[10px]">Notes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="introduction" className="space-y-4 sm:space-y-6 mt-4">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {lesson.introduction ? (
                  <div className="lesson-content prose prose-sm sm:prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: lesson.introduction }} />
                ) : (
                  <p className="text-muted-foreground text-sm sm:text-base">Pas d'introduction disponible</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contenu" className="space-y-4 sm:space-y-6 mt-4">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  Contenu du cours
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {lesson.contenu ? (
                  <div className="lesson-content prose prose-sm sm:prose-lg max-w-none overflow-x-auto" dangerouslySetInnerHTML={{ __html: lesson.contenu }} />
                ) : (
                  <p className="text-muted-foreground text-sm sm:text-base">Pas de contenu disponible</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exemples" className="space-y-4 sm:space-y-6 mt-4">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
                  Exemples et Exercices
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {lesson.exemples_exercices ? (
                  <div className="lesson-content prose prose-sm sm:prose-lg max-w-none overflow-x-auto" dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }} />
                ) : (
                  <p className="text-muted-foreground text-sm sm:text-base">Pas d'exemples disponibles</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activites" className="space-y-4 sm:space-y-6 mt-4">
            {lesson.activites_interactives && (
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                    <Gamepad2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    Activités Interactives
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <InteractiveActivitiesEnhanced 
                    activities={lesson.activites_interactives}
                  />
                </CardContent>
              </Card>
            )}

            {lesson.youtube_url && (
              <YouTubeVideoSection 
                customYoutubeUrl={lesson.youtube_url}
                lessonTitle={lesson.title}
                objectives={lesson.objectif}
                gradeLevel={gradeLevel}
                subject={subjectName.toLowerCase()}
              />
            )}

            {lesson.quiz_final && (
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                    <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
                    Quiz Final
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <HTMLQuizParser 
                    htmlContent={lesson.quiz_final}
                    lessonSlug={lessonSlug}
                    subject={subjectName.toLowerCase()}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 sm:space-y-6 mt-4">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  Mes Notes Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-3 sm:p-6">
                <Textarea
                  placeholder="Écris tes notes ici..."
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  className="min-h-[200px] sm:min-h-[300px] resize-none text-sm sm:text-base"
                />
                <Button onClick={savePersonalNotes} className="w-full">
                  <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Sauvegarder mes notes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
