import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Zap } from "lucide-react";

interface AchievementsBadgesProps {
  achievements: any[];
  totalLessons: number;
}

export const AchievementsBadges = ({ achievements, totalLessons }: AchievementsBadgesProps) => {
  const defaultAchievements = [
    { 
      id: 1, 
      name: "Première Leçon", 
      icon: Star, 
      earned: totalLessons >= 1,
      description: "Complète ta première leçon"
    },
    { 
      id: 2, 
      name: "Apprenant Assidu", 
      icon: Award, 
      earned: totalLessons >= 10,
      description: "Complète 10 leçons"
    },
    { 
      id: 3, 
      name: "Maître", 
      icon: Trophy, 
      earned: totalLessons >= 50,
      description: "Complète 50 leçons"
    },
    { 
      id: 4, 
      name: "Éclair", 
      icon: Zap, 
      earned: totalLessons >= 100,
      description: "Complète 100 leçons"
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges & Réalisations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {defaultAchievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                achievement.earned 
                  ? "bg-primary/10 border-primary/20" 
                  : "bg-muted/50 border-muted opacity-50"
              }`}
            >
              <achievement.icon 
                className={`w-8 h-8 mb-2 ${
                  achievement.earned ? "text-primary" : "text-muted-foreground"
                }`} 
              />
              <p className="text-xs font-medium text-center mb-1">{achievement.name}</p>
              <p className="text-xs text-muted-foreground text-center">
                {achievement.description}
              </p>
              {achievement.earned && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  Débloqué ✓
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
