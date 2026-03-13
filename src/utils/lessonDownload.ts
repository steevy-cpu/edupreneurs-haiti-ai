/**
 * @file lessonDownload.ts
 * @description Generates downloadable lesson documents in PDF, DOCX, and TXT formats with branding and copyright.
 * @module utils
 *
 * @example
 * await generatePlainText({ lessonData, personalNotes, subjectName: 'Mathématiques' });
 */

import { jsPDF } from "jspdf";
import { Document, Paragraph, TextRun, AlignmentType, HeadingLevel, Packer, ImageRun } from "docx";
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

// Helper to decode HTML entities properly
const decodeHtmlEntities = (text: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

// Helper to clean content for text format - removes image references and unnecessary elements
const cleanContentForText = (html: string): string => {
  if (!html) return "";
  
  // First decode any HTML entities
  let decodedHtml = decodeHtmlEntities(html);
  
  const temp = document.createElement("div");
  temp.innerHTML = decodedHtml;
  
  // Remove script, style, and img elements
  temp.querySelectorAll("script, style, img").forEach(el => el.remove());
  
  // Remove any paragraphs or divs that contain only image references or empty content
  temp.querySelectorAll("p, div").forEach(el => {
    const text = el.textContent?.trim() || "";
    // Remove elements that reference illustrations or images
    if (
      text.startsWith("Cette illustration") ||
      text.includes("illustration montrera") ||
      text.includes("illustration montre") ||
      text.includes("image illustrera") ||
      text.includes("diagramme montrant") ||
      text.length === 0
    ) {
      el.remove();
    }
  });
  
  // Replace HTML elements with proper line breaks
  temp.querySelectorAll("br").forEach(br => {
    br.replaceWith(document.createTextNode("\n"));
  });
  
  temp.querySelectorAll("p").forEach(p => {
    if (p.textContent?.trim()) {
      p.appendChild(document.createTextNode("\n"));
    }
  });
  
  temp.querySelectorAll("div").forEach(div => {
    if (div.textContent?.trim()) {
      div.appendChild(document.createTextNode("\n"));
    }
  });
  
  temp.querySelectorAll("ul, ol").forEach(list => {
    list.appendChild(document.createTextNode("\n"));
  });
  
  temp.querySelectorAll("li").forEach(li => {
    // Remove any existing bullet/marker characters first
    const textContent = li.textContent || "";
    li.textContent = textContent.replace(/^[•·∙◦▪▫○●◘◙☼♦♣♠•]/g, "").trim();
    
    const bullet = document.createTextNode("• ");
    li.insertBefore(bullet, li.firstChild);
    li.appendChild(document.createTextNode("\n"));
  });
  
  temp.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach(heading => {
    if (heading.textContent?.trim()) {
      heading.appendChild(document.createTextNode("\n"));
    }
  });
  
  // Get text content
  let text = temp.textContent || "";
  
  // Remove any weird encoding artifacts that might remain
  text = text.replace(/[^\x00-\x7F\u00C0-\u017F\u0180-\u024F\u1E00-\u1EFF\n\r\t •]/g, "");
  
  // Remove excessive empty lines (more than 2 consecutive newlines)
  text = text.replace(/\n{4,}/g, "\n\n");
  
  // Remove lines that are just whitespace
  text = text.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n\n');
  
  return text.trim();
};

// Helper to strip HTML tags and preserve text content properly (for Word/PDF)
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  
  // First decode any HTML entities
  let decodedHtml = decodeHtmlEntities(html);
  
  const temp = document.createElement("div");
  temp.innerHTML = decodedHtml;
  
  // Remove script and style elements
  temp.querySelectorAll("script, style").forEach(el => el.remove());
  
  // Replace HTML elements with proper line breaks
  temp.querySelectorAll("br").forEach(br => {
    br.replaceWith(document.createTextNode("\n"));
  });
  
  temp.querySelectorAll("p").forEach(p => {
    const textNode = document.createTextNode("\n\n");
    p.appendChild(textNode);
  });
  
  temp.querySelectorAll("div").forEach(div => {
    div.appendChild(document.createTextNode("\n"));
  });
  
  temp.querySelectorAll("ul, ol").forEach(list => {
    list.appendChild(document.createTextNode("\n"));
  });
  
  temp.querySelectorAll("li").forEach(li => {
    // Remove any existing bullet/marker characters first
    const textContent = li.textContent || "";
    li.textContent = textContent.replace(/^[•·∙◦▪▫○●◘◙☼♦♣♠•]/g, "").trim();
    
    const bullet = document.createTextNode("• ");
    li.insertBefore(bullet, li.firstChild);
    li.appendChild(document.createTextNode("\n"));
  });
  
  temp.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach(heading => {
    heading.appendChild(document.createTextNode("\n\n"));
  });
  
  // Get text content
  let text = temp.textContent || "";
  
  // Remove any weird encoding artifacts that might remain
  text = text.replace(/[^\x00-\x7F\u00C0-\u017F\u0180-\u024F\u1E00-\u1EFF\n\r\t •]/g, "");
  
  // Clean up excessive whitespace
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();
  
  return text;
};

