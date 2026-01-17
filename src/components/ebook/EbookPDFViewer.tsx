import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import pdfWorkerSrc from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

interface EbookPDFViewerProps {
  fileUrl: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  isSlowConnection?: boolean;
}

type PDFDocumentProxy = Awaited<ReturnType<typeof import("pdfjs-dist")["getDocument"]>>["promise"] extends Promise<infer T> ? T : never;

export default function EbookPDFViewer({ 
  fileUrl, 
  currentPage, 
  onPageChange,
  totalPages: initialTotalPages,
  isSlowConnection = false
}: EbookPDFViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Lower initial scale on slow connections for faster rendering
  const [scale, setScale] = useState(0.7);
  const [pageRendering, setPageRendering] = useState(false);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(0);
  const pdfjsRef = useRef<typeof import("pdfjs-dist") | null>(null);

  // Load PDF.js library and document
  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Dynamic import for better compatibility
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
        pdfjsRef.current = pdfjs;

        const loadingTask = pdfjs.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Impossible de charger le document. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    if (fileUrl) {
      loadPdf();
    }
  }, [fileUrl]);

  // Render current page
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;
    
    // Increment render ID to cancel stale renders
    const currentRenderId = ++renderIdRef.current;
    setPageRendering(true);
    
    try {
      const page = await pdfDoc.getPage(pageNum);
      
      // Check if this render is still valid
      if (currentRenderId !== renderIdRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Use the scale directly for proper zoom functionality
      const viewport = page.getViewport({ scale });
      
      // Reduce render quality on slow networks for faster loading
      const pixelRatio = isSlowConnection ? 1 : Math.min(window.devicePixelRatio || 1, 2);

      canvas.height = viewport.height * pixelRatio;
      canvas.width = viewport.width * pixelRatio;
      canvas.style.height = `${viewport.height}px`;
      canvas.style.width = `${viewport.width}px`;

      ctx.scale(pixelRatio, pixelRatio);

      await page.render({
        canvasContext: ctx,
        viewport: viewport,
        canvas: canvas,
      }).promise;
    } catch (err) {
      // Only log if this was the current render attempt
      if (currentRenderId === renderIdRef.current) {
        console.error('Error rendering page:', err);
      }
    } finally {
      if (currentRenderId === renderIdRef.current) {
        setPageRendering(false);
      }
    }
  }, [pdfDoc, scale, isSlowConnection]);

  // Re-render when page or scale changes
  useEffect(() => {
    if (pdfDoc && currentPage >= 1 && currentPage <= totalPages) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, renderPage, totalPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        onPageChange(Math.max(1, currentPage - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        onPageChange(Math.min(totalPages, currentPage + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, onPageChange]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className={`h-8 w-8 text-primary ${!isSlowConnection ? 'animate-spin' : ''}`} />
        <p className="mt-4 text-sm text-muted-foreground">Chargement du document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 py-12 text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-3 sm:gap-4">
      {/* Desktop/Tablet Controls - Compact and calm styling */}
      <div className="mb-2 hidden w-full items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 p-2 backdrop-blur-sm sm:gap-4 md:flex">
        {/* Page Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[80px] text-center text-sm text-muted-foreground sm:min-w-[100px]">
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setScale(Math.max(0.5, scale - 0.2))}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[50px] text-center text-sm text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setScale(Math.min(3, scale + 0.2))}
            disabled={scale >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Canvas - Fixed viewport with scroll */}
      <div className="relative w-full rounded-xl border border-border/40 bg-white shadow-sm dark:bg-gray-900/95">
        {/* Loading overlay */}
        {pageRendering && !isSlowConnection && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/30 backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary/70" />
          </div>
        )}
        
        {/* Scrollable viewport - taller fixed height */}
        <div 
          className="h-[75vh] overflow-auto sm:h-[78vh] md:h-[82vh]"
          style={{ maxHeight: 'calc(100vh - 180px)' }}
        >
          {/* Canvas wrapper - centers content and allows expansion */}
          <div className="inline-block min-w-full p-2 sm:p-4">
            <div className="flex justify-center">
              <canvas 
                ref={canvasRef} 
                className="shadow-md transition-shadow hover:shadow-lg" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Zoom Slider */}
      <div className="flex w-full items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-3 md:hidden">
        <ZoomOut className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[scale]}
          min={0.5}
          max={2.5}
          step={0.1}
          onValueChange={(value) => setScale(value[0])}
          className="flex-1"
        />
        <ZoomIn className="h-4 w-4 text-muted-foreground" />
        <span className="min-w-[45px] text-right text-sm text-muted-foreground">
          {Math.round(scale * 100)}%
        </span>
      </div>
    </div>
  );
}
