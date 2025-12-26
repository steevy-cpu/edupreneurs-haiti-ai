import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Play, Youtube, FileText, Brain, Trophy, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { getActivitiesForModule, type ActivityContent } from "@/data/passionActivities";
import { usePassionModuleVideos } from "@/hooks/usePassionVideos";
import { toast } from "sonner";

interface Activity {
  id: string;
  type: "video" | "quiz" | "reading" | "game";
  title: string;
  description: string;
  duration: string;
  completed: boolean;
}

interface ModuleActivityProps {
  categoryId: string;
  moduleId: string;
  moduleTitle: string;
  moduleDescription?: string;
  activities: Activity[];
  onActivityComplete: (activityId: string) => void;
  onModuleComplete: () => void;
}

export const ModuleActivity = ({
  categoryId,
  moduleId,
  moduleTitle,
  moduleDescription,
  activities,
  onActivityComplete,
  onModuleComplete
}: ModuleActivityProps) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [quizState, setQuizState] = useState<{
    currentQuestion: number;
    score: number;
    answered: boolean;
    selectedAnswer: number | null;
    showExplanation: boolean;
  }>({ currentQuestion: 0, score: 0, answered: false, selectedAnswer: null, showExplanation: false });
  
  const completedCount = activities.filter(a => a.completed).length;
  const progressPercentage = (completedCount / activities.length) * 100;

  // Fetch custom videos for this module
  const { data: customVideos } = usePassionModuleVideos(categoryId, moduleId);

  // Get real activity content if available
  const realActivities = getActivitiesForModule(categoryId, moduleId);
  const currentRealActivity = realActivities?.find(a => a.id === selectedActivity?.id);

  // Get custom video URL for an activity
  const getCustomVideoUrl = (activityId: string): string | null => {
    if (!customVideos) return null;
    const video = customVideos.find(v => v.activity_id === activityId);
    return video?.youtube_url || null;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "video": return <Youtube className="w-5 h-5" aria-hidden="true" />;
      case "quiz": return <Brain className="w-5 h-5" aria-hidden="true" />;
      case "reading": return <FileText className="w-5 h-5" aria-hidden="true" />;
      case "game": return <Trophy className="w-5 h-5" aria-hidden="true" />;
      default: return <Play className="w-5 h-5" aria-hidden="true" />;
    }
  };

  const handleActivityStart = (activity: Activity) => {
    setSelectedActivity(activity);
    setQuizState({ currentQuestion: 0, score: 0, answered: false, selectedAnswer: null, showExplanation: false });
  };

  const handleActivityFinish = () => {
    if (selectedActivity) {
      onActivityComplete(selectedActivity.id);
      setSelectedActivity(null);
      setQuizState({ currentQuestion: 0, score: 0, answered: false, selectedAnswer: null, showExplanation: false });
      
      // Check if all activities are completed
      if (completedCount + 1 === activities.length) {
        onModuleComplete();
      }
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    if (quizState.answered) return;
    
    const questions = currentRealActivity?.content?.quizQuestions;
    if (!questions) return;
    
    const isCorrect = answerIndex === questions[quizState.currentQuestion].correctIndex;
    setQuizState(prev => ({
      ...prev,
      answered: true,
      selectedAnswer: answerIndex,
      showExplanation: true,
      score: isCorrect ? prev.score + 1 : prev.score
    }));
    
    if (isCorrect) {
      toast.success("Bonne réponse! 🎉");
    } else {
      toast.error("Pas tout à fait...");
    }
  };

  const handleNextQuestion = () => {
    const questions = currentRealActivity?.content?.quizQuestions;
    if (!questions) return;
    
    if (quizState.currentQuestion < questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        answered: false,
        selectedAnswer: null,
        showExplanation: false
      }));
    } else {
      // Quiz finished
      handleActivityFinish();
    }
  };

  if (selectedActivity) {
    const questions = currentRealActivity?.content?.quizQuestions;
    const currentQuestion = questions?.[quizState.currentQuestion];
    
    return (
      <Card className="w-full" role="article" aria-label={`Activité: ${selectedActivity.title}`}>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              {getActivityIcon(selectedActivity.type)}
              <div>
                <CardTitle>{selectedActivity.title}</CardTitle>
                <CardDescription>{selectedActivity.description}</CardDescription>
              </div>
            </div>
            <Badge>{selectedActivity.duration}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedActivity.type === "video" && (
            <div className="space-y-4">
              <YouTubeVideoSection
                lessonTitle={`${moduleTitle} - ${selectedActivity.title}`}
                objectives={selectedActivity.description}
                subject={categoryId}
                customYoutubeUrl={getCustomVideoUrl(selectedActivity.id) || undefined}
              />
              <p className="text-sm text-muted-foreground text-center">
                Regarde ces vidéos pour découvrir et apprendre sur ce sujet passionnant!
              </p>
            </div>
          )}

          {selectedActivity.type === "quiz" && questions && currentQuestion && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline">
                  Question {quizState.currentQuestion + 1}/{questions.length}
                </Badge>
                <Badge variant="secondary">
                  Score: {quizState.score}/{questions.length}
                </Badge>
              </div>
              
              <div className="p-6 bg-muted rounded-lg">
                <h3 className="font-semibold mb-4 text-lg">{currentQuestion.question}</h3>
                <div className="space-y-2" role="radiogroup" aria-label="Options de réponse">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = quizState.selectedAnswer === index;
                    const isCorrect = index === currentQuestion.correctIndex;
                    const showResult = quizState.answered;
                    
                    let buttonClass = "w-full justify-start text-left";
                    if (showResult) {
                      if (isCorrect) {
                        buttonClass += " bg-green-100 border-green-500 dark:bg-green-900/30";
                      } else if (isSelected && !isCorrect) {
                        buttonClass += " bg-red-100 border-red-500 dark:bg-red-900/30";
                      }
                    }
                    
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className={buttonClass}
                        onClick={() => handleQuizAnswer(index)}
                        disabled={quizState.answered}
                        aria-pressed={isSelected}
                      >
                        <span className="flex items-center gap-2 w-full">
                          <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                          <span className="flex-1">{option}</span>
                          {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                          {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                        </span>
                      </Button>
                    );
                  })}
                </div>
                
                {quizState.showExplanation && (
                  <div className="mt-4 p-4 bg-background rounded-lg border" role="alert">
                    <p className="text-sm font-medium mb-1">Explication:</p>
                    <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                  </div>
                )}
              </div>
              
              {quizState.answered && (
                <Button 
                  onClick={handleNextQuestion}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {quizState.currentQuestion < questions.length - 1 ? "Question suivante" : "Terminer le quiz"}
                </Button>
              )}
            </div>
          )}

          {selectedActivity.type === "quiz" && !questions && (
            <div className="space-y-4">
              <div className="p-6 bg-muted rounded-lg">
                <h3 className="font-semibold mb-4">Question 1: Qu'as-tu appris dans ce module?</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">A. Les bases</Button>
                  <Button variant="outline" className="w-full justify-start">B. Les techniques avancées</Button>
                  <Button variant="outline" className="w-full justify-start">C. Tout ce qui précède</Button>
                </div>
              </div>
            </div>
          )}

          {selectedActivity.type === "reading" && currentRealActivity?.content?.readingContent && (
            <div 
              className="prose dark:prose-invert max-w-none p-4 bg-muted/50 rounded-lg"
              dangerouslySetInnerHTML={{ __html: currentRealActivity.content.readingContent }}
              role="article"
              aria-label="Contenu de lecture"
            />
          )}

          {selectedActivity.type === "reading" && !currentRealActivity?.content?.readingContent && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-muted-foreground">
                Contenu éducatif enrichissant sur {moduleTitle}. Prends le temps de bien comprendre 
                chaque concept présenté. Eric est là pour t'aider si tu as des questions!
              </p>
            </div>
          )}

          {selectedActivity.type === "game" && (
            <div className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-bold mb-2">Jeu interactif</h3>
              <p className="text-muted-foreground mb-4">
                {currentRealActivity?.content?.gameDescription || "Mets en pratique ce que tu as appris de manière ludique!"}
              </p>
            </div>
          )}

          {(selectedActivity.type !== "quiz" || !questions || quizState.answered) && selectedActivity.type !== "quiz" && (
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setSelectedActivity(null)} className="flex-1">
                Retour
              </Button>
              <Button onClick={handleActivityFinish} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
                <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
                Marquer comme terminé
              </Button>
            </div>
          )}

          {selectedActivity.type === "quiz" && !questions && (
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setSelectedActivity(null)} className="flex-1">
                Retour
              </Button>
              <Button onClick={handleActivityFinish} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
                <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
                Marquer comme terminé
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card role="region" aria-label={`Module: ${moduleTitle}`}>
      <CardHeader>
        <CardTitle>{moduleTitle}</CardTitle>
        {moduleDescription && (
          <CardDescription className="mt-2">{moduleDescription}</CardDescription>
        )}
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span>Progression</span>
            <span className="font-medium" aria-live="polite">{completedCount}/{activities.length} activités</span>
          </div>
          <Progress value={progressPercentage} className="h-2" aria-label={`${Math.round(progressPercentage)}% complété`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3" role="list" aria-label="Liste des activités">
          {activities.map((activity, index) => (
            <Card 
              key={activity.id} 
              className={`cursor-pointer transition-all ${activity.completed ? 'bg-muted/50' : 'hover:shadow-md'}`}
              role="listitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!activity.completed) handleActivityStart(activity);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${activity.completed ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                    {activity.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" aria-hidden="true" />
                    ) : (
                      getActivityIcon(activity.type)
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">Activité {index + 1}</span>
                      <Badge variant="secondary" className="text-xs">{activity.duration}</Badge>
                    </div>
                    <h4 className="font-semibold">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  {!activity.completed && (
                    <Button 
                      onClick={() => handleActivityStart(activity)} 
                      size="sm"
                      aria-label={`Commencer l'activité ${activity.title}`}
                    >
                      <Play className="w-4 h-4 mr-1" aria-hidden="true" />
                      Commencer
                    </Button>
                  )}
                  {activity.completed && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />
                      Terminé
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};