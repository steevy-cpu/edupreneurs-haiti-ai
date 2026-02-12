/**
 * PDF Utilities for Exam Admin
 * Shared utilities for PDF conversion and upload
 * Optimized for 3G connections with JPEG output and guardrails
 */
import * as pdfjsLib from "pdfjs-dist";
import { supabase } from "@/integrations/supabase/client";
import { normalizeToSlug } from "@/lib/slugNormalization";
import { uploadWithProgress, type OnUploadProgress } from "@/utils/uploadWithProgress";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/** Max file size: 25MB */
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
/** Max pages to process */
const MAX_PAGES = 20;

export interface PDFConversionProgress {
  currentPage: number;
  totalPages: number;
  percent: number;
}

export interface PDFValidationError {
  type: "file_too_large" | "too_many_pages";
  message: string;
}

/**
 * Validate a PDF file before processing
 */
export function validatePdfFile(file: File): PDFValidationError | null {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      type: "file_too_large",
      message: `Le fichier est trop volumineux (${sizeMB} MB). Maximum: 25 MB.`,
    };
  }
  return null;
}

/**
 * Convert a PDF file to an array of base64 JPEG image strings
 * Uses JPEG at 0.75 quality and 1.5x scale for 3G optimization
 */
export async function convertPdfToImages(
  file: File,
  onProgress?: (progress: PDFConversionProgress) => void
): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  if (numPages > MAX_PAGES) {
    throw new Error(
      `Ce PDF contient ${numPages} pages. Maximum autorisé: ${MAX_PAGES} pages.`
    );
  }

  const images: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);

    // Scale 1.5 = good OCR quality, much smaller than 2.0
    const scale = 1.5;
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

    // Convert to JPEG at 0.75 quality (70-80% smaller than PNG)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
    images.push(dataUrl);

    // Clean up canvas to prevent memory leaks
    canvas.width = 0;
    canvas.height = 0;
    canvas.remove();

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
 * Upload a PDF file to Supabase storage with progress tracking
 */
export async function uploadPdfToStorage(
  file: File,
  options: PDFUploadOptions,
  onUploadProgress?: OnUploadProgress
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

    if (onUploadProgress) {
      // Use XHR-based upload with progress
      const { error: uploadError } = await uploadWithProgress(
        "exam-documents",
        fileName,
        file,
        onUploadProgress
      );

      if (uploadError) throw uploadError;
    } else {
      // Fallback to standard upload
      const { error: uploadError } = await supabase.storage
        .from("exam-documents")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("exam-documents")
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return null;
  }
}
