import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LearningStreakWidgetProps {
  streak: number;
}

export const LearningStreakWidget = ({ streak }: LearningStreakWidgetProps) => {
  return (
    <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/20 rounded-full">
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Série d'apprentissage</p>
            <p className="text-3xl font-bold text-foreground">
              {streak} {streak === 1 ? "jour" : "jours"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