// Format content for plain text
const formatContent = (html: string | undefined): string => {
  if (!html) return "Contenu non disponible";
  return stripHtmlTags(html);
};

// Format content for plain text with extra cleaning
const formatContentForText = (html: string | undefined): string => {
  if (!html) return "Contenu non disponible";
  return cleanContentForText(html);
};

// Format content into multiple paragraphs for Word document
const formatContentToParagraphs = (html: string | undefined): Paragraph[] => {
  if (!html) return [
    new Paragraph({
      text: "Contenu non disponible",
      spacing: { after: 300 },
    })
  ];
  
  const content = stripHtmlTags(html);
  // Split by double line breaks or bullet points
  const sections = content.split(/\n\n+/);
  
  return sections
    .filter(section => section.trim())
    .map(section => {
      const trimmedSection = section.trim();
      return new Paragraph({
        text: trimmedSection,
        spacing: { after: 250, line: 360 },
      });
    });
};

// Generate filename
const generateFilename = (lessonData: LessonData, subjectName: string, extension: string): string => {
  const cleanTitle = lessonData.title.replace(/[^a-z0-9]/gi, "-").substring(0, 50);
  const gradeLevel = lessonData.grade_level || "lesson";
  return `${subjectName}-${cleanTitle}-${gradeLevel}.${extension}`;
};

// Load logo as base64
const loadLogoAsBase64 = async (): Promise<string> => {
  try {
    const response = await fetch("/logo.png");
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error loading logo:", error);
    return "";
  }
};

/**
 * Generates and downloads a branded plain-text file of a lesson.
 * @param options - Download options containing lesson data, optional personal notes, and subject name
 * @returns Promise that resolves when the file has been saved
 */
