import { supabase } from "@/integrations/supabase/client";

/**
 * Upload exam PDFs to Supabase Storage and update database records
 * This utility handles the migration of PDFs from public folder to Supabase Storage
 */

const STORAGE_BUCKET = 'exam-documents';

interface PDFUploadResult {
  success: boolean;
  message: string;
  storageUrl?: string;
}

/**
 * Upload a PDF file to Supabase Storage
 */
export async function uploadPDFToStorage(
  file: File | Blob,
  fileName: string
): Promise<PDFUploadResult> {
  try {
    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        contentType: 'application/pdf',
        upsert: true, // Replace if exists
      });

    if (error) {
      console.error('Storage upload error:', error);
      return {
        success: false,
        message: `Failed to upload ${fileName}: ${error.message}`,
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return {
      success: true,
      message: `Successfully uploaded ${fileName}`,
      storageUrl: publicUrl,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      message: `Error uploading ${fileName}: ${error}`,
    };
  }
}

/**
 * Update exam record with storage URL
 */
export async function updateExamPDFUrl(
  examId: string,
  storageUrl: string
): Promise<PDFUploadResult> {
  try {
    const { error } = await supabase
      .from('official_exams')
      .update({ pdf_url: storageUrl })
      .eq('id', examId);

    if (error) {
      console.error('Database update error:', error);
      return {
        success: false,
        message: `Failed to update exam ${examId}: ${error.message}`,
      };
    }

    return {
      success: true,
      message: `Successfully updated exam ${examId} with storage URL`,
    };
  } catch (error) {
    console.error('Update error:', error);
    return {
      success: false,
      message: `Error updating exam ${examId}: ${error}`,
    };
  }
}

/**
 * Fetch PDF from public folder and upload to storage
 */
export async function migratePDFFromPublic(
  publicPath: string,
  fileName: string,
  examId: string
): Promise<PDFUploadResult> {
  try {
    // Fetch PDF from public folder
    const response = await fetch(publicPath);
    if (!response.ok) {
      return {
        success: false,
        message: `Failed to fetch PDF from ${publicPath}`,
      };
    }

    const blob = await response.blob();

    // Upload to storage
    const uploadResult = await uploadPDFToStorage(blob, fileName);
    if (!uploadResult.success || !uploadResult.storageUrl) {
      return uploadResult;
    }

    // Update database
    const updateResult = await updateExamPDFUrl(examId, uploadResult.storageUrl);
    if (!updateResult.success) {
      return updateResult;
    }

    return {
      success: true,
      message: `Successfully migrated ${fileName} to storage and updated database`,
      storageUrl: uploadResult.storageUrl,
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      message: `Error migrating ${fileName}: ${error}`,
    };
  }
}

/**
 * Migrate all exam PDFs to storage
 */
export async function migrateAllExamPDFs(): Promise<{
  successful: number;
  failed: number;
  results: PDFUploadResult[];
}> {
  const results: PDFUploadResult[] = [];
  let successful = 0;
  let failed = 0;

  // Get all exams with pdf_url
  const { data: exams, error } = await supabase
    .from('official_exams')
    .select('id, pdf_url, title, subject, year')
    .not('pdf_url', 'is', null);

  if (error) {
    console.error('Failed to fetch exams:', error);
    return { successful: 0, failed: 1, results: [{ success: false, message: 'Failed to fetch exams' }] };
  }

  if (!exams || exams.length === 0) {
    return { successful: 0, failed: 0, results: [{ success: true, message: 'No exams with PDFs found' }] };
  }

  // Migrate each exam
  for (const exam of exams) {
    if (exam.pdf_url?.startsWith('http')) {
      // Already using storage URL, skip
      results.push({
        success: true,
        message: `${exam.title} already uses storage URL`,
      });
      successful++;
      continue;
    }

    // Extract filename from path
    const fileName = exam.pdf_url.split('/').pop() || `${exam.subject}-${exam.year}.pdf`;
    const publicPath = exam.pdf_url;

    const result = await migratePDFFromPublic(publicPath, fileName, exam.id);
    results.push(result);

    if (result.success) {
      successful++;
    } else {
      failed++;
    }
  }

  return { successful, failed, results };
}
