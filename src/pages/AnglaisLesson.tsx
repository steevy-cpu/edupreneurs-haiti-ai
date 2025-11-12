import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  BookOpen,
  Target,
  FileText,
  Dumbbell,
  HelpCircle,
  StickyNote,
  Gamepad2
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { useTTS } from "@/hooks/useTTS";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { QuizGame } from "@/components/math-activities/QuizGame";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { EnglishPracticeChat } from "@/components/EnglishPracticeChat";

interface LessonData {
  id: string;
  title: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  activites_interactives: string | null;
  quiz_final: string | null;
  mois: string;
  youtubeUrl?: string;
}

const parseQuizHTML = (html: string) => {
  const questions = [];
  
  // Create a temporary DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Find all quiz question divs
  const questionDivs = doc.querySelectorAll('.quiz-question');
  
  questionDivs.forEach((questionDiv) => {
    // Extract question text from <p> tag
    const questionP = questionDiv.querySelector('p');
    const questionText = questionP?.textContent?.trim() || '';
    
    // Extract options from .option divs
    const optionDivs = questionDiv.querySelectorAll('.option');
    const options: string[] = [];
    
    optionDivs.forEach((optionDiv) => {
      const optionText = optionDiv.textContent?.trim() || '';
      // Remove the "A) ", "B) ", etc. prefix
      const cleanOption = optionText.replace(/^[A-D]\)\s*/, '');
      if (cleanOption) {
        options.push(cleanOption);
      }
    });
    
    // Extract correct answer from data-correct attribute
    const correctAnswerDiv = questionDiv.querySelector('.correct-answer');
    const correctLetter = correctAnswerDiv?.getAttribute('data-correct') || 'A';
    const correctAnswer = correctLetter.charCodeAt(0) - 65; // Convert A=0, B=1, etc.
    
    // Extract explanation from correct-answer div
    const explanationPs = correctAnswerDiv?.querySelectorAll('p');
    let explanation = '';
    if (explanationPs && explanationPs.length > 1) {
      // Second paragraph contains the explanation
      explanation = explanationPs[1]?.textContent?.trim() || '';
    }
    
    if (questionText && options.length >= 2) {
      questions.push({
        question: questionText,
        options,
        correctAnswer,
        explanation: explanation || 'Bonne réponse!'
      });
    }
  });
  
  return questions;
};

export default function AnglaisLesson() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [personalNotes, setPersonalNotes] = useState("");
  const [session, setSession] = useState<any>(null);
  const { stop } = useTTS();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('id, slug, title, objectif, introduction, contenu, exemples_exercices, activites_interactives, quiz_final, mois, youtube_url')
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
          activites_interactives: data.activites_interactives,
          quiz_final: data.quiz_final,
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
                <ArrowLeft className="w-5 h-5" />
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
            <div className="flex items-center gap-2">
              <DownloadLessonButton
                lessonData={lesson}
                personalNotes={personalNotes}
                subjectName="Anglais AF7"
                variant="outline"
                size="sm"
              />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Objective Card */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-start gap-3">
            <Target className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Objectif de la leçon</h3>
                <TextToSpeechButton text={lesson.objectif} sectionName="Objectif" />
              </div>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.objectif }}
              />
            </div>
          </div>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="introduction" onValueChange={() => stop()} className="mb-6">
          <TabsList className="grid w-full grid-cols-5 gap-1">
            <TabsTrigger value="introduction" className="flex items-center justify-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden md:inline">Introduction</span>
            </TabsTrigger>
            <TabsTrigger value="contenu" className="flex items-center justify-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Contenu & Exemples</span>
            </TabsTrigger>
            <TabsTrigger value="activites" className="flex items-center justify-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden md:inline">Activités</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center justify-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden md:inline">Quiz Final</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center justify-center gap-2">
              <StickyNote className="h-4 w-4" />
              <span className="hidden md:inline">Mes Notes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="introduction">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Introduction</h3>
                <TextToSpeechButton text={lesson.introduction} sectionName="Introduction" />
              </div>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.introduction }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="contenu">
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Contenu Principal</h3>
                <TextToSpeechButton text={lesson.contenu} sectionName="Contenu Principal" />
              </div>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.contenu }}
              />
              
              {lesson.exemples_exercices && (
                <>
                  <div className="border-t my-8" />
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Exemples et Exercices</h3>
                    <TextToSpeechButton text={lesson.exemples_exercices} sectionName="Exemples et Exercices" />
                  </div>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
                  />
                </>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="activites">
            <Card className="p-6 space-y-6">
              {lesson.activites_interactives && (
                <div className="mb-6">
                  <InteractiveActivitiesEnhanced 
                    content={lesson.activites_interactives}
                    isLoading={false}
                  />
                </div>
              )}
              
              <EnglishPracticeChat
                lessonTitle={lesson.title}
                lessonObjective={lesson.objectif || ""}
                lessonSlug={topicId || ""}
                gradeLevel="7AF"
                userNickname={session?.user?.user_metadata?.nickname || session?.user?.email?.split('@')[0] || "Student"}
              />
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <Card className="p-6">
              {lesson.quiz_final ? (
                <QuizGame 
                  topic={lesson.title}
                  questions={parseQuizHTML(lesson.quiz_final)}
                  onComplete={(score, goldEarned) => {
                    toast.success(`Quiz terminé! Vous avez obtenu ${score} points et gagné ${goldEarned} gold!`);
                  }}
                />
              ) : (
                <div className="text-center py-12 space-y-4">
                  <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold">Quiz Final</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Le quiz pour cette leçon sera bientôt disponible. Continuez à réviser le contenu et les exemples!
                  </p>
                </div>
              )}
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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au cours
          </Button>
        </div>
      </div>
    </div>
  );
}
