import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  BookOpen,
  Target,
  Lightbulb,
  ClipboardCheck,
  Beaker,
  Brain,
  Star,
  Award
} from "lucide-react";
import { sciencesLessons7AF, sciencesTopics } from "@/data/sciencesLessons";
import { InteractiveQuiz } from "@/components/InteractiveQuiz";
import { InteractiveActivities } from "@/components/InteractiveActivities";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SciencesLesson() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  const lessonContent = topicId ? sciencesLessons7AF[topicId] : null;
  const topicInfo = sciencesTopics.find(topic => topic.id === topicId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [topicId]);

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    const percentage = (score / totalQuestions) * 100;
    const points = Math.round(percentage * 2);
    
    setEarnedPoints(points);
    setLessonCompleted(true);

    toast({
      title: "🎉 Quiz terminé !",
      description: `Excellent travail ! Score: ${score}/${totalQuestions}`,
    });
  };

  if (!lessonContent || !topicInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Leçon non trouvée</h2>
          <Button onClick={() => navigate("/sciences-course")}>
            Retour au cours
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/sciences-course")}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-semibold">Retour au cours</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Lesson Header */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <Beaker className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{topicInfo.category}</Badge>
                <Badge variant="outline">{topicInfo.difficulty}</Badge>
              </div>
              <h1 className="text-4xl font-bold mb-3">{topicInfo.title}</h1>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {topicInfo.duration}
                </span>
                {lessonCompleted && (
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <Award className="w-4 h-4" />
                    +{earnedPoints} points gagnés
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Lesson Content Tabs */}
        <Card className="p-6 mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="introduction" className="gap-2">
                <Lightbulb className="w-4 h-4" />
                Introduction
              </TabsTrigger>
              <TabsTrigger value="objectifs" className="gap-2">
                <Target className="w-4 h-4" />
                Objectifs
              </TabsTrigger>
              <TabsTrigger value="contenu" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Contenu
              </TabsTrigger>
              <TabsTrigger value="exemples" className="gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Exemples
              </TabsTrigger>
            </TabsList>

            <TabsContent value="introduction" className="space-y-6">
              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lessonContent.introduction }}
              />
            </TabsContent>

            <TabsContent value="objectifs" className="space-y-6">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Objectifs de la leçon
                </h3>
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: lessonContent.objectif }}
                />
              </div>
            </TabsContent>

            <TabsContent value="contenu" className="space-y-6">
              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lessonContent.contenu }}
              />
            </TabsContent>

            <TabsContent value="exemples" className="space-y-6">
              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lessonContent.exemplesExercices }}
              />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Activities & Quiz - Coming Soon */}
        <Card className="p-8 mb-8 text-center bg-gradient-to-r from-primary/10 to-secondary/10">
          <Brain className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h3 className="text-2xl font-bold mb-2">Activités et Quiz</h3>
          <p className="text-muted-foreground">
            Les activités interactives et quiz pour cette leçon seront disponibles prochainement.
          </p>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/sciences-course")}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour au cours
          </Button>
          <Button 
            onClick={() => {
              const currentIndex = sciencesTopics.findIndex(t => t.id === topicId);
              const nextTopic = sciencesTopics[currentIndex + 1];
              if (nextTopic) {
                navigate(`/sciences-lesson/${nextTopic.id}`);
              } else {
                toast({
                  title: "🎉 Félicitations !",
                  description: "Tu as terminé tous les cours de Sciences Expérimentales !",
                });
              }
            }}
            className="flex-1"
            disabled={!sciencesTopics[sciencesTopics.findIndex(t => t.id === topicId) + 1]}
          >
            Leçon suivante
            <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}