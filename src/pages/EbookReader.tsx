import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEbook } from "@/hooks/useEbooks";
import { useReadingProgress, useAutoSaveProgress } from "@/hooks/useReadingProgress";
import { EbookComments } from "@/components/ebook/EbookComments";
import { useVisitor } from "@/contexts/VisitorContext";
import { VisitorLibraryOverlay } from "@/components/ebook/VisitorLibraryOverlay";
import { supabase } from "@/integrations/supabase/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MessageSquare } from "lucide-react";
import { EbookJudeAssistant } from "@/components/ebook/EbookJudeAssistant";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";
import { PageNumberInput } from "@/components/ebook/PageNumberInput";

// Lazy load PDF viewer to reduce initial bundle
import { lazy, Suspense } from "react";
const EbookPDFViewer = lazy(() => import("@/components/ebook/EbookPDFViewer"));

export default function EbookReader() {
  const { ebookId } = useParams<{ ebookId: string }>();
  const navigate = useNavigate();
  const { isVisitor } = useVisitor();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsOpen, setCommentsOpen] = useState(false);
  
  // Network-aware optimizations
  const { isSlowConnection, shouldShowAnimations } = useNetworkAwareLoading();

  const { data: ebook, isLoading: ebookLoading, error } = useEbook(ebookId);
  const { data: progress, isLoading: progressLoading } = useReadingProgress(ebookId);
  const { saveProgress, saveProgressNow } = useAutoSaveProgress(ebookId, ebook?.page_count || null);

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  // Restore reading position from progress
  useEffect(() => {
    if (progress && !progressLoading) {
      setCurrentPage(progress.current_page);
    }
  }, [progress, progressLoading]);

  // Save progress when page changes
  useEffect(() => {
    if (isAuthenticated && currentPage > 0) {
      saveProgress(currentPage);
    }
  }, [currentPage, isAuthenticated, saveProgress]);

  // Save progress when leaving page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated && currentPage > 0) {
        saveProgressNow(currentPage);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Save on component unmount too
    };
  }, [currentPage, isAuthenticated, saveProgressNow]);

  const showOverlay = isVisitor && !isAuthenticated;

  if (ebookLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-muted/20">
        <Loader2 className={`h-8 w-8 text-primary ${shouldShowAnimations ? 'animate-spin' : ''}`} />
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <BookOpen className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Livre non trouvé</h1>
        <p className="mt-2 text-muted-foreground">Ce livre n'existe pas ou a été supprimé.</p>
        <Button asChild className="mt-6">
          <Link to="/lecture">Retour à la bibliothèque</Link>
        </Button>
      </div>
    );
  }

  const totalPages = ebook.page_count || 1;
  const progressPercent = Math.round((currentPage / totalPages) * 100);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header - Calm reading environment */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-12 items-center justify-between px-3 sm:h-14 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 sm:h-9 sm:w-9" 
              onClick={() => navigate('/lecture')}
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="hidden xs:block sm:block">
              <h1 className="line-clamp-1 text-sm font-semibold sm:text-base">{ebook.title}</h1>
              {ebook.author && (
                <p className="text-xs text-muted-foreground sm:text-sm">{ebook.author}</p>
              )}
            </div>
          </div>

          {/* Mobile: Just show page count */}
          <div className="text-xs text-muted-foreground xs:hidden">
            {currentPage}/{totalPages}
          </div>

          {/* Tablet/Desktop: Full progress info */}
          <div className="hidden items-center gap-2 text-xs text-muted-foreground xs:flex sm:gap-4 sm:text-sm">
            {progressPercent}% • Page {currentPage}/{totalPages}
          </div>
        </div>

        {/* Softer Progress Bar */}
        <div className="h-0.5 w-full bg-muted/50">
          <div 
            className={`h-full bg-primary/70 ${shouldShowAnimations ? 'transition-all duration-500 ease-out' : ''}`}
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
          {/* PDF Viewer */}
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className={`h-8 w-8 text-primary ${shouldShowAnimations ? 'animate-spin' : ''}`} />
            </div>
          }>
            <EbookPDFViewer
              fileUrl={ebook.file_url}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
              isSlowConnection={isSlowConnection}
            />
          </Suspense>

          {/* Mobile Page Navigation - Inline, not fixed */}
          <div className="mt-4 flex items-center justify-center gap-2 rounded-full border border-border/50 bg-muted/30 p-2 backdrop-blur-sm md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <PageNumberInput
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Comments Section - No longer blocked by fixed nav */}
          <div className="mt-6 pb-20 sm:pb-24">
            <Collapsible open={commentsOpen} onOpenChange={setCommentsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between border-border/50 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Commentaires
                  </div>
                  <ChevronRight className={`h-4 w-4 ${shouldShowAnimations ? 'transition-transform' : ''} ${commentsOpen ? 'rotate-90' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <EbookComments ebookId={ebookId!} />
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </main>

      {/* Jude Reading Assistant */}
      {isAuthenticated && ebook && (
        <EbookJudeAssistant
          bookTitle={ebook.title}
          bookAuthor={ebook.author || undefined}
          currentPage={currentPage}
        />
      )}

      {/* Visitor Overlay */}
      {showOverlay && <VisitorLibraryOverlay />}
    </div>
  );
}
