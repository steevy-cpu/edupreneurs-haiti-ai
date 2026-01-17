import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { PageNumberInput } from "./PageNumberInput";
import pdfWorkerSrc from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

interface EbookPDFViewerProps {
  fileUrl: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  isSlowConnection?: boolean;
}

type PDFDocumentProxy = Awaited<ReturnType<typeof import("pdfjs-dist")["getDocument"]>>["promise"] extends Promise<infer T> ? T : never;
type PDFPageProxy = Awaited<ReturnType<PDFDocumentProxy["getPage"]>>;

type LoadingPhase = 'downloading' | 'initializing' | 'rendering' | 'ready';

// Cache for rendered pages - stores ImageData for instant redraw
interface PageCache {
  imageData: ImageData;
  width: number;
  height: number;
  styleWidth: number;
  styleHeight: number;
}

export default function EbookPDFViewer({ 
  fileUrl, 
  currentPage, 
  onPageChange,
  totalPages: initialTotalPages,
  isSlowConnection = false
}: EbookPDFViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('downloading');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(0.5);
  const [pageRendering, setPageRendering] = useState(false);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(0);
  const pdfjsRef = useRef<typeof import("pdfjs-dist") | null>(null);
  
  // Page cache for instant navigation
  const pageCacheRef = useRef<Map<number, PageCache>>(new Map());
  const currentScaleRef = useRef(scale);
  const preloadingRef = useRef<Set<number>>(new Set());

  // Clear cache when scale changes
  useEffect(() => {
    if (currentScaleRef.current !== scale) {
      pageCacheRef.current.clear();
      currentScaleRef.current = scale;
    }
  }, [scale]);

  // Load PDF.js library and document with progress tracking
  useEffect(() => {
    const loadPdf = async () => {
      setLoadingPhase('downloading');
      setDownloadProgress(0);
      setError(null);
      
      try {
        // Dynamic import for better compatibility
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
        pdfjsRef.current = pdfjs;

        // Fetch PDF with progress tracking
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error('Failed to fetch PDF');
        
        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        
        if (total && response.body) {
          // Stream with progress
          const reader = response.body.getReader();
          const chunks: Uint8Array[] = [];
          let received = 0;
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            chunks.push(value);
            received += value.length;
            setDownloadProgress(Math.round((received / total) * 100));
          }
          
          // Combine chunks into single array
          const pdfData = new Uint8Array(received);
          let position = 0;
          for (const chunk of chunks) {
            pdfData.set(chunk, position);
            position += chunk.length;
          }
          
          setLoadingPhase('initializing');
          const loadingTask = pdfjs.getDocument({ data: pdfData });
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
        } else {
          // Fallback: load directly without progress
          setDownloadProgress(50);
          setLoadingPhase('initializing');
          const loadingTask = pdfjs.getDocument(fileUrl);
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
        }
        
        setLoadingPhase('rendering');
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Impossible de charger le document. Veuillez réessayer.');
      }
    };

    if (fileUrl) {
      loadPdf();
    }
    
    // Cleanup cache on unmount
    return () => {
      pageCacheRef.current.clear();
    };
  }, [fileUrl]);

  // Render page to cache (background rendering)
  const renderPageToCache = useCallback(async (pageNum: number): Promise<PageCache | null> => {
    if (!pdfDoc || preloadingRef.current.has(pageNum)) return null;
    
    // Check if already cached
    const cached = pageCacheRef.current.get(pageNum);
    if (cached) return cached;
    
    preloadingRef.current.add(pageNum);
    
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const pixelRatio = isSlowConnection ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      
      // Create offscreen canvas for rendering
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = viewport.width * pixelRatio;
      offscreenCanvas.height = viewport.height * pixelRatio;
      
      const ctx = offscreenCanvas.getContext('2d');
      if (!ctx) return null;
      
      ctx.scale(pixelRatio, pixelRatio);
      
      await page.render({
        canvasContext: ctx,
        viewport: viewport,
        canvas: offscreenCanvas,
      }).promise;
      
      // Store rendered result
      const imageData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
      const cacheEntry: PageCache = {
        imageData,
        width: offscreenCanvas.width,
        height: offscreenCanvas.height,
        styleWidth: viewport.width,
        styleHeight: viewport.height,
      };
      
      pageCacheRef.current.set(pageNum, cacheEntry);
      return cacheEntry;
    } catch (err) {
      console.error(`Error pre-rendering page ${pageNum}:`, err);
      return null;
    } finally {
      preloadingRef.current.delete(pageNum);
    }
  }, [pdfDoc, scale, isSlowConnection]);

  // Render current page (with cache support)
  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;
    
    const currentRenderId = ++renderIdRef.current;
    
    // Check cache first - instant render
    const cached = pageCacheRef.current.get(pageNum);
    if (cached) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = cached.width;
      canvas.height = cached.height;
      canvas.style.width = `${cached.styleWidth}px`;
      canvas.style.height = `${cached.styleHeight}px`;
      
      ctx.putImageData(cached.imageData, 0, 0);
      setLoadingPhase('ready');
      return;
    }
    
    // Not cached - render normally
    setPageRendering(true);
    
    try {
      const page = await pdfDoc.getPage(pageNum);
      
      if (currentRenderId !== renderIdRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      const viewport = page.getViewport({ scale });
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
      
      // Cache the rendered page
      if (currentRenderId === renderIdRef.current) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        pageCacheRef.current.set(pageNum, {
          imageData,
          width: canvas.width,
          height: canvas.height,
          styleWidth: viewport.width,
          styleHeight: viewport.height,
        });
      }
      
      setLoadingPhase('ready');
    } catch (err) {
      if (currentRenderId === renderIdRef.current) {
        console.error('Error rendering page:', err);
      }
    } finally {
      if (currentRenderId === renderIdRef.current) {
        setPageRendering(false);
      }
    }
  }, [pdfDoc, scale, isSlowConnection]);

  // Pre-load adjacent pages in background
  useEffect(() => {
    if (!pdfDoc || loadingPhase !== 'ready') return;
    
    // Use requestIdleCallback for background work
    const preloadAdjacent = () => {
      const pagesToPreload = [currentPage - 1, currentPage + 1, currentPage + 2]
        .filter(p => p >= 1 && p <= totalPages && !pageCacheRef.current.has(p));
      
      pagesToPreload.forEach(pageNum => {
        renderPageToCache(pageNum);
      });
    };
    
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(preloadAdjacent, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(preloadAdjacent, 100);
      return () => clearTimeout(id);
    }
  }, [pdfDoc, currentPage, totalPages, loadingPhase, renderPageToCache]);

  // Re-render when page or scale changes
  useEffect(() => {
    if (pdfDoc && currentPage >= 1 && currentPage <= totalPages) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, renderPage, totalPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTyping = activeElement instanceof HTMLInputElement || 
                       activeElement instanceof HTMLTextAreaElement ||
                       activeElement?.getAttribute('contenteditable') === 'true';
      
      if (isTyping) return;

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

  // Loading states
  if (loadingPhase === 'downloading' || loadingPhase === 'initializing') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className={`h-8 w-8 text-primary ${!isSlowConnection ? 'animate-spin' : ''}`} />
        <p className="mt-4 text-sm text-muted-foreground">
          {loadingPhase === 'downloading' ? 'Téléchargement du document...' : 'Préparation des pages...'}
        </p>
        {loadingPhase === 'downloading' && downloadProgress > 0 && (
          <div className="mt-3 w-48">
            <Progress value={downloadProgress} className="h-2" />
            <p className="mt-1 text-center text-xs text-muted-foreground">{downloadProgress}%</p>
          </div>
        )}
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
      {/* Desktop/Tablet Controls */}
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
          <PageNumberInput
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
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

      {/* PDF Canvas */}
      <div className="relative w-full rounded-xl border border-border/40 bg-white shadow-sm dark:bg-gray-900/95">
        {/* Loading overlay - only show when actively rendering (not from cache) */}
        {pageRendering && !isSlowConnection && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/30 backdrop-blur-[1px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary/70" />
          </div>
        )}
        
        {/* Scrollable viewport */}
        <div 
          className="h-[75vh] overflow-auto sm:h-[78vh] md:h-[82vh]"
          style={{ maxHeight: 'calc(100vh - 180px)' }}
        >
          <div className="inline-block min-w-full p-2 sm:p-4">
            <div className="flex justify-center">
              <canvas 
                ref={canvasRef} 
                className="shadow-md transition-shadow will-change-transform hover:shadow-lg" 
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
