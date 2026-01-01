import { BookOpen, Target, Clock, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuickStatsBarProps {
  totalLessons: number;
  totalActivities: number;
  estimatedHours: number;
  completionRate: number;
}

export const QuickStatsBar = ({
  totalLessons,
  totalActivities,
  estimatedHours,
  completionRate
}: QuickStatsBarProps) => {
  const stats = [
    {
      icon: BookOpen,
      value: totalLessons,
      label: totalLessons === 1 ? "Leçon" : "Leçons",
      color: "from-primary to-primary/70",
      bgColor: "bg-primary/10"
    },
    {
      icon: Target,
      value: totalActivities,
      label: totalActivities === 1 ? "Exercice" : "Exercices",
      color: "from-secondary to-secondary/70",
      bgColor: "bg-secondary/10"
    },
    {
      icon: Clock,
      value: `~${estimatedHours}h`,
      label: "Durée estimée",
      color: "from-accent to-accent/70",
      bgColor: "bg-accent/10"
    },
    {
      icon: TrendingUp,
      value: `${completionRate}%`,
      label: "Progression",
      color: "from-success to-success/70",
      bgColor: "bg-success/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="relative overflow-hidden p-4 border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="absolute inset-0 bg-gradient-to-br opacity-5" style={{
            background: `linear-gradient(135deg, hsl(var(--${stat.color.includes('primary') ? 'primary' : stat.color.includes('secondary') ? 'secondary' : stat.color.includes('accent') ? 'accent' : 'success'})) 0%, transparent 100%)`
          }} />
          
          <div className="relative flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{
                color: `hsl(var(--${stat.color.includes('primary') ? 'primary' : stat.color.includes('secondary') ? 'secondary' : stat.color.includes('accent') ? 'accent' : 'success'}))`
              }} />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
