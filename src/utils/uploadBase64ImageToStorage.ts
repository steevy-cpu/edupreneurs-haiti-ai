/**
 * @file uploadBase64ImageToStorage.ts
 * @description Uploads a base64-encoded image to Supabase storage and returns the public URL.
 * Used by batch generation and preview dialogs for explanatory image persistence.
 */

import { supabase } from "@/integrations/supabase/client";

/** Convert base64 image data to a Blob, upload to lesson-images bucket, return public URL */
export async function uploadBase64ImageToStorage(
  base64Data: string, 
  lessonId: string, 
  concept: string,
  index: number
): Promise<string | null> {
  try {
    // Convert base64 to Blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    // Generate unique filename with sanitized concept name
    const timestamp = Date.now();
    const safeConceptName = (concept || 'image').replace(/[^a-z0-9]/gi, '-').toLowerCase().substring(0, 50);
    const fileName = `${lessonId}/${safeConceptName}-${index}-${timestamp}.png`;

    // Upload to storage bucket
    const { data, error } = await supabase.storage
      .from('lesson-images')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error('[Storage] Failed to upload image:', error);
      return null;
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('lesson-images')
      .getPublicUrl(fileName);

    console.log('[Storage] Image uploaded successfully:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (e) {
    console.error('[Storage] Upload exception:', e);
    return null;
  }
}
