import { jsPDF } from "jspdf";
import { Document, Paragraph, TextRun, AlignmentType, HeadingLevel, Packer } from "docx";
import { saveAs } from "file-saver";

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

export type DownloadFormat = "pdf" | "docx" | "txt";

const COPYRIGHT_TEXT = "© 2025 Edupreneurs - Tous droits réservés. Ce document est protégé par les lois sur le droit d'auteur.";
const MODIFICATION_WARNING = "AVERTISSEMENT: Toute modification, reproduction ou distribution non autorisée de ce document est strictement interdite.";

// Helper to strip HTML tags but preserve basic structure
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  
  const temp = document.createElement("div");
  temp.innerHTML = html;
  
  // Replace common HTML elements with text equivalents
  temp.querySelectorAll("br").forEach(br => br.replaceWith("\n"));
  temp.querySelectorAll("p").forEach(p => p.appendChild(document.createTextNode("\n\n")));
  temp.querySelectorAll("ul, ol").forEach(list => list.appendChild(document.createTextNode("\n")));
  temp.querySelectorAll("li").forEach(li => li.prepend(document.createTextNode("• ")));
  
  return temp.textContent || "";
};

// Format content for plain text
const formatContent = (html: string | undefined): string => {
  if (!html) return "Contenu non disponible";
  return stripHtmlTags(html);
};

// Generate filename
const generateFilename = (lessonData: LessonData, subjectName: string, extension: string): string => {
  const cleanTitle = lessonData.title.replace(/[^a-z0-9]/gi, "-").substring(0, 50);
  const gradeLevel = lessonData.grade_level || "lesson";
  return `${subjectName}-${cleanTitle}-${gradeLevel}.${extension}`;
};

// Generate Plain Text
export const generatePlainText = async ({
  lessonData,
  personalNotes,
  subjectName,
}: DownloadOptions): Promise<void> => {
  try {
    let content = "";
    
    // Header
    content += "═══════════════════════════════════════════════════════════\n";
    content += `   ${lessonData.title.toUpperCase()}\n`;
    content += `   ${subjectName}${lessonData.grade_level ? ` - ${lessonData.grade_level}` : ""}\n`;
    content += "═══════════════════════════════════════════════════════════\n\n";
    
    if (lessonData.month || lessonData.lesson_number) {
      content += `${lessonData.month ? `Mois: ${lessonData.month}` : ""}${lessonData.lesson_number ? ` | Leçon #${lessonData.lesson_number}` : ""}\n\n`;
    }
    
    // Objective
    if (lessonData.objectif) {
      content += "🎯 OBJECTIF\n";
      content += "───────────────────────────────────────────────────────────\n";
      content += `${formatContent(lessonData.objectif)}\n\n`;
    }
    
    // Introduction
    if (lessonData.introduction) {
      content += "📖 INTRODUCTION\n";
      content += "───────────────────────────────────────────────────────────\n";
      content += `${formatContent(lessonData.introduction)}\n\n`;
    }
    
    // Main Content
    if (lessonData.contenu) {
      content += "📚 CONTENU PRINCIPAL\n";
      content += "───────────────────────────────────────────────────────────\n";
      content += `${formatContent(lessonData.contenu)}\n\n`;
    }
    
    // Examples and Exercises
    if (lessonData.exemples_exercices) {
      content += "✏️ EXEMPLES ET EXERCICES\n";
      content += "───────────────────────────────────────────────────────────\n";
      content += `${formatContent(lessonData.exemples_exercices)}\n\n`;
    }
    
    // Personal Notes
    if (personalNotes && personalNotes.trim()) {
      content += "📝 MES NOTES PERSONNELLES\n";
      content += "───────────────────────────────────────────────────────────\n";
      content += `${personalNotes}\n\n`;
    }
    
    // YouTube Video
    if (lessonData.youtube_url) {
      content += "🎥 VIDÉO YOUTUBE\n";
      content += "───────────────────────────────────────────────────────────\n";
      content += `${lessonData.youtube_url}\n\n`;
    }
    
    // References
    if (lessonData.references && lessonData.references.length > 0) {
      content += "📚 RÉFÉRENCES\n";
      content += "───────────────────────────────────────────────────────────\n";
      lessonData.references.forEach((ref) => {
        content += `• ${ref}\n`;
      });
      content += "\n";
    }
    
    // Footer with copyright
    content += "\n═══════════════════════════════════════════════════════════\n";
    content += `${COPYRIGHT_TEXT}\n`;
    content += `${MODIFICATION_WARNING}\n`;
    content += `Généré le ${new Date().toLocaleDateString("fr-FR")}\n`;
    content += "═══════════════════════════════════════════════════════════\n";
    
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, generateFilename(lessonData, subjectName, "txt"));
  } catch (error) {
    console.error("Error generating plain text:", error);
    throw new Error("Échec de la génération du fichier texte. Veuillez réessayer.");
  }
};

