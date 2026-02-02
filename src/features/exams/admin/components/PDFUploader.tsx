/**
 * PDFUploader - PDF file upload component with progress
 */
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { FileText, Loader2 } from "lucide-react";

interface PDFUploaderProps {
  file: File | null;
  onChange: (file: File | null) => void;
  isConverting: boolean;
  conversionProgress: number;
  totalPages?: number;
}

export function PDFUploader({ 
  file, 
  onChange, 
  isConverting, 
  conversionProgress,
  totalPages = 0
}: PDFUploaderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      onChange(selectedFile);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Document PDF de l'examen</Label>
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
        <Input
          type="file"
          accept=".pdf"
          onChange={handleChange}
          disabled={isConverting}
          className="hidden"
          id="pdf-upload"
        />
        <Label 
          htmlFor="pdf-upload" 
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          {isConverting ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Conversion en cours... {conversionProgress}%
                {totalPages > 0 && ` (${totalPages} pages)`}
              </span>
              <Progress value={conversionProgress} className="w-full max-w-xs" />
            </>
          ) : file ? (
            <>
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                Cliquer pour changer de fichier
              </span>
            </>
          ) : (
            <>
              <FileText className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Cliquer pour sélectionner un PDF
              </span>
            </>
          )}
        </Label>
      </div>
    </div>
  );
}
