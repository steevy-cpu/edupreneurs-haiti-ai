import { Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface WeeklyGoalWidgetProps {
  current: number;
  target: number;
}

export const WeeklyGoalWidget = ({ current, target }: WeeklyGoalWidgetProps) => {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-full">
            <Target className="w-8 h-8 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Objectif Hebdomadaire</p>
            <p className="text-2xl font-bold text-foreground">
              {current} / {target} leçons
            </p>
          </div>
        </div>
        <Progress value={percentage} className="h-2" />
      </CardContent>
    </Card>
  );
};
