import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Maximize2, ExternalLink, Wifi, WifiOff } from "lucide-react";
import { isSlowConnection } from "@/utils/performanceOptimization";
import pdfWorkerSrc from "pdfjs-dist/legacy/build/pdf.worker.min?url";

interface ExamPDFViewerProps {
  pdfUrl: string | null;
  examTitle: string;
}

interface PageState {
  rendered: boolean;
  canvas: HTMLCanvasElement | null;
}

export const ExamPDFViewer = ({ pdfUrl, examTitle }: ExamPDFViewerProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedSize, setDownloadedSize] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState<"download" | "render">("download");
  const [pagesLoaded, setPagesLoaded] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isSlowNet, setIsSlowNet] = useState(false);

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const pdfDocRef = useRef<any>(null);
  const pageStatesRef = useRef<Map<number, PageState>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fullPdfUrl = pdfUrl?.startsWith("http")
    ? pdfUrl
    : `${window.location.origin}${pdfUrl}`;

  // Get adaptive scale based on connection speed
  const getAdaptiveScale = useCallback(() => {
    const slow = isSlowConnection();
    setIsSlowNet(slow);
    return slow ? 0.8 : 1.2;
  }, []);

  // Render a single page
  const renderPage = useCallback(async (pageNumber: number, container: HTMLDivElement, scale: number) => {
    if (!pdfDocRef.current) return;
    
    const pageState = pageStatesRef.current.get(pageNumber);
    if (pageState?.rendered) return;

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.width = "100%";
      canvas.style.margin = "0 auto 1.5rem auto";
      canvas.style.display = "block";
      canvas.dataset.page = pageNumber.toString();

      // Find placeholder and replace it
      const placeholder = container.querySelector(`[data-placeholder="${pageNumber}"]`);
      if (placeholder) {
        placeholder.replaceWith(canvas);
      } else {
        container.appendChild(canvas);
      }

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      pageStatesRef.current.set(pageNumber, { rendered: true, canvas });
      setPagesLoaded(prev => prev + 1);
    } catch (error) {
      console.error(`Error rendering page ${pageNumber}:`, error);
    }
  }, []);

  // Create placeholder for lazy loading
  const createPlaceholder = (pageNumber: number, height: number) => {
    const placeholder = document.createElement("div");
    placeholder.dataset.placeholder = pageNumber.toString();
    placeholder.className = "bg-muted/30 rounded-lg flex items-center justify-center";
    placeholder.style.width = "100%";
    placeholder.style.height = `${height}px`;
    placeholder.style.margin = "0 auto 1.5rem auto";
    placeholder.innerHTML = `
      <div class="text-center text-muted-foreground">
        <div class="animate-pulse">Page ${pageNumber}</div>
      </div>
    `;
    return placeholder;
  };

  // Format bytes for display
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  useEffect(() => {
    if (!viewerRef.current || !fullPdfUrl) return;

    let isCancelled = false;
    setIsLoading(true);
    setHasError(false);
    setDownloadProgress(0);
    setPagesLoaded(0);
    setLoadingPhase("download");
    pageStatesRef.current.clear();

    const loadPdf = async () => {
      try {
        const scale = getAdaptiveScale();

        // Phase 1: Download with progress tracking
        setLoadingPhase("download");
        const response = await fetch(fullPdfUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const contentLength = response.headers.get("content-length");
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        setTotalSize(total);

        let loaded = 0;
        const chunks: Uint8Array[] = [];

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Cannot read response body");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          chunks.push(value);
          loaded += value.length;
          setDownloadedSize(loaded);
          
          if (total > 0) {
            setDownloadProgress(Math.round((loaded / total) * 100));
          }
        }

        if (isCancelled) return;

        // Combine chunks into single array
        const allChunks = new Uint8Array(loaded);
        let position = 0;
        for (const chunk of chunks) {
          allChunks.set(chunk, position);
          position += chunk.length;
        }

        // Phase 2: Render PDF
        setLoadingPhase("render");
        
        const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist/legacy/build/pdf.mjs");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const workerOptions = GlobalWorkerOptions as any;
        if (!workerOptions.workerSrc) {
          workerOptions.workerSrc = pdfWorkerSrc;
        }

        if (!viewerRef.current || isCancelled) return;

        viewerRef.current.innerHTML = "";

        const pdf = await getDocument({ data: allChunks }).promise;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);

        // Get first page to calculate placeholder heights
        const firstPage = await pdf.getPage(1);
        const viewport = firstPage.getViewport({ scale });
        const pageHeight = viewport.height;

        // Render first page immediately for instant feedback
        await renderPage(1, viewerRef.current, scale);

        // Create placeholders for remaining pages
        for (let i = 2; i <= pdf.numPages; i++) {
          const placeholder = createPlaceholder(i, pageHeight * 0.6);
          viewerRef.current.appendChild(placeholder);
          pageStatesRef.current.set(i, { rendered: false, canvas: null });
        }

        // Set up IntersectionObserver for lazy loading
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const placeholder = entry.target as HTMLElement;
                const pageNum = parseInt(placeholder.dataset.placeholder || "0", 10);
                if (pageNum > 0 && viewerRef.current) {
                  renderPage(pageNum, viewerRef.current, scale);
                  observerRef.current?.unobserve(entry.target);
                }
              }
            });
          },
          { rootMargin: "200px" } // Start loading 200px before visible
        );

        // Observe all placeholders
        const placeholders = viewerRef.current.querySelectorAll("[data-placeholder]");
        placeholders.forEach((p) => observerRef.current?.observe(p));

        if (!isCancelled) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("PDF render error:", error);
        if (!isCancelled) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isCancelled = true;
      observerRef.current?.disconnect();
      pdfDocRef.current = null;
    };
  }, [fullPdfUrl, getAdaptiveScale, renderPage]);

  if (!pdfUrl) {
    return (
      <Card className="p-8 text-center h-full flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">
          Le document PDF n'est pas encore disponible pour cet examen.
        </p>
        <p className="text-sm text-muted-foreground">
          Contactez votre enseignant pour obtenir le document.
        </p>
      </Card>
    );
  }

  const handleFullScreen = () => window.open(fullPdfUrl, "_blank");

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* PDF Controls */}
      <div className="flex items-center justify-between gap-2 p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium truncate">{examTitle}</span>
          {isSlowNet && (
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <WifiOff className="h-3 w-3" />
              <span className="hidden sm:inline">Mode économie</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isLoading && totalPages > 0 && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {pagesLoaded}/{totalPages} pages
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullScreen}
            className="h-8 w-8 p-0"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 px-3"
          >
            <a href={fullPdfUrl} download target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Télécharger</span>
            </a>
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative overflow-hidden bg-muted/10">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center space-y-4 w-full max-w-xs">
              {loadingPhase === "download" ? (
                <>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    {isSlowNet ? (
                      <WifiOff className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Wifi className="h-4 w-4 text-primary" />
                    )}
                    <span>Téléchargement du PDF...</span>
                  </div>
                  <Progress value={downloadProgress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{downloadProgress}%</span>
                    {totalSize > 0 && (
                      <span>{formatBytes(downloadedSize)} / {formatBytes(totalSize)}</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Skeleton className="h-8 w-32 mx-auto" />
                  <p className="text-sm text-muted-foreground">Préparation des pages...</p>
                </>
              )}
            </div>
          </div>
        )}

        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4">
            <p className="text-muted-foreground mb-2">
              Votre navigateur ne peut pas afficher le PDF directement.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleFullScreen} variant="default" size="lg">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir dans un nouvel onglet
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={fullPdfUrl} download>
                  Télécharger le PDF
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div
            ref={viewerRef}
            className="w-full h-full overflow-auto px-4 py-6"
            style={{ minHeight: "500px" }}
          />
        )}
      </div>
    </Card>
  );
};
