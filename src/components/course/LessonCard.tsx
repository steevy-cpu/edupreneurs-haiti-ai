import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Award, BookOpen, CheckCircle2 } from "lucide-react";
import { stripHtml, truncateText } from "@/utils/courseHelpers";

interface LessonCardProps {
  title: string;
  objectif?: string | null;
  orderIndex: number;
  isPublished?: boolean;
  isCompleted?: boolean;
  onClick: () => void;
  colorGradient?: string;
}

export const LessonCard = ({
  title,
  objectif,
  orderIndex,
  isPublished = true,
  isCompleted = false,
  onClick,
  colorGradient = "from-primary to-primary/80"
}: LessonCardProps) => {
  return (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
        isPublished ? 'cursor-pointer' : 'opacity-60'
      } ${isCompleted ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''}`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            Leçon {orderIndex}
          </Badge>
          {isCompleted && (
            <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Complété
            </Badge>
          )}
          {!isPublished && (
            <Badge variant="secondary" className="text-xs">
              Bientôt
            </Badge>
          )}
        </div>
        <CardTitle className={`text-lg group-hover:text-primary transition-colors line-clamp-2`}>
          {title}
        </CardTitle>
        {objectif && (
          <CardDescription className="line-clamp-2">
            {truncateText(objectif, 120)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>1-2 semaines</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            <span>50 points</span>
          </div>
        </div>
        <Button 
          className="w-full" 
          variant={isCompleted ? "secondary" : "default"}
          disabled={!isPublished}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          {isCompleted ? 'Réviser' : isPublished ? 'Commencer' : 'Bientôt'}
        </Button>
      </CardContent>
    </Card>
  );
};
