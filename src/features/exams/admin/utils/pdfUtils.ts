/**
 * PDF Utilities for Exam Admin
 * Shared utilities for PDF conversion and upload
 */
import * as pdfjsLib from "pdfjs-dist";
import { supabase } from "@/integrations/supabase/client";
import { normalizeToSlug } from "@/lib/slugNormalization";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export interface PDFConversionProgress {
  currentPage: number;
  totalPages: number;
  percent: number;
}

/**
 * Convert a PDF file to an array of base64 image strings
 */
export async function convertPdfToImages(
  file: File,
  onProgress?: (progress: PDFConversionProgress) => void
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  
  const images: string[] = [];
  
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    
    // High resolution for accuracy (scale 2.0 = 200%)
    const scale = 2.0;
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    
    if (!context) {
      throw new Error("Could not get canvas context");
    }
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    } as any).promise;
    
    // Convert to base64 PNG
    const dataUrl = canvas.toDataURL("image/png", 0.95);
    images.push(dataUrl);
    
    // Report progress
    if (onProgress) {
      onProgress({
        currentPage: pageNum,
        totalPages: numPages,
        percent: Math.round((pageNum / numPages) * 100),
      });
    }
  }
  
  return images;
}

export interface PDFUploadOptions {
  track: '9AF' | 'NS4';
  subject: string;
  year: number;
  series?: string;
  session?: string;
  isModelExam?: boolean;
}

/**
 * Upload a PDF file to Supabase storage
 */
export async function uploadPdfToStorage(
  file: File,
  options: PDFUploadOptions
): Promise<string | null> {
  try {
    const { track, subject, year, series, session, isModelExam } = options;
    
    const safeSubjectSlug = normalizeToSlug(subject || "examen");
    
    let fileName: string;
    
    if (track === '9AF') {
      fileName = `${safeSubjectSlug}-${year}-9af.pdf`;
    } else {
      const safeSeriesSlug = normalizeToSlug(series || "bac");
      const sessionSuffix = session === "rattrapage" ? "-rattrapage" : "";
      const modelSuffix = isModelExam ? "-modele" : "";
      fileName = `bac-${safeSeriesSlug}-${safeSubjectSlug}-${year}${sessionSuffix}${modelSuffix}.pdf`;
    }

    const { error: uploadError } = await supabase.storage
      .from("exam-documents")
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("exam-documents")
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return null;
  }
}