export const generatePlainText = async ({
  lessonData,
  personalNotes,
  subjectName,
}: DownloadOptions): Promise<void> => {
  try {
    let content = "";
    
    // Logo representation in ASCII art
    content += "╔══════════════════════════════════════════════════════════════╗\n";
    content += "║                        EDUPRENEURS                           ║\n";
    content += "║                  Plateforme Éducative Haïtienne             ║\n";
    content += "╚══════════════════════════════════════════════════════════════╝\n\n";
    
    // Header
    content += "════════════════════════════════════════════════════════════════\n";
    content += `   ${lessonData.title.toUpperCase()}\n`;
    content += `   ${subjectName}${lessonData.grade_level ? ` - ${lessonData.grade_level}` : ""}\n`;
    content += "════════════════════════════════════════════════════════════════\n\n";
    
    if (lessonData.month || lessonData.lesson_number) {
      content += `${lessonData.month ? `Mois: ${lessonData.month}` : ""}${lessonData.lesson_number ? ` | Leçon #${lessonData.lesson_number}` : ""}\n\n`;
    }
    
    // Objective
    if (lessonData.objectif) {
      content += "OBJECTIF\n";
      content += "────────────────────────────────────────────────────────────────\n";
      content += `${formatContentForText(lessonData.objectif)}\n\n`;
    }
    
    // Introduction
    if (lessonData.introduction) {
      content += "INTRODUCTION\n";
      content += "────────────────────────────────────────────────────────────────\n";
      content += `${formatContentForText(lessonData.introduction)}\n\n`;
    }
    
    // Main Content
    if (lessonData.contenu) {
      content += "CONTENU PRINCIPAL\n";
      content += "────────────────────────────────────────────────────────────────\n";
      content += `${formatContentForText(lessonData.contenu)}\n\n`;
    }
    
    // Examples and Exercises
    if (lessonData.exemples_exercices) {
      content += "EXEMPLES ET EXERCICES\n";
      content += "────────────────────────────────────────────────────────────────\n";
      content += `${formatContentForText(lessonData.exemples_exercices)}\n\n`;
    }
    
    // Personal Notes
    if (personalNotes && personalNotes.trim()) {
      content += "MES NOTES PERSONNELLES\n";
      content += "────────────────────────────────────────────────────────────────\n";
      content += `${personalNotes}\n\n`;
    }
    
    // YouTube Video
    if (lessonData.youtube_url) {
      content += "VIDÉO YOUTUBE\n";
      content += "────────────────────────────────────────────────────────────────\n";
      content += `${lessonData.youtube_url}\n\n`;
    }
    
    // References
    if (lessonData.references && lessonData.references.length > 0) {
      content += "RÉFÉRENCES\n";
      content += "────────────────────────────────────────────────────────────────\n";
      lessonData.references.forEach((ref) => {
        content += `• ${ref}\n`;
      });
      content += "\n";
    }
    
    // Footer with copyright
    content += "\n════════════════════════════════════════════════════════════════\n";
    content += `${COPYRIGHT_TEXT}\n`;
    content += `${MODIFICATION_WARNING}\n`;
    content += `Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}\n`;
    content += "════════════════════════════════════════════════════════════════\n";
    
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
    // Load logo
    const logoBase64 = await loadLogoAsBase64();
    const logoData = logoBase64.split(",")[1]; // Remove data:image/png;base64, prefix
    
    const doc = new Document({
      creator: "Edupreneurs",
      title: lessonData.title,
      description: `${subjectName} - ${lessonData.title}`,
      sections: [
        {
          properties: {},
          children: [
            // Logo
            ...(logoData ? [
              new Paragraph({
                children: [
                  new ImageRun({
                    type: "png",
                    data: Uint8Array.from(atob(logoData), c => c.charCodeAt(0)),
                    transformation: {
                      width: 150,
                      height: 150,
                    },
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),
            ] : []),
            
            // Company name
            new Paragraph({
              text: "EDUPRENEURS",
              alignment: AlignmentType.CENTER,
              spacing: { after: 150 },
              style: "Strong",
            }),
            
            new Paragraph({
              text: "Plateforme Éducative Haïtienne",
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 },
            }),
            
            // Header
            new Paragraph({
              text: lessonData.title.toUpperCase(),
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            }),
            new Paragraph({
              text: `${subjectName}${lessonData.grade_level ? ` - ${lessonData.grade_level}` : ""}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 },
            }),
            
            // Metadata
            ...(lessonData.month || lessonData.lesson_number ? [
              new Paragraph({
                text: `${lessonData.month ? `Mois: ${lessonData.month}` : ""}${lessonData.lesson_number ? ` | Leçon #${lessonData.lesson_number}` : ""}`,
                spacing: { after: 500 },
              }),
            ] : []),
            
            // Objective
            ...(lessonData.objectif ? [
              new Paragraph({
                text: "Objectif",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 600, after: 300 },
              }),
              ...formatContentToParagraphs(lessonData.objectif),
            ] : []),
            
            // Introduction
            ...(lessonData.introduction ? [
              new Paragraph({
                text: "Introduction",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 600, after: 300 },
              }),
              ...formatContentToParagraphs(lessonData.introduction),
            ] : []),
            
            // Main Content
            ...(lessonData.contenu ? [
              new Paragraph({
                text: "Contenu Principal",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 600, after: 300 },
              }),
              ...formatContentToParagraphs(lessonData.contenu),
            ] : []),
            
            // Examples and Exercises
            ...(lessonData.exemples_exercices ? [
              new Paragraph({
                text: "Exemples et Exercices",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 600, after: 300 },
              }),
              ...formatContentToParagraphs(lessonData.exemples_exercices),
            ] : []),
            
            // Personal Notes
            ...(personalNotes && personalNotes.trim() ? [
              new Paragraph({
                text: "Mes Notes Personnelles",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 600, after: 300 },
              }),
              new Paragraph({
                text: personalNotes,
                spacing: { after: 500, line: 360 },
              }),
            ] : []),
            
            // YouTube Video
            ...(lessonData.youtube_url ? [
              new Paragraph({
                text: "Vidéo YouTube",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 600, after: 300 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: lessonData.youtube_url,
                    color: "0000FF",
                    underline: {},
                  }),
                ],
                spacing: { after: 500 },
              }),
            ] : []),
            
            // References
            ...(lessonData.references && lessonData.references.length > 0 ? [
              new Paragraph({
                text: "Références",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 600, after: 300 },
              }),
              ...lessonData.references.map(
                (ref) =>
                  new Paragraph({
                    text: `• ${ref}`,
                    spacing: { after: 150, line: 300 },
                  })
              ),
            ] : []),
            
            // Footer with copyright
            new Paragraph({
              text: "",
              spacing: { before: 800 },
            }),
            new Paragraph({
              text: COPYRIGHT_TEXT,
              alignment: AlignmentType.CENTER,
              spacing: { before: 600, after: 200 },
            }),
            new Paragraph({
              text: MODIFICATION_WARNING,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: `Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
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

    // Set document properties for protection and UTF-8 support
    pdf.setProperties({
      title: lessonData.title,
      subject: subjectName,
      author: "Edupreneurs",
      keywords: "education, lesson, protected, edupreneurs",
      creator: "Edupreneurs - Plateforme Éducative Haïtienne",
    });
    
    // Ensure UTF-8 encoding support
    pdf.setLanguage("fr-FR");

    // Helper to add page break if needed
    const checkPageBreak = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - margin - 20) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper to add text with word wrap and proper UTF-8 encoding
    const addText = (text: string, fontSize: number, style: "normal" | "bold" = "normal", color: [number, number, number] = [0, 0, 0]) => {
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", style);
      pdf.setTextColor(color[0], color[1], color[2]);
      
      // Ensure text is properly encoded
      const cleanText = decodeURIComponent(encodeURIComponent(text));
      const lines = pdf.splitTextToSize(cleanText, maxWidth);
      const lineHeight = fontSize * 0.52;
      
      for (const line of lines) {
        checkPageBreak(lineHeight + 2);
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      }
    };

    // Header - Title with gradient-like effect and logo
    const headerHeight = 50;
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, yPosition, pageWidth, headerHeight, "F");
    
    // Add logo in top left of header
    try {
      const logoBase64 = await loadLogoAsBase64();
      if (logoBase64) {
        pdf.addImage(logoBase64, "PNG", margin, yPosition + 5, 40, 40);
      }
    } catch (error) {
      console.error("Error adding logo to PDF:", error);
    }
    
    // Title and subtitle offset to the right to accommodate logo
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    const titleLines = pdf.splitTextToSize(lessonData.title, maxWidth - 50);
    pdf.text(titleLines, margin + 50, yPosition + 18);
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    const subtitle = `${subjectName}${lessonData.grade_level ? ` - ${lessonData.grade_level}` : ""}`;
    pdf.text(subtitle, margin + 50, yPosition + 35);
    
    yPosition += headerHeight + 10;

    // Metadata with styled box
    if (lessonData.month || lessonData.lesson_number) {
      pdf.setFillColor(245, 247, 250);
      pdf.roundedRect(margin, yPosition, maxWidth, 10, 2, 2, "F");
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "italic");
      const metadata = `${lessonData.month ? `Mois: ${lessonData.month}` : ""}${lessonData.lesson_number ? ` | Leçon #${lessonData.lesson_number}` : ""}`;
      pdf.text(metadata, margin + 3, yPosition + 7);
      yPosition += 18;
    }

    // Helper to add section with styled header
    const addSection = (title: string, content: string) => {
      checkPageBreak(25);
      
      // Section header with underline
      pdf.setFillColor(59, 130, 246);
      pdf.rect(margin, yPosition, 3, 8, "F");
      pdf.setFontSize(15);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(59, 130, 246);
      pdf.text(title, margin + 6, yPosition + 6);
      yPosition += 12;
      
      // Content
      pdf.setTextColor(50, 50, 50);
      addText(content, 11, "normal");
      yPosition += 10;
    };

    // Objective
    if (lessonData.objectif) {
      addSection("Objectif", formatContent(lessonData.objectif));
    }

    // Introduction
    if (lessonData.introduction) {
      addSection("Introduction", formatContent(lessonData.introduction));
    }

    // Main Content
    if (lessonData.contenu) {
      addSection("Contenu Principal", formatContent(lessonData.contenu));
    }

    // Examples and Exercises
    if (lessonData.exemples_exercices) {
      addSection("Exemples et Exercices", formatContent(lessonData.exemples_exercices));
    }

    // Personal Notes
    if (personalNotes && personalNotes.trim()) {
      checkPageBreak(25);
      pdf.setFillColor(255, 248, 220);
      const notesHeight = pdf.splitTextToSize(personalNotes, maxWidth - 8).length * 6 + 15;
      pdf.roundedRect(margin, yPosition, maxWidth, notesHeight, 3, 3, "F");
      
      pdf.setFillColor(218, 165, 32);
      pdf.rect(margin, yPosition, 3, 8, "F");
      pdf.setFontSize(15);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(218, 165, 32);
      pdf.text("Mes Notes Personnelles", margin + 6, yPosition + 6);
      yPosition += 12;
      
      pdf.setTextColor(70, 70, 70);
      addText(personalNotes, 11, "normal");
      yPosition += 8;
    }

    // YouTube Video
    if (lessonData.youtube_url) {
      checkPageBreak(20);
      pdf.setFillColor(255, 59, 48);
      pdf.rect(margin, yPosition, 3, 8, "F");
      pdf.setFontSize(15);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 59, 48);
      pdf.text("Vidéo YouTube", margin + 6, yPosition + 6);
      yPosition += 12;
      
      pdf.setTextColor(59, 130, 246);
      pdf.setFont("helvetica", "normal");
      pdf.textWithLink("Cliquer ici pour voir la vidéo", margin, yPosition, { url: lessonData.youtube_url });
      pdf.setTextColor(0, 0, 0);
      yPosition += 12;
    }

    // References
    if (lessonData.references && lessonData.references.length > 0) {
      checkPageBreak(25);
      pdf.setFillColor(34, 197, 94);
      pdf.rect(margin, yPosition, 3, 8, "F");
      pdf.setFontSize(15);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(34, 197, 94);
      pdf.text("Références", margin + 6, yPosition + 6);
      yPosition += 12;
      
      pdf.setTextColor(50, 50, 50);
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
      pdf.text(`Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`, pageWidth - margin, pageHeight - 10, { align: "right" });
    }

    // Save with protection
    pdf.save(generateFilename(lessonData, subjectName, "pdf"));
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Échec de la génération du PDF. Veuillez réessayer.");
  }
};
