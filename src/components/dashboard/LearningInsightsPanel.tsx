import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, Award } from "lucide-react";

interface LearningInsightsPanelProps {
  analytics: {
    subjectProgress: { subject: string; progress: number; lessonsCompleted: number }[];
    averageScore: number;
    streak: number;
  };
}

export const LearningInsightsPanel = ({ analytics }: LearningInsightsPanelProps) => {
  const bestSubject = analytics.subjectProgress.length > 0
    ? analytics.subjectProgress.reduce((best, current) => 
        current.progress > best.progress ? current : best
      )
    : null;

  const insights = [];

  if (bestSubject && bestSubject.progress > 0) {
    insights.push({
      icon: Award,
      text: `Ton meilleur sujet: ${bestSubject.subject} (${bestSubject.progress}% complété)`,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    });
  }

  if (analytics.averageScore >= 80) {
    insights.push({
      icon: TrendingUp,
      text: `Excellent! Score moyen de ${analytics.averageScore}% 🎯`,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    });
  }

  if (analytics.streak >= 3) {
    insights.push({
      icon: Lightbulb,
      text: `Super série! ${analytics.streak} jours consécutifs d'apprentissage 🔥`,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    });
  }

  if (insights.length === 0) {
    insights.push({
      icon: Lightbulb,
      text: "Commence une leçon pour débloquer tes insights!",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights d'Apprentissage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 p-3 rounded-lg ${insight.bgColor}`}
          >
            <insight.icon className={`w-5 h-5 mt-0.5 ${insight.color}`} />
            <p className="text-sm text-foreground">{insight.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
