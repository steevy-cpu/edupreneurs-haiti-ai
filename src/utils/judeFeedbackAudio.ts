/**
 * @file judeFeedbackAudio.ts
 * @description Resolves public URLs for pre-generated Jude feedback audio clips (correct/incorrect responses).
 * @module utils
 *
 * @example
 * const url = getJudeFeedbackAudioUrl('correct', 2); // → public URL for correct-2.mp3
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Get the public URL for a pre-generated Jude feedback audio clip.
 * Audio files are stored in lesson-audio/jude-feedback/
 */
export function getJudeFeedbackAudioUrl(
  type: 'correct' | 'incorrect',
  index: number
): string {
  const { data } = supabase.storage
    .from('lesson-audio')
    .getPublicUrl(`jude-feedback/${type}-${index}.mp3`);
  return data.publicUrl;
}
