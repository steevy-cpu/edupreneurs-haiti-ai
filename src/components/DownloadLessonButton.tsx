import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { generateLessonPDF } from "@/utils/lessonDownload";
import { toast } from "sonner";

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
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await generateLessonPDF({
        lessonData,
        personalNotes,
        subjectName,
      });
      toast.success("📥 Leçon téléchargée avec succès!");
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
    <Button
      onClick={handleDownload}
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
  );
};
