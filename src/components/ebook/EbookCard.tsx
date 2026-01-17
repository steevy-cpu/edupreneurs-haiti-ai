import { Link } from "react-router-dom";
import { Book, User, Globe, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Ebook } from "@/hooks/useEbooks";
import type { ReadingProgress } from "@/hooks/useReadingProgress";

interface EbookCardProps {
  ebook: Ebook;
  progress?: ReadingProgress | null;
  disabled?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  roman: 'Roman',
  poesie: 'Poésie',
  sciences: 'Sciences',
  histoire: 'Histoire',
  biographie: 'Biographie',
  philosophie: 'Philosophie',
  autre: 'Autre',
};

const CATEGORY_COLORS: Record<string, string> = {
  roman: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  poesie: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  sciences: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30',
  histoire: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  biographie: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30',
  philosophie: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
  autre: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
};

export function EbookCard({ ebook, progress, disabled }: EbookCardProps) {
  const progressPercent = progress && ebook.page_count 
    ? Math.round((progress.current_page / ebook.page_count) * 100)
    : 0;

  const hasStarted = progress && progress.current_page > 1;
  const isCompleted = progress?.is_completed;
  const categoryColor = ebook.category ? CATEGORY_COLORS[ebook.category] || CATEGORY_COLORS.autre : '';

  const cardContent = (
    <Card className={`
      group overflow-hidden transition-all duration-300 
      hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1
      border-l-4 border-l-transparent hover:border-l-primary
      ${disabled ? 'opacity-75' : ''}
    `}>
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {ebook.cover_url ? (
          <img
            src={ebook.cover_url}
            alt={ebook.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Book className="h-16 w-16 text-primary/30" />
          </div>
        )}
        
        {/* Language Badge */}
        <Badge 
          variant="secondary" 
          className="absolute right-2 top-2 text-xs uppercase backdrop-blur-sm bg-background/80"
        >
          <Globe className="mr-1 h-3 w-3" />
          {ebook.language}
        </Badge>

        {/* Completed Badge */}
        {isCompleted && (
          <Badge className="absolute left-2 top-2 bg-green-500 shadow-lg">
            ✓ Lu
          </Badge>
        )}

        {/* Progress Bar Overlay */}
        {hasStarted && !isCompleted && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="flex items-center gap-2 text-xs text-white">
              <Clock className="h-3 w-3" />
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <Progress 
              value={progressPercent} 
              className="mt-1.5 h-1.5 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-emerald-500" 
            />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Category */}
        {ebook.category && (
          <Badge 
            variant="outline" 
            className={`mb-2 text-xs border ${categoryColor}`}
          >
            {CATEGORY_LABELS[ebook.category] || ebook.category}
          </Badge>
        )}

        {/* Title */}
        <h3 className="line-clamp-2 font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
          {ebook.title}
        </h3>

        {/* Author */}
        {ebook.author && (
          <p className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
            <User className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{ebook.author}</span>
          </p>
        )}

        {/* Page Count */}
        {ebook.page_count && (
          <p className="mt-1 text-xs text-muted-foreground">
            {ebook.page_count} pages
          </p>
        )}

        {/* CTA Button */}
        <Button 
          variant={hasStarted ? "default" : "outline"} 
          size="sm" 
          className={`mt-3 w-full transition-all ${
            hasStarted 
              ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70' 
              : 'hover:bg-primary/10'
          }`}
          disabled={disabled}
        >
          {isCompleted ? 'Relire' : hasStarted ? 'Continuer' : 'Commencer'}
        </Button>
      </CardContent>
    </Card>
  );

  if (disabled) {
    return cardContent;
  }

  return (
    <Link to={`/lecture/${ebook.id}`} className="block">
      {cardContent}
    </Link>
  );
}
