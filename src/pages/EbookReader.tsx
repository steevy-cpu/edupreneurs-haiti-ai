import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Loader2, ChevronLeft, ChevronRight, Maximize2, Music } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/lecture')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <h1 className="line-clamp-1 font-semibold">{ebook.title}</h1>
              {ebook.author && (
                <p className="text-sm text-muted-foreground">{ebook.author}</p>
              )}
            </div>
          </div>

          {/* Page Progress */}
          <div className="flex items-center gap-4">
            <div className="hidden text-sm text-muted-foreground sm:block">
              {progressPercent}% • Page {currentPage}/{totalPages}
            </div>
            
            {/* Music hint */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex"
              onClick={() => {/* Could trigger music selector */}}
            >
              <Music className="mr-2 h-4 w-4" />
              Musique
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {/* PDF Viewer */}
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            <EbookPDFViewer
              fileUrl={ebook.file_url}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
            />
          </Suspense>

          {/* Page Navigation (Mobile) */}
          <div className="fixed bottom-20 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-background/95 p-2 shadow-lg backdrop-blur md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="min-w-[80px] text-center text-sm">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Comments Section */}
          <div className="mt-8">
            <Collapsible open={commentsOpen} onOpenChange={setCommentsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Commentaires
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${commentsOpen ? 'rotate-90' : ''}`} />
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
