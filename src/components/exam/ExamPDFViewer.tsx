import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ZoomIn, ZoomOut, Maximize2, ExternalLink } from "lucide-react";

interface ExamPDFViewerProps {
  pdfUrl: string | null;
  examTitle: string;
}

export const ExamPDFViewer = ({ pdfUrl, examTitle }: ExamPDFViewerProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const viewerRef = useRef<HTMLDivElement | null>(null);

  // Construct the full PDF URL - handle both Storage URLs and relative paths
  const fullPdfUrl = pdfUrl?.startsWith("http")
    ? pdfUrl
    : `${window.location.origin}${pdfUrl}`;

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

  useEffect(() => {
    if (!viewerRef.current || !fullPdfUrl) return;

    let isCancelled = false;
    setIsLoading(true);
    setHasError(false);

    const loadPdf = async () => {
      try {
        const [{ getDocument, GlobalWorkerOptions }, response] = await Promise.all([
          import("pdfjs-dist/legacy/build/pdf.mjs"),
          fetch(fullPdfUrl),
        ]);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.arrayBuffer();

        // Configure PDF.js worker (using CDN worker to avoid bundler config)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const workerOptions = (GlobalWorkerOptions as any);
        if (!workerOptions.workerSrc) {
          workerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js";
        }

        if (!viewerRef.current || isCancelled) return;

        // Clear previous render
        viewerRef.current.innerHTML = "";

        const pdf = await getDocument({ data }).promise;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.2 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) continue;

          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.style.width = "100%";
          canvas.style.margin = "0 auto 1.5rem auto";
          canvas.style.display = "block";

          viewerRef.current.appendChild(canvas);

          await page.render({
            canvasContext: context,
            viewport,
          }).promise;
        }

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
    };
  }, [fullPdfUrl]);

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* PDF Controls */}
      <div className="flex items-center justify-between gap-2 p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium truncate">{examTitle}</span>
        </div>
        <div className="flex items-center gap-2">
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Skeleton className="h-8 w-32 mx-auto" />
              <p className="text-sm text-muted-foreground">Chargement du PDF...</p>
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
