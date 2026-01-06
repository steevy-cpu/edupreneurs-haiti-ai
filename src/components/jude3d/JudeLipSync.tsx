import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface Phoneme {
  time: number;
  phoneme: string;
  duration: number;
}

interface JudeLipSyncProps {
  mesh: THREE.SkinnedMesh | null;
  phonemes: Phoneme[];
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
}

// Map phonemes to viseme blend shape names
const PHONEME_TO_VISEME: { [key: string]: string } = {
  // Vowels
  'a': 'viseme_aa',
  'e': 'viseme_E',
  'i': 'viseme_I',
  'o': 'viseme_O',
  'u': 'viseme_U',
  'é': 'viseme_E',
  'è': 'viseme_E',
  'ê': 'viseme_E',
  'ë': 'viseme_E',
  'à': 'viseme_aa',
  'â': 'viseme_aa',
  'î': 'viseme_I',
  'ï': 'viseme_I',
  'ô': 'viseme_O',
  'ù': 'viseme_U',
  'û': 'viseme_U',
  'ü': 'viseme_U',
  
  // Consonants that affect mouth shape
  'b': 'viseme_PP',
  'p': 'viseme_PP',
  'm': 'viseme_PP',
  'f': 'viseme_FF',
  'v': 'viseme_FF',
  't': 'viseme_TH',
  'd': 'viseme_TH',
  'n': 'viseme_TH',
  's': 'viseme_SS',
  'z': 'viseme_SS',
  'ch': 'viseme_CH',
  'j': 'viseme_CH',
  'k': 'viseme_kk',
  'g': 'viseme_kk',
  'r': 'viseme_RR',
  'l': 'viseme_TH',
  
  // Default/silence
  'sil': 'viseme_sil',
  '_': 'viseme_sil',
};

// All possible visemes for initialization
const ALL_VISEMES = [
  'viseme_aa', 'viseme_E', 'viseme_I', 'viseme_O', 'viseme_U',
  'viseme_PP', 'viseme_FF', 'viseme_TH', 'viseme_SS', 'viseme_CH',
  'viseme_kk', 'viseme_RR', 'viseme_sil'
];

export const JudeLipSync = ({ mesh, phonemes, audioElement, isPlaying }: JudeLipSyncProps) => {
  const currentPhonemeIndex = useRef(0);
  const targetWeights = useRef<{ [key: string]: number }>({});
  const currentWeights = useRef<{ [key: string]: number }>({});

  // Initialize weights
  useEffect(() => {
    ALL_VISEMES.forEach(viseme => {
      targetWeights.current[viseme] = 0;
      currentWeights.current[viseme] = 0;
    });
  }, []);

  // Reset when audio stops
  useEffect(() => {
    if (!isPlaying) {
      currentPhonemeIndex.current = 0;
      ALL_VISEMES.forEach(viseme => {
        targetWeights.current[viseme] = 0;
      });
    }
  }, [isPlaying]);

  useFrame(() => {
    if (!mesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
    if (!audioElement || !isPlaying || phonemes.length === 0) {
      // Smoothly return to neutral when not speaking
      ALL_VISEMES.forEach(viseme => {
        const morphIndex = mesh.morphTargetDictionary![viseme];
        if (morphIndex !== undefined) {
          const current = mesh.morphTargetInfluences![morphIndex] || 0;
          mesh.morphTargetInfluences![morphIndex] = current * 0.9; // Decay
        }
      });
      return;
    }

    const currentTime = audioElement.currentTime * 1000; // Convert to ms

    // Find current phoneme based on audio time
    let activePhoneme: Phoneme | null = null;
    for (let i = 0; i < phonemes.length; i++) {
      const phoneme = phonemes[i];
      if (currentTime >= phoneme.time && currentTime < phoneme.time + phoneme.duration) {
        activePhoneme = phoneme;
        break;
      }
    }

    // Reset all targets
    ALL_VISEMES.forEach(viseme => {
      targetWeights.current[viseme] = 0;
    });

    // Set target for active phoneme
    if (activePhoneme) {
      const visemeName = PHONEME_TO_VISEME[activePhoneme.phoneme] || 'viseme_sil';
      targetWeights.current[visemeName] = 1;
    }

    // Smooth interpolation for all visemes
    const lerpFactor = 0.3;
    ALL_VISEMES.forEach(viseme => {
      const morphIndex = mesh.morphTargetDictionary![viseme];
      if (morphIndex !== undefined) {
        const current = mesh.morphTargetInfluences![morphIndex] || 0;
        const target = targetWeights.current[viseme] || 0;
        mesh.morphTargetInfluences![morphIndex] = THREE.MathUtils.lerp(current, target, lerpFactor);
      }
    });
  });

  // This component doesn't render anything - it just controls blend shapes
  return null;
};

// Helper to get current phoneme for debugging
export const getCurrentPhoneme = (phonemes: Phoneme[], timeMs: number): string => {
  for (const phoneme of phonemes) {
    if (timeMs >= phoneme.time && timeMs < phoneme.time + phoneme.duration) {
      return phoneme.phoneme;
    }
  }
  return 'sil';
};
