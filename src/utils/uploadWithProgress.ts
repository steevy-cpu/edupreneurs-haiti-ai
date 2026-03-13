/**
 * @file uploadWithProgress.ts
 * @description XHR-based file upload to storage with real-time progress tracking, bypassing the SDK for progress events.
 * @module utils
 *
 * @example
 * const { data, error } = await uploadWithProgress('avatars', 'user/avatar.jpg', file, onProgress);
 */

import { supabase } from "@/integrations/supabase/client";

export interface UploadProgress {
  progress: number;      // 0-100 percentage
  loadedBytes: number;   // Bytes uploaded
  totalBytes: number;    // Total file size
  stage: 'uploading' | 'processing' | 'complete' | 'error';
}

export type OnUploadProgress = (progress: UploadProgress) => void;

/**
 * Uploads a file to storage with real-time progress tracking via XMLHttpRequest.
 * Uses the current session token for authentication and supports upsert.
 * @param bucketName - Storage bucket name
 * @param filePath - Destination path within the bucket
 * @param file - File to upload
 * @param onProgress - Callback invoked with upload progress updates
 * @returns Object with uploaded file path or error
 */
export async function uploadWithProgress(
  bucketName: string,
  filePath: string,
  file: File,
  onProgress: OnUploadProgress
): Promise<{ data: { path: string } | null; error: Error | null }> {
  // Get the current session for authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    return { data: null, error: new Error('User not authenticated') };
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`;

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress({
          progress: percentage,
          loadedBytes: event.loaded,
          totalBytes: event.total,
          stage: 'uploading'
        });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress({ progress: 100, loadedBytes: file.size, totalBytes: file.size, stage: 'complete' });
        resolve({ data: { path: filePath }, error: null });
      } else {
        let errorMessage = `Upload failed: ${xhr.status}`;
        try {
          const response = JSON.parse(xhr.responseText);
          errorMessage = response.message || response.error || errorMessage;
        } catch {
          // Keep default error message
        }
        onProgress({ progress: 0, loadedBytes: 0, totalBytes: file.size, stage: 'error' });
        resolve({ data: null, error: new Error(errorMessage) });
      }
    };

    xhr.onerror = () => {
      onProgress({ progress: 0, loadedBytes: 0, totalBytes: file.size, stage: 'error' });
      resolve({ data: null, error: new Error('Network error during upload') });
    };

    xhr.open('POST', uploadUrl);
    
    // Required headers for Supabase Storage
    xhr.setRequestHeader('apikey', supabaseAnonKey);
    xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('x-upsert', 'true');
    
    // Send file directly as binary
    xhr.send(file);
  });
}
