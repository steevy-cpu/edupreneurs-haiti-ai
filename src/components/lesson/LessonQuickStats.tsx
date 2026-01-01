import { Clock, Gamepad2, HelpCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LessonQuickStatsProps {
  estimatedMinutes: number;
  activitiesCount: number;
  quizQuestionsCount: number;
  isCompleted?: boolean;
}

export const LessonQuickStats = ({
  estimatedMinutes,
  activitiesCount,
  quizQuestionsCount,
  isCompleted = false
}: LessonQuickStatsProps) => {
  const stats = [
    {
      icon: Clock,
      value: `~${estimatedMinutes}`,
      label: "min",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-500"
    },
    {
      icon: Gamepad2,
      value: activitiesCount.toString(),
      label: "activités",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-500"
    },
    {
      icon: HelpCircle,
      value: quizQuestionsCount.toString(),
      label: "questions",
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-500"
    },
    {
      icon: CheckCircle2,
      value: isCompleted ? "Terminé" : "En cours",
      label: "",
      gradient: isCompleted ? "from-green-500/20 to-emerald-500/20" : "from-slate-500/20 to-gray-500/20",
      iconColor: isCompleted ? "text-green-500" : "text-muted-foreground"
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className={`p-2 sm:p-3 bg-gradient-to-br ${stat.gradient} border-0 shadow-sm`}
        >
          <div className="flex flex-col items-center text-center gap-1">
            <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm sm:text-lg font-bold text-foreground">{stat.value}</span>
              {stat.label && (
                <span className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
