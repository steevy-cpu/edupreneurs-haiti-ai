import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EbookFilters as EbookFiltersType } from "@/hooks/useEbooks";

interface EbookFiltersProps {
  filters: EbookFiltersType;
  onFiltersChange: (filters: EbookFiltersType) => void;
}

const CATEGORIES = [
  { value: 'roman', label: 'Roman' },
  { value: 'poesie', label: 'Poésie' },
  { value: 'sciences', label: 'Sciences' },
  { value: 'histoire', label: 'Histoire' },
  { value: 'biographie', label: 'Biographie' },
  { value: 'philosophie', label: 'Philosophie' },
  { value: 'autre', label: 'Autre' },
];

export function EbookFilters({ filters, onFiltersChange }: EbookFiltersProps) {
  const activeFiltersCount = [
    filters.language && filters.language !== 'all',
    filters.category,
    filters.search,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un livre..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
          className="pl-10"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Language Filter */}
        <Select
          value={filters.language || 'all'}
          onValueChange={(value) => 
            onFiltersChange({ 
              ...filters, 
              language: value === 'all' ? undefined : value as 'fr' | 'en' 
            })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Langue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes langues</SelectItem>
            <SelectItem value="fr">🇫🇷 Français</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => 
            onFiltersChange({ 
              ...filters, 
              category: value === 'all' ? undefined : value 
            })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Effacer ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Quick Category Chips (Mobile-friendly horizontal scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:hidden">
        {CATEGORIES.map((cat) => (
          <Badge
            key={cat.value}
            variant={filters.category === cat.value ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => 
              onFiltersChange({ 
                ...filters, 
                category: filters.category === cat.value ? undefined : cat.value 
              })
            }
          >
            {cat.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
