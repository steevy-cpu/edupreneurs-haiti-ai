import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StudyTimeWidgetProps {
  weeklyMinutes: number;
  monthlyMinutes: number;
}

export const StudyTimeWidget = ({ weeklyMinutes, monthlyMinutes }: StudyTimeWidgetProps) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-full">
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Temps d'étude</p>
            <p className="text-2xl font-bold text-foreground">{formatTime(weeklyMinutes)}</p>
            <p className="text-xs text-muted-foreground">Cette semaine</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
