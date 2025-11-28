import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ZoomIn, ZoomOut, Maximize2, ExternalLink } from "lucide-react";

interface ExamPDFViewerProps {
  pdfUrl: string | null;
  examTitle: string;
}

export const ExamPDFViewer = ({ pdfUrl, examTitle }: ExamPDFViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [hasError, setHasError] = useState(false);

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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleFullScreen = () => window.open(pdfUrl, '_blank');
  
  // Get absolute URL for Google Docs viewer
  const absolutePdfUrl = pdfUrl.startsWith('http') 
    ? pdfUrl 
    : `${window.location.origin}${pdfUrl}`;
  
  // Use Google Docs viewer as fallback for better browser compatibility
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(absolutePdfUrl)}&embedded=true`;

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
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium min-w-[3rem] text-center">
            {zoom}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
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
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Ouvrir</span>
            </a>
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 relative overflow-hidden bg-muted/10">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex flex-col gap-4 p-8">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-full w-full" />
          </div>
        )}
        
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Impossible de charger le PDF directement dans votre navigateur.
            </p>
            <Button onClick={handleFullScreen} variant="default">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir le PDF dans un nouvel onglet
            </Button>
          </div>
        ) : (
          <iframe
            src={viewerUrl}
            className="w-full h-full border-0"
            title={examTitle}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            style={{ display: isLoading ? 'none' : 'block' }}
            allow="fullscreen"
          />
        )}
      </div>
    </Card>
  );
};
