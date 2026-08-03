import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileText, File, FileType } from "lucide-react";
import { generateLessonPDF, generateWordDocument, generatePlainText, preloadDownloadLibs, type DownloadFormat } from "@/utils/lessonDownload";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LessonData {
  title: string;
  objectif?: string;
  introduction?: string;
  contenu?: string;
  exemples_exercices?: string;
  youtube_url?: string;
  references?: string[];
  grade_level?: string;
  month?: string;
  lesson_number?: number;
}

interface DownloadLessonButtonProps {
  lessonData: LessonData;
  personalNotes?: string;
  subjectName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const DownloadLessonButton = ({
  lessonData,
  personalNotes,
  subjectName,
  variant = "outline",
  size = "default",
  className = "",
}: DownloadLessonButtonProps) => {
  // Two-phase state: 'preparing' = fetching the dynamic pdf/docx chunks (slow on 3G),
  // 'generating' = building the document once the libraries are in memory.
  const [phase, setPhase] = useState<"idle" | "preparing" | "generating">("idle");
  const isGenerating = phase !== "idle";

  const handleDownload = async (format: DownloadFormat) => {
    setPhase("preparing");
    try {
      const options = {
        lessonData,
        personalNotes,
        subjectName,
      };

      // Warm the code-split chunk first so failures surface as a toast, not a crash
      await preloadDownloadLibs(format);
      setPhase("generating");

      switch (format) {

        case "pdf":
          await generateLessonPDF(options);
          toast.success("📥 PDF téléchargé avec succès!");
          break;
        case "docx":
          await generateWordDocument(options);
          toast.success("📥 Document Word téléchargé avec succès!");
          break;
        case "txt":
          await generatePlainText(options);
          toast.success("📥 Fichier texte téléchargé avec succès!");
          break;
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Erreur lors du téléchargement. Veuillez réessayer."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={isGenerating}
          variant={variant}
          size={size}
          className={className}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Choisir le format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => handleDownload("pdf")}
          disabled={isGenerating}
          className="cursor-pointer"
        >
          <FileText className="w-4 h-4 mr-2 text-red-500" />
          <div className="flex flex-col">
            <span className="font-medium">PDF</span>
            <span className="text-xs text-muted-foreground">Document portable protégé</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDownload("docx")}
          disabled={isGenerating}
          className="cursor-pointer"
        >
          <File className="w-4 h-4 mr-2 text-blue-500" />
          <div className="flex flex-col">
            <span className="font-medium">Word (.docx)</span>
            <span className="text-xs text-muted-foreground">Document Microsoft Word</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDownload("txt")}
          disabled={isGenerating}
          className="cursor-pointer"
        >
          <FileType className="w-4 h-4 mr-2 text-gray-500" />
          <div className="flex flex-col">
            <span className="font-medium">Texte (.txt)</span>
            <span className="text-xs text-muted-foreground">Fichier texte simple</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          © Edupreneurs - Protégé
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
