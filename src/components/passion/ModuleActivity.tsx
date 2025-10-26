import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Play, Youtube, FileText, Brain, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  activities: Activity[];
  onActivityComplete: (activityId: string) => void;
  onModuleComplete: () => void;
}

export const ModuleActivity = ({
  categoryId,
  moduleId,
  moduleTitle,
  activities,
  onActivityComplete,
  onModuleComplete
}: ModuleActivityProps) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  const completedCount = activities.filter(a => a.completed).length;
  const progressPercentage = (completedCount / activities.length) * 100;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "video": return <Youtube className="w-5 h-5" />;
      case "quiz": return <Brain className="w-5 h-5" />;
      case "reading": return <FileText className="w-5 h-5" />;
      case "game": return <Trophy className="w-5 h-5" />;
      default: return <Play className="w-5 h-5" />;
    }
  };

  const handleActivityStart = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const handleActivityFinish = () => {
    if (selectedActivity) {
      onActivityComplete(selectedActivity.id);
      setSelectedActivity(null);
      
      // Check if all activities are completed
      if (completedCount + 1 === activities.length) {
        onModuleComplete();
      }
    }
  };

  if (selectedActivity) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
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
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Youtube className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Vidéo éducative en cours...</p>
              </div>
            </div>
          )}

          {selectedActivity.type === "quiz" && (
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

          {selectedActivity.type === "reading" && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-muted-foreground">
                Contenu éducatif enrichissant sur {moduleTitle}. Prends le temps de bien comprendre 
                chaque concept présenté. Eric est là pour t'aider si tu as des questions!
              </p>
            </div>
          )}

          {selectedActivity.type === "game" && (
            <div className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Jeu interactif</h3>
              <p className="text-muted-foreground mb-4">
                Mets en pratique ce que tu as appris de manière ludique!
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setSelectedActivity(null)} className="flex-1">
              Retour
            </Button>
            <Button onClick={handleActivityFinish} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Marquer comme terminé
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{moduleTitle}</CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression</span>
            <span className="font-medium">{completedCount}/{activities.length} activités</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <Card key={activity.id} className={`cursor-pointer transition-all ${activity.completed ? 'bg-muted/50' : 'hover:shadow-md'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${activity.completed ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                    {activity.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
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
                    <Button onClick={() => handleActivityStart(activity)} size="sm">
                      <Play className="w-4 h-4 mr-1" />
                      Commencer
                    </Button>
                  )}
                  {activity.completed && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
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