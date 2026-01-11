import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Clock, 
  TrendingUp,
  Sparkles
} from "lucide-react";

interface ContinueLearningSubject {
  slug: string;
  name: string;
  icon: any;
  color: string;
  progressPercent: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessedAt?: string;
}

interface ContinueLearningSectionProps {
  subjects: ContinueLearningSubject[];
  isLoading?: boolean;
}

export function ContinueLearningSection({ subjects, isLoading }: ContinueLearningSectionProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold">Continuer l'apprentissage</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-12 bg-muted rounded-lg mb-3" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-2 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return null;
  }

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return null;
  };

  // Get the most recent/primary subject to feature
  const primarySubject = subjects[0];
  const otherSubjects = subjects.slice(1, 3);

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Reprendre où tu en étais</h3>
            <p className="text-xs text-muted-foreground">Continue ton apprentissage</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
          <Sparkles className="w-3 h-3 mr-1" />
          Recommandé
        </Badge>
      </div>

      {/* Primary Featured Card */}
      {primarySubject && (
        <Card
          className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-primary/20 hover:border-primary/40 overflow-hidden mb-4 bg-gradient-to-br from-primary/5 to-transparent"
          onClick={() => navigate(`/course/${primarySubject.slug}`)}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${primarySubject.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                <primarySubject.icon className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                    {primarySubject.name}
                  </h4>
                  {formatTimeAgo(primarySubject.lastAccessedAt) && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeAgo(primarySubject.lastAccessedAt)}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-sm text-muted-foreground">
                    {primarySubject.completedLessons} / {primarySubject.totalLessons} leçons complétées
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {primarySubject.progressPercent}%
                  </span>
                </div>
                
                <Progress value={primarySubject.progressPercent} className="h-2" />
              </div>
              
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
              >
                Reprendre
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other subjects in smaller cards */}
      {otherSubjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {otherSubjects.map((subject) => {
            const IconComponent = subject.icon;
            const timeAgo = formatTimeAgo(subject.lastAccessedAt);

            return (
              <Card
                key={subject.slug}
                className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-border hover:border-primary/30 overflow-hidden"
                onClick={() => navigate(`/course/${subject.slug}`)}
              >
                {/* Top gradient bar */}
                <div className={`h-1 bg-gradient-to-r ${subject.color}`} />
                
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {subject.name}
                      </h4>
                      {timeAgo && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {timeAgo}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {subject.completedLessons}/{subject.totalLessons} leçons
                      </span>
                      <span className="font-semibold text-primary">
                        {subject.progressPercent}%
                      </span>
                    </div>
                    <Progress value={subject.progressPercent} className="h-1.5" />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Continuer
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