// Generate Word Document
export const generateWordDocument = async ({
  lessonData,
  personalNotes,
  subjectName,
}: DownloadOptions): Promise<void> => {
  try {
    const doc = new Document({
      creator: "Edupreneurs",
      title: lessonData.title,
      description: `${subjectName} - ${lessonData.title}`,
      sections: [
        {
          properties: {},
          children: [
            // Header
            new Paragraph({
              text: lessonData.title.toUpperCase(),
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: `${subjectName}${lessonData.grade_level ? ` - ${lessonData.grade_level}` : ""}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            // Metadata
            ...(lessonData.month || lessonData.lesson_number ? [
              new Paragraph({
                text: `${lessonData.month ? `Mois: ${lessonData.month}` : ""}${lessonData.lesson_number ? ` | Leçon #${lessonData.lesson_number}` : ""}`,
                spacing: { after: 300 },
              }),
            ] : []),
            
            // Objective
            ...(lessonData.objectif ? [
              new Paragraph({
                text: "🎯 Objectif",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              new Paragraph({
                text: formatContent(lessonData.objectif),
                spacing: { after: 300 },
              }),
            ] : []),
            
            // Introduction
            ...(lessonData.introduction ? [
              new Paragraph({
                text: "📖 Introduction",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              new Paragraph({
                text: formatContent(lessonData.introduction),
                spacing: { after: 300 },
              }),
            ] : []),
            
            // Main Content
            ...(lessonData.contenu ? [
              new Paragraph({
                text: "📚 Contenu Principal",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              new Paragraph({
                text: formatContent(lessonData.contenu),
                spacing: { after: 300 },
              }),
            ] : []),
            
            // Examples and Exercises
            ...(lessonData.exemples_exercices ? [
              new Paragraph({
                text: "✏️ Exemples et Exercices",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              new Paragraph({
                text: formatContent(lessonData.exemples_exercices),
                spacing: { after: 300 },
              }),
            ] : []),
            
            // Personal Notes
            ...(personalNotes && personalNotes.trim() ? [
              new Paragraph({
                text: "📝 Mes Notes Personnelles",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              new Paragraph({
                text: personalNotes,
                spacing: { after: 300 },
              }),
            ] : []),
            
            // YouTube Video
            ...(lessonData.youtube_url ? [
              new Paragraph({
                text: "🎥 Vidéo YouTube",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: lessonData.youtube_url,
                    color: "0000FF",
                    underline: {},
                  }),
                ],
                spacing: { after: 300 },
              }),
            ] : []),
            
            // References
            ...(lessonData.references && lessonData.references.length > 0 ? [
              new Paragraph({
                text: "📚 Références",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 },
              }),
              ...lessonData.references.map(
                (ref) =>
                  new Paragraph({
                    text: `• ${ref}`,
                    spacing: { after: 100 },
                  })
              ),
            ] : []),
            
            // Footer with copyright
            new Paragraph({
              text: "",
              spacing: { before: 600 },
            }),
            new Paragraph({
              text: COPYRIGHT_TEXT,
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 100 },
            }),
            new Paragraph({
              text: MODIFICATION_WARNING,
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: `Généré le ${new Date().toLocaleDateString("fr-FR")}`,
              alignment: AlignmentType.CENTER,
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, generateFilename(lessonData, subjectName, "docx"));
  } catch (error) {
    console.error("Error generating Word document:", error);
    throw new Error("Échec de la génération du document Word. Veuillez réessayer.");
  }
};

// Generate PDF (with protection)
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

    // Set document properties for protection
    pdf.setProperties({
      title: lessonData.title,
      subject: subjectName,
      author: "Edupreneurs",
      keywords: "education, lesson, protected",
      creator: "Edupreneurs Platform",
    });

    // Helper to add page break if needed
    const checkPageBreak = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - margin - 20) {
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
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, pageWidth, 40, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    const titleLines = pdf.splitTextToSize(lessonData.title, maxWidth);
    pdf.text(titleLines, margin, 15);
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    const subtitle = `${subjectName}${lessonData.grade_level ? ` - ${lessonData.grade_level}` : ""}`;
    pdf.text(subtitle, margin, 30);
    
    yPosition = 50;

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

    // Copyright footer on all pages
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Page number
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Page ${i} sur ${totalPages}`, pageWidth / 2, pageHeight - 15, { align: "center" });
      
      // Copyright notice
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text(COPYRIGHT_TEXT, pageWidth / 2, pageHeight - 10, { align: "center" });
      pdf.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, pageWidth - margin, pageHeight - 10, { align: "right" });
    }

    // Save with protection (note: jsPDF doesn't support full encryption, but we add metadata)
    pdf.save(generateFilename(lessonData, subjectName, "pdf"));
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Échec de la génération du PDF. Veuillez réessayer.");
  }
};
