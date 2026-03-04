/**
 * PDFUploader - PDF file upload with click, drag-and-drop, and paste support
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { FileText, Loader2, AlertTriangle } from "lucide-react";
import { validatePdfFile } from "../utils/pdfUtils";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type ProcessingStep =
  | "idle"
  | "uploading"
  | "converting"
  | "analyzing"
  | "saving";

const STEP_LABELS: Record<ProcessingStep, string> = {
  idle: "",
  uploading: "Étape 1/4 : Téléversement du PDF…",
  converting: "Étape 2/4 : Conversion des pages…",
  analyzing: "Étape 3/4 : Analyse IA en cours…",
  saving: "Étape 4/4 : Sauvegarde…",
};

interface PDFUploaderProps {
  file: File | null;
  onChange: (file: File | null) => void;
  isConverting: boolean;
  conversionProgress: number;
  totalPages?: number;
  processingStep?: ProcessingStep;
  uploadProgress?: number;
}

export function PDFUploader({
  file,
  onChange,
  isConverting,
  conversionProgress,
  totalPages = 0,
  processingStep = "idle",
  uploadProgress = 0,
}: PDFUploaderProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  /** Shared validation + callback — single path for click, drop, and paste */
  const handleFile = (file: File) => {
    setValidationError(null);
    if (file.type !== "application/pdf") {
      setValidationError("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    const error = validatePdfFile(file);
    if (error) {
      setValidationError(error.message);
      return;
    }
    onChange(file);
  };

  /** Native file input change — delegates to handleFile */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  /** Drag-and-drop: extract first file from dataTransfer */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  /** Clipboard paste — only accepts application/pdf items */
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type === "application/pdf") {
        const pastedFile = item.getAsFile();
        if (pastedFile) handleFile(pastedFile);
        break;
      }
    }
  };

  const isProcessing = processingStep !== "idle";
  const stepLabel = STEP_LABELS[processingStep];

  // Calculate overall progress across steps
  const overallProgress =
    processingStep === "uploading"
      ? uploadProgress * 0.15
      : processingStep === "converting"
        ? 15 + conversionProgress * 0.35
        : processingStep === "analyzing"
          ? 50 + 40
          : processingStep === "saving"
            ? 95
            : 0;

  return (
    <div className="space-y-2">
      <Label>Document PDF de l'examen</Label>
      {/* Drop zone with drag, paste, and click support */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onPaste={handlePaste}
        tabIndex={0}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors outline-none",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
      >
        <Input
          type="file"
          accept=".pdf"
          onChange={handleChange}
          disabled={isConverting || isProcessing}
          className="hidden"
          id="pdf-upload"
        />
        <Label
          htmlFor="pdf-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm font-medium text-primary">
                {stepLabel}
              </span>
              {processingStep === "converting" && totalPages > 0 && (
                <span className="text-xs text-muted-foreground">
                  {conversionProgress}% ({totalPages} pages)
                </span>
              )}
              <Progress
                value={overallProgress}
                className="w-full max-w-xs"
              />
            </>
          ) : file ? (
            <>
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(1)} MB — Cliquer pour
                changer
              </span>
            </>
          ) : (
            <>
              <FileText className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Glisse le PDF ici, colle-le (Ctrl+V), ou{" "}
                <span className="text-primary underline cursor-pointer">
                  clique pour choisir
                </span>{" "}
                (max 25 MB, 20 pages)
              </span>
            </>
          )}
        </Label>
      </div>
      {validationError && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
