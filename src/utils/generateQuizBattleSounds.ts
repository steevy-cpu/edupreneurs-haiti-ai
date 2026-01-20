/**
 * Admin utility to generate all Quiz Battle sounds using ElevenLabs
 * 
 * This only needs to run once to populate the storage bucket with sounds.
 * After running, sounds will be cached and served directly from storage.
 */

import { supabase } from '@/integrations/supabase/client';

export interface SoundPrompt {
  type: string;
  prompt: string;
  duration: number;
}

export const SOUND_PROMPTS: SoundPrompt[] = [
  { 
    type: 'game-start', 
    prompt: 'Exciting triumphant game show fanfare, competition starting horn, energetic and upbeat, short celebration jingle', 
    duration: 2 
  },
  { 
    type: 'question-start', 
    prompt: 'Quick digital whoosh transition sound, game show question reveal swoosh, modern and clean', 
    duration: 0.5 
  },
  { 
    type: 'correct', 
    prompt: 'Cheerful bright success chime, correct answer celebration ding, happy and rewarding bell sound', 
    duration: 1 
  },
  { 
    type: 'incorrect', 
    prompt: 'Gentle soft buzzer, wrong answer tone but not harsh, encouraging to try again, subtle error sound', 
    duration: 0.8 
  },
  { 
    type: 'game-complete', 
    prompt: 'Victory celebration fanfare, winner announcement triumphant horns, game show finale music, exciting end', 
    duration: 3 
  },
  { 
    type: 'lobby-music', 
    prompt: 'Upbeat electronic game show waiting room music, exciting anticipation, fun energetic beat, Kahoot style lobby music, loopable background', 
    duration: 20 
  },
];

export interface GenerationResult {
  type: string;
  success: boolean;
  url?: string;
  error?: string;
  cached?: boolean;
  size?: number;
}

/**
 * Generate all quiz battle sounds using ElevenLabs
 * 
 * @param onProgress - Callback for progress updates
 * @returns Array of generation results
 */
export const generateAllQuizBattleSounds = async (
  onProgress?: (current: number, total: number, currentSound: string) => void
): Promise<GenerationResult[]> => {
  const results: GenerationResult[] = [];
  
  console.log('[SoundGenerator] Starting generation of', SOUND_PROMPTS.length, 'sounds...');
  
  for (let i = 0; i < SOUND_PROMPTS.length; i++) {
    const sound = SOUND_PROMPTS[i];
    onProgress?.(i + 1, SOUND_PROMPTS.length, sound.type);
    
    console.log(`[SoundGenerator] Generating ${i + 1}/${SOUND_PROMPTS.length}: ${sound.type}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('elevenlabs-sfx', {
        body: { 
          prompt: sound.prompt, 
          soundType: sound.type, 
          duration: sound.duration 
        }
      });
      
      if (error) {
        console.error(`[SoundGenerator] Error for ${sound.type}:`, error);
        results.push({ 
          type: sound.type, 
          success: false, 
          error: error.message 
        });
      } else {
        console.log(`[SoundGenerator] Success for ${sound.type}:`, data);
        results.push({ 
          type: sound.type, 
          success: true, 
          url: data.audioUrl,
          cached: data.cached,
          size: data.size
        });
      }
      
      // Small delay between requests to avoid rate limiting (3 seconds)
      if (i < SOUND_PROMPTS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (e) {
      console.error(`[SoundGenerator] Exception for ${sound.type}:`, e);
      results.push({ 
        type: sound.type, 
        success: false, 
        error: e instanceof Error ? e.message : 'Unknown error' 
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`[SoundGenerator] Complete. ${successCount}/${SOUND_PROMPTS.length} sounds generated successfully.`);
  
  return results;
};

/**
 * Generate a single sound
 */
export const generateSingleSound = async (soundType: string): Promise<GenerationResult> => {
  const soundPrompt = SOUND_PROMPTS.find(s => s.type === soundType);
  
  if (!soundPrompt) {
    return { type: soundType, success: false, error: 'Unknown sound type' };
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('elevenlabs-sfx', {
      body: { 
        prompt: soundPrompt.prompt, 
        soundType: soundPrompt.type, 
        duration: soundPrompt.duration 
      }
    });
    
    if (error) {
      return { type: soundType, success: false, error: error.message };
    }
    
    return { 
      type: soundType, 
      success: true, 
      url: data.audioUrl,
      cached: data.cached,
      size: data.size
    };
  } catch (e) {
    return { 
      type: soundType, 
      success: false, 
      error: e instanceof Error ? e.message : 'Unknown error' 
    };
  }
};
