import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Heart, 
  TrendingUp,
  Clock,
  Flame,
  Sparkles,
  BookOpen,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

interface SubjectCardEnhancedProps {
  id: string;
  title: string;
  description: string;
  icon: any;
  lessons: number;
  exercises: number;
  color: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  progressPercent?: number;
  completedLessons?: number;
  isPopular?: boolean;
  isNew?: boolean;
  estimatedHours?: number;
  difficulty?: "easy" | "medium" | "hard";
}

export function SubjectCardEnhanced({
  id,
  title,
  description,
  icon: IconComponent,
  lessons,
  exercises,
  color,
  isFavorite = false,
  onToggleFavorite,
  progressPercent = 0,
  completedLessons = 0,
  isPopular = false,
  isNew = false,
  estimatedHours,
  difficulty = "medium"
}: SubjectCardEnhancedProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const hasContent = lessons > 0;

  const getDifficultyBadge = () => {
    const configs = {
      easy: { label: "Débutant", className: "bg-green-500/10 text-green-600 dark:text-green-400" },
      medium: { label: "Intermédiaire", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
      hard: { label: "Avancé", className: "bg-red-500/10 text-red-600 dark:text-red-400" }
    };
    return configs[difficulty];
  };

  return (
    <TooltipProvider>
      <Card
        className={`group transition-all duration-300 overflow-hidden relative ${
          hasContent 
            ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer border-border hover:border-primary/30' 
            : 'opacity-70 border-dashed'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (hasContent) {
            navigate(`/course/${id}`);
          }
        }}
      >
        {/* Top gradient bar */}
        <div className={`h-1.5 bg-gradient-to-r ${color} ${!hasContent ? 'opacity-50' : ''}`} />
        
        {/* Badges row */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex gap-1.5 flex-wrap">
            {isPopular && (
              <Badge variant="secondary" className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
                <Flame className="w-3 h-3 mr-0.5" />
                Populaire
              </Badge>
            )}
            {isNew && (
              <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                <Sparkles className="w-3 h-3 mr-0.5" />
                Nouveau
              </Badge>
            )}
            {hasContent && !isPopular && !isNew && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Disponible
              </span>
            )}
          </div>
          
          {/* Quick actions - visible on hover */}
          {hasContent && (
            <div className={`flex items-center gap-1 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite?.();
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      isFavorite 
                        ? 'bg-red-500/10 text-red-500' 
                        : 'bg-background/80 backdrop-blur-sm hover:bg-background text-muted-foreground hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                </TooltipContent>
              </Tooltip>

            </div>
          )}
        </div>
        
        <div className="p-4 sm:p-6 pt-10">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${!hasContent ? 'grayscale' : ''} group-hover:scale-105 transition-transform flex-shrink-0`}>
              <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">
                {title}
              </h3>
              
              {/* Difficulty and time estimate */}
              {hasContent && (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] ${getDifficultyBadge().className}`}>
                    {getDifficultyBadge().label}
                  </Badge>
                  {estimatedHours && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      ~{estimatedHours}h
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground mt-3 line-clamp-2 min-h-[2.5rem]">
            {description}
          </p>

          {/* Progress bar (if user has progress) */}
          {hasContent && progressPercent > 0 && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                  {completedLessons}/{lessons} complétées
                </span>
                <span className="font-semibold text-primary">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}

          <div className="flex gap-2 mt-4 flex-wrap">
            <Badge variant="secondary" className="text-xs font-medium">
              <BookOpen className="w-3 h-3 mr-1" />
              {lessons} {lessons === 1 ? 'leçon' : 'leçons'}
            </Badge>
            <Badge variant="secondary" className="text-xs font-medium">
              ✏️ {exercises} {exercises === 1 ? 'exercice' : 'exercices'}
            </Badge>
          </div>

          {hasContent ? (
            <Button
              className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/course/${id}`);
              }}
            >
              {progressPercent > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Continuer →
                </>
              ) : (
                "Commencer →"
              )}
            </Button>
          ) : (
            <Button
              className="w-full mt-4"
              variant="outline"
              disabled
            >
              🚧 Bientôt disponible
            </Button>
          )}
        </div>

        {/* Hover tooltip with more info */}
        {hasContent && isHovered && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 hidden lg:block">
            <div className="bg-popover border border-border rounded-lg shadow-xl p-3 w-64 animate-fade-in">
              <p className="text-xs font-medium mb-2">📚 Aperçu du contenu</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• {lessons} leçons interactives</li>
                <li>• {exercises} exercices pratiques</li>
                {progressPercent > 0 && (
                  <li className="text-primary">• {progressPercent}% de progression</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </Card>
    </TooltipProvider>
  );
}
