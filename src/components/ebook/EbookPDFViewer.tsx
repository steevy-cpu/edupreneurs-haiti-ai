import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Set worker path - using local bundled worker for Vite compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface EbookPDFViewerProps {
  fileUrl: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

export default function EbookPDFViewer({ 
  fileUrl, 
  currentPage, 
  onPageChange,
  totalPages: initialTotalPages
}: EbookPDFViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.2);
  const [pageRendering, setPageRendering] = useState(false);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF document
  useEffect(() => {
    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
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
    if (!pdfDoc || !canvasRef.current || pageRendering) return;
    
    setPageRendering(true);
    
    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Calculate scale to fit container width
      const containerWidth = containerRef.current?.clientWidth || 800;
      const viewport = page.getViewport({ scale: 1 });
      const calculatedScale = Math.min(
        (containerWidth - 32) / viewport.width, 
        scale
      );
      const scaledViewport = page.getViewport({ scale: calculatedScale });

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      await page.render({
        canvasContext: ctx,
        viewport: scaledViewport,
        canvas: canvas,
      }).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
    } finally {
      setPageRendering(false);
    }
  }, [pdfDoc, scale, pageRendering]);

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Chargement du document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center">
      {/* Zoom Controls (Desktop) */}
      <div className="mb-4 hidden items-center gap-4 rounded-lg border bg-muted/50 p-2 md:flex">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="min-w-[100px] text-center text-sm">
          Page {currentPage} / {totalPages}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="mx-4 h-6 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setScale(Math.max(0.5, scale - 0.2))}
          disabled={scale <= 0.5}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <span className="min-w-[50px] text-center text-sm">{Math.round(scale * 100)}%</span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setScale(Math.min(3, scale + 0.2))}
          disabled={scale >= 3}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* PDF Canvas */}
      <div className="relative w-full overflow-auto rounded-lg border bg-white shadow-lg dark:bg-gray-900">
        {pageRendering && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <canvas 
          ref={canvasRef} 
          className="mx-auto block"
          style={{ maxWidth: '100%' }}
        />
      </div>

      {/* Mobile Zoom Slider */}
      <div className="mt-4 flex w-full items-center gap-4 md:hidden">
        <ZoomOut className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[scale * 100]}
          onValueChange={([value]) => setScale(value / 100)}
          min={50}
          max={200}
          step={10}
          className="flex-1"
        />
        <ZoomIn className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}
