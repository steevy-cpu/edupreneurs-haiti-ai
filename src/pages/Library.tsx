import { useState, useEffect } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEbooks, type EbookFilters } from "@/hooks/useEbooks";
import { useAllReadingProgress } from "@/hooks/useReadingProgress";
import { EbookCard } from "@/components/ebook/EbookCard";
import { EbookFilters as Filters } from "@/components/ebook/EbookFilters";
import { VisitorLibraryOverlay } from "@/components/ebook/VisitorLibraryOverlay";
import { useVisitor } from "@/contexts/VisitorContext";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Library() {
  const { isVisitor } = useVisitor();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [filters, setFilters] = useState<EbookFilters>({});
  
  const { data: ebooks, isLoading: ebooksLoading } = useEbooks(filters);
  const { data: progressList } = useAllReadingProgress();

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Create a map of ebook_id to progress for quick lookup
  const progressMap = new Map(
    progressList?.map(p => [p.ebook_id, p]) || []
  );

  const showOverlay = isVisitor && !isAuthenticated;

  // Calculate reading stats
  const booksStarted = progressList?.filter(p => p.current_page > 1).length || 0;
  const booksCompleted = progressList?.filter(p => p.is_completed).length || 0;

  return (
    <div className="relative min-h-screen pb-24 md:pb-6">
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 bottom-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-6">
        {/* Enhanced Header */}
        <div className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-emerald-500/10 p-6 backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-2xl font-bold text-foreground md:text-3xl">
                <div className="rounded-xl bg-primary/20 p-2.5">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                Bibliothèque
              </h1>
              <p className="mt-2 max-w-md text-muted-foreground">
                Explorez notre collection de livres en français et anglais
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {booksCompleted > 0 && (
                <Badge variant="secondary" className="gap-1.5 bg-green-500/10 text-green-600 dark:text-green-400">
                  <Sparkles className="h-3 w-3" />
                  {booksCompleted} lu{booksCompleted > 1 ? 's' : ''}
                </Badge>
              )}
              {booksStarted > 0 && booksStarted !== booksCompleted && (
                <Badge variant="secondary" className="gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {booksStarted - booksCompleted} en cours
                </Badge>
              )}
              <Badge variant="secondary" className="gap-1.5">
                {ebooks?.length || 0} livres
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Filters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Loading State - Skeleton Cards */}
        {ebooksLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 md:gap-6 lg:grid-cols-5 lg:gap-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

      {/* Empty State */}
      {!ebooksLoading && (!ebooks || ebooks.length === 0) && (
        <EmptyState
          illustration="no-lessons"
          title="Aucun livre trouvé"
          description={
            filters.search || filters.language || filters.category
              ? "Essayez de modifier vos filtres de recherche"
              : "La bibliothèque est vide pour le moment. Revenez bientôt!"
          }
        />
      )}

        {/* Ebooks Grid */}
        {!ebooksLoading && ebooks && ebooks.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 md:gap-6 lg:grid-cols-5 lg:gap-8">
            {ebooks.map((ebook, index) => (
              <div
                key={ebook.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                <EbookCard
                  ebook={ebook}
                  progress={progressMap.get(ebook.id)}
                  disabled={showOverlay}
                />
              </div>
            ))}
          </div>
        )}

        {/* Visitor Overlay */}
        {showOverlay && <VisitorLibraryOverlay />}
      </div>
    </div>
  );
}
