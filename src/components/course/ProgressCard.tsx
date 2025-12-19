import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";

interface ProgressCardProps {
  completedLessons: number;
  totalLessons: number;
  title?: string;
}

export const ProgressCard = ({
  completedLessons,
  totalLessons,
  title = "Votre progression"
}: ProgressCardProps) => {
  const progress = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0;

  return (
    <Card className="mb-8">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="mb-2" />
        <p className="text-sm text-muted-foreground">
          {completedLessons} sur {totalLessons} leçons complétées ({progress}%)
        </p>
      </CardContent>
    </Card>
  );
};
