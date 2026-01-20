/**
 * Quiz Battle Sound Preloader
 * 
 * Preloads ElevenLabs-generated sound effects from Supabase storage
 * for smooth playback during quiz battles.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const QUIZ_SOUNDS = [
  'game-start',
  'question-start', 
  'correct',
  'incorrect',
  'game-complete',
  'lobby-music',
] as const;

export type QuizSoundType = typeof QUIZ_SOUNDS[number];

// Audio cache for preloaded sounds
const audioCache = new Map<QuizSoundType, HTMLAudioElement>();
let preloadPromise: Promise<void> | null = null;
let preloadComplete = false;

/**
 * Get the public URL for a quiz sound from storage
 */
export const getSoundUrl = (soundType: QuizSoundType): string => {
  return `${SUPABASE_URL}/storage/v1/object/public/game-sounds/quiz-battle/${soundType}.mp3`;
};

/**
 * Preload all quiz battle sounds from Supabase storage
 * This should be called when entering the quiz battle section
 */
export const preloadQuizBattleSounds = async (): Promise<void> => {
  // Only preload once
  if (preloadPromise) return preloadPromise;
  
  preloadPromise = (async () => {
    console.log('[SoundPreloader] Starting to preload quiz sounds...');
    
    const loadPromises = QUIZ_SOUNDS.map(async (soundType) => {
      const url = getSoundUrl(soundType);
      
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = url;
        
        // Wait for audio to be loaded enough to play
        await new Promise<void>((resolve, reject) => {
          const onCanPlay = () => {
            audio.removeEventListener('canplaythrough', onCanPlay);
            audio.removeEventListener('error', onError);
            resolve();
          };
          
          const onError = () => {
            audio.removeEventListener('canplaythrough', onCanPlay);
            audio.removeEventListener('error', onError);
            reject(new Error(`Failed to load ${soundType}`));
          };
          
          audio.addEventListener('canplaythrough', onCanPlay);
          audio.addEventListener('error', onError);
          
          // Timeout after 15s for slow 3G connections
          setTimeout(() => {
            audio.removeEventListener('canplaythrough', onCanPlay);
            audio.removeEventListener('error', onError);
            // Still cache even if timeout - it might load eventually
            resolve();
          }, 15000);
        });
        
        audioCache.set(soundType, audio);
        console.log(`[SoundPreloader] Loaded: ${soundType}`);
      } catch (e) {
        console.warn(`[SoundPreloader] Failed to preload ${soundType}:`, e);
        // Don't fail the entire preload if one sound fails
      }
    });
    
    await Promise.allSettled(loadPromises);
    preloadComplete = true;
    console.log(`[SoundPreloader] Complete. Loaded ${audioCache.size}/${QUIZ_SOUNDS.length} sounds`);
  })();
  
  return preloadPromise;
};

/**
 * Get a preloaded sound for playback
 * Returns null if sound hasn't been preloaded
 */
export const getPreloadedSound = (soundType: QuizSoundType): HTMLAudioElement | null => {
  return audioCache.get(soundType) || null;
};

/**
 * Check if sounds have been preloaded
 */
export const isSoundsPreloaded = (): boolean => {
  return preloadComplete && audioCache.size > 0;
};

/**
 * Get the number of successfully preloaded sounds
 */
export const getPreloadedCount = (): number => {
  return audioCache.size;
};

/**
 * Clear the audio cache (useful for cleanup)
 */
export const clearSoundCache = (): void => {
  audioCache.forEach((audio) => {
    audio.pause();
    audio.src = '';
  });
  audioCache.clear();
  preloadPromise = null;
  preloadComplete = false;
};
