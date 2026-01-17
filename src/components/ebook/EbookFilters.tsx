import { Search, X, Globe, Tag } from "lucide-react";
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
  { value: 'roman', label: 'Roman', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/20' },
  { value: 'poesie', label: 'Poésie', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/20' },
  { value: 'sciences', label: 'Sciences', color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30 hover:bg-green-500/20' },
  { value: 'histoire', label: 'Histoire', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20' },
  { value: 'biographie', label: 'Biographie', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30 hover:bg-pink-500/20' },
  { value: 'philosophie', label: 'Philosophie', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20' },
  { value: 'autre', label: 'Autre', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30 hover:bg-slate-500/20' },
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
    <div className="space-y-4 rounded-xl border bg-card/80 p-4 shadow-sm backdrop-blur-sm">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un livre..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
          className="pl-10 bg-background/50 focus:bg-background transition-colors"
        />
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3">
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
          <SelectTrigger className="w-[130px] bg-background">
            <Globe className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <SelectValue placeholder="Langue" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="fr">🇫🇷 Français</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter - Hidden on mobile, shown on md+ */}
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => 
            onFiltersChange({ 
              ...filters, 
              category: value === 'all' ? undefined : value 
            })
          }
        >
          <SelectTrigger className="hidden w-[160px] bg-background md:flex">
            <Tag className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
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
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Effacer ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Quick Category Chips (Mobile-friendly horizontal scroll) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide md:hidden">
        {CATEGORIES.map((cat) => {
          const isSelected = filters.category === cat.value;
          return (
            <Badge
              key={cat.value}
              variant="outline"
              className={`cursor-pointer whitespace-nowrap border transition-all ${
                isSelected 
                  ? `${cat.color} scale-105 shadow-sm` 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => 
                onFiltersChange({ 
                  ...filters, 
                  category: isSelected ? undefined : cat.value 
                })
              }
            >
              {cat.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
