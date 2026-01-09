import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, SortAsc, SortDesc, X } from "lucide-react";
import { debounce } from "@/utils/performanceOptimization";

export type SortOption = "name-asc" | "name-desc" | "lessons-desc" | "lessons-asc" | "progress-desc";
export type FilterOption = "all" | "with-content" | "favorites";

interface MatieresSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  filterOption: FilterOption;
  onFilterChange: (option: FilterOption) => void;
  totalResults: number;
}

export function MatieresSearchFilter({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  filterOption,
  onFilterChange,
  totalResults
}: MatieresSearchFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync local state when parent searchQuery changes (e.g., reset)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounced search handler (300ms delay for better performance)
  const debouncedSearch = useMemo(
    () => debounce((value: string) => onSearchChange(value), 300),
    [onSearchChange]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value); // Immediate local update for responsive UI
    debouncedSearch(value); // Debounced parent update
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    onSearchChange("");
  };

  const handleReset = () => {
    setLocalSearch("");
    onSearchChange("");
    onFilterChange("all");
    onSortChange("name-asc");
  };

  return (
    <div className="mb-6 space-y-3">
      {/* Main search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher une matière..."
            value={localSearch}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          variant={isExpanded ? "default" : "outline"}
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border border-border animate-fade-in">
          <Select value={filterOption} onValueChange={(v) => onFilterChange(v as FilterOption)}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Filtrer par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les matières</SelectItem>
              <SelectItem value="with-content">Avec contenu</SelectItem>
              <SelectItem value="favorites">⭐ Favoris</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOption} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">
                <span className="flex items-center gap-2">
                  <SortAsc className="w-3 h-3" /> Nom (A-Z)
                </span>
              </SelectItem>
              <SelectItem value="name-desc">
                <span className="flex items-center gap-2">
                  <SortDesc className="w-3 h-3" /> Nom (Z-A)
                </span>
              </SelectItem>
              <SelectItem value="lessons-desc">Plus de leçons</SelectItem>
              <SelectItem value="lessons-asc">Moins de leçons</SelectItem>
              <SelectItem value="progress-desc">Ma progression</SelectItem>
            </SelectContent>
          </Select>

          {(localSearch || filterOption !== "all" || sortOption !== "name-asc") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground"
            >
              <X className="w-3 h-3 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
      )}

      {/* Results count */}
      {(searchQuery || filterOption !== "all") && (
        <p className="text-sm text-muted-foreground">
          {totalResults} {totalResults === 1 ? "matière trouvée" : "matières trouvées"}
          {searchQuery && ` pour "${searchQuery}"`}
        </p>
      )}
    </div>
  );
}
