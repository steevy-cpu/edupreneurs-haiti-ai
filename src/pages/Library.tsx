import { useState, useEffect } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { useEbooks, type EbookFilters } from "@/hooks/useEbooks";
import { useAllReadingProgress } from "@/hooks/useReadingProgress";
import { EbookCard } from "@/components/ebook/EbookCard";
import { EbookFilters as Filters } from "@/components/ebook/EbookFilters";
import { VisitorLibraryOverlay } from "@/components/ebook/VisitorLibraryOverlay";
import { useVisitor } from "@/contexts/VisitorContext";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/shared/EmptyState";

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

  return (
    <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground md:text-3xl">
          <BookOpen className="h-7 w-7 text-primary" />
          Bibliothèque
        </h1>
        <p className="mt-1 text-muted-foreground">
          Explorez notre collection de livres en français et anglais
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Filters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Loading State */}
      {ebooksLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {ebooks.map((ebook) => (
            <EbookCard
              key={ebook.id}
              ebook={ebook}
              progress={progressMap.get(ebook.id)}
              disabled={showOverlay}
            />
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {!ebooksLoading && ebooks && ebooks.length > 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {ebooks.length} livre{ebooks.length > 1 ? 's' : ''} disponible{ebooks.length > 1 ? 's' : ''}
        </p>
      )}

      {/* Visitor Overlay */}
      {showOverlay && <VisitorLibraryOverlay />}
    </div>
  );
}
