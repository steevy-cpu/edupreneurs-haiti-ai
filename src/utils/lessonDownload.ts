import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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

interface DownloadOptions {
  lessonData: LessonData;
  personalNotes?: string;
  subjectName: string;
}

// Helper to strip HTML tags but preserve basic structure
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  
  // Create a temporary div to parse HTML
  const temp = document.createElement("div");
  temp.innerHTML = html;
  
  // Replace common HTML elements with text equivalents
  temp.querySelectorAll("br").forEach(br => br.replaceWith("\n"));
  temp.querySelectorAll("p").forEach(p => p.appendChild(document.createTextNode("\n\n")));
  temp.querySelectorAll("ul, ol").forEach(list => list.appendChild(document.createTextNode("\n")));
  temp.querySelectorAll("li").forEach(li => li.prepend(document.createTextNode("• ")));
  
  return temp.textContent || "";
};

// Helper to extract and format content
const formatContent = (html: string | undefined): string => {
  if (!html) return "Contenu non disponible";
  return stripHtmlTags(html);
};

export const generateLessonPDF = async ({
  lessonData,
  personalNotes,
  subjectName,
}: DownloadOptions): Promise<void> => {
  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper to add page break if needed
    const checkPageBreak = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper to add text with word wrap
    const addText = (text: string, fontSize: number, style: "normal" | "bold" = "normal", color: [number, number, number] = [0, 0, 0]) => {
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", style);
      pdf.setTextColor(color[0], color[1], color[2]);
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      const lineHeight = fontSize * 0.5;
      
      for (const line of lines) {
        checkPageBreak(lineHeight);
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      }
    };

    // Header - Subject and Title
    pdf.setFillColor(59, 130, 246); // Blue background
    pdf.rect(0, 0, pageWidth, 35, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    const titleLines = pdf.splitTextToSize(lessonData.title, maxWidth);
    pdf.text(titleLines, margin, 12);
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    const subtitle = `${subjectName}${lessonData.grade_level ? ` - ${lessonData.grade_level}` : ""}`;
    pdf.text(subtitle, margin, 25);
    
    yPosition = 45;

    // Metadata
    if (lessonData.month || lessonData.lesson_number) {
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(10);
      const metadata = `${lessonData.month ? `Mois: ${lessonData.month}` : ""}${lessonData.lesson_number ? ` | Leçon #${lessonData.lesson_number}` : ""}`;
      pdf.text(metadata, margin, yPosition);
      yPosition += 10;
    }

    // Objective
    if (lessonData.objectif) {
      checkPageBreak(20);
      addText("🎯 Objectif", 14, "bold", [59, 130, 246]);
      yPosition += 5;
      addText(formatContent(lessonData.objectif), 11, "normal");
      yPosition += 8;
    }

    // Introduction
    if (lessonData.introduction) {
      checkPageBreak(20);
      addText("📖 Introduction", 14, "bold", [59, 130, 246]);
      yPosition += 5;
      addText(formatContent(lessonData.introduction), 11, "normal");
      yPosition += 8;
    }

    // Main Content
    if (lessonData.contenu) {
      checkPageBreak(20);
      addText("📚 Contenu Principal", 14, "bold", [59, 130, 246]);
      yPosition += 5;
      addText(formatContent(lessonData.contenu), 11, "normal");
      yPosition += 8;
    }

    // Examples and Exercises
    if (lessonData.exemples_exercices) {
      checkPageBreak(20);
      addText("✏️ Exemples et Exercices", 14, "bold", [59, 130, 246]);
      yPosition += 5;
      addText(formatContent(lessonData.exemples_exercices), 11, "normal");
      yPosition += 8;
    }

    // Personal Notes
    if (personalNotes && personalNotes.trim()) {
      checkPageBreak(20);
      addText("📝 Mes Notes Personnelles", 14, "bold", [59, 130, 246]);
      yPosition += 5;
      addText(personalNotes, 11, "normal");
      yPosition += 8;
    }

    // YouTube Video
    if (lessonData.youtube_url) {
      checkPageBreak(20);
      addText("🎥 Vidéo YouTube", 14, "bold", [59, 130, 246]);
      yPosition += 5;
      pdf.setTextColor(59, 130, 246);
      pdf.textWithLink("Cliquer ici pour voir la vidéo", margin, yPosition, { url: lessonData.youtube_url });
      pdf.setTextColor(0, 0, 0);
      yPosition += 8;
    }

    // References
    if (lessonData.references && lessonData.references.length > 0) {
      checkPageBreak(20);
      addText("📚 Références", 14, "bold", [59, 130, 246]);
      yPosition += 5;
      lessonData.references.forEach((ref) => {
        checkPageBreak(8);
        addText(`• ${ref}`, 10, "normal");
      });
    }

    // Footer on last page
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Page ${i} sur ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      pdf.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, pageWidth - margin, pageHeight - 10, { align: "right" });
    }

    // Generate filename
    const filename = `${subjectName}-${lessonData.title.replace(/[^a-z0-9]/gi, "-").substring(0, 50)}-${lessonData.grade_level || "lesson"}.pdf`;

    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Échec de la génération du PDF. Veuillez réessayer.");
  }
};
