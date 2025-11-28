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
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleFullScreen = () => window.open(pdfUrl, '_blank');

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
            <a href={pdfUrl} download target="_blank" rel="noopener noreferrer">
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
                <a href={pdfUrl} download>
                  Télécharger le PDF
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&view=FitH`}
            className="w-full h-full border-0"
            title={examTitle}
            onLoad={() => {
              setIsLoading(false);
              // Check if iframe loaded successfully
              setTimeout(() => {
                const iframe = document.querySelector('iframe[title="' + examTitle + '"]') as HTMLIFrameElement;
                if (iframe && !iframe.contentWindow) {
                  setHasError(true);
                }
              }, 1000);
            }}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            style={{ minHeight: '500px', display: isLoading ? 'none' : 'block' }}
          />
        )}
      </div>
    </Card>
  );
};
