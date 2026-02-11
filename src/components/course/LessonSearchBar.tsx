import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LessonSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResults: number;
  totalLessons: number;
}

export const LessonSearchBar = ({
  searchQuery,
  onSearchChange,
  totalResults,
  totalLessons,
}: LessonSearchBarProps) => {
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Rechercher une leçon..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-11"
        />
        {isSearching && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => onSearchChange("")}
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isSearching && (
        <p className="text-sm text-muted-foreground mt-2">
          {totalResults} sur {totalLessons} leçons
        </p>
      )}
    </div>
  );
};
