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

export function EbookCard({ ebook, progress, disabled }: EbookCardProps) {
  const progressPercent = progress && ebook.page_count 
    ? Math.round((progress.current_page / ebook.page_count) * 100)
    : 0;

  const hasStarted = progress && progress.current_page > 1;
  const isCompleted = progress?.is_completed;

  const cardContent = (
    <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${disabled ? 'opacity-75' : ''}`}>
      {/* Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {ebook.cover_url ? (
          <img
            src={ebook.cover_url}
            alt={ebook.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
          className="absolute right-2 top-2 text-xs uppercase"
        >
          <Globe className="mr-1 h-3 w-3" />
          {ebook.language}
        </Badge>

        {/* Completed Badge */}
        {isCompleted && (
          <Badge className="absolute left-2 top-2 bg-green-500">
            ✓ Lu
          </Badge>
        )}

        {/* Progress Bar Overlay */}
        {hasStarted && !isCompleted && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <div className="flex items-center gap-2 text-xs text-white">
              <Clock className="h-3 w-3" />
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="mt-1 h-1" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Category */}
        {ebook.category && (
          <Badge variant="outline" className="mb-2 text-xs">
            {CATEGORY_LABELS[ebook.category] || ebook.category}
          </Badge>
        )}

        {/* Title */}
        <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-primary transition-colors">
          {ebook.title}
        </h3>

        {/* Author */}
        {ebook.author && (
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
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
          className="mt-3 w-full"
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
