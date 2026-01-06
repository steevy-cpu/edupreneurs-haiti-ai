import { useRef } from 'react';
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

// Fallback lip sync using Talking shape key with sine wave animation
export const JudeLipSync = ({ mesh, phonemes, audioElement, isPlaying }: JudeLipSyncProps) => {
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!mesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

    const talkingIndex = mesh.morphTargetDictionary['Talking'];
    if (talkingIndex === undefined) return;

    if (isPlaying) {
      // Animate mouth using sine wave for natural talking motion
      timeRef.current += delta * 8; // Speed of mouth movement
      const talkValue = Math.abs(Math.sin(timeRef.current)) * 0.6 + 0.1;
      mesh.morphTargetInfluences[talkingIndex] = THREE.MathUtils.lerp(
        mesh.morphTargetInfluences[talkingIndex] || 0,
        talkValue,
        0.3
      );
    } else {
      // Smoothly close mouth when not speaking
      mesh.morphTargetInfluences[talkingIndex] = THREE.MathUtils.lerp(
        mesh.morphTargetInfluences[talkingIndex] || 0,
        0,
        0.1
      );
      timeRef.current = 0;
    }
  });

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
