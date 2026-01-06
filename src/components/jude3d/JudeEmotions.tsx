import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type EmotionType = 'neutral' | 'happy' | 'focused' | 'excited' | 'surprised' | 'thinking';

// Shape keys from the Jude model: Smile, Thinking, Surprised, Sad, Neutral, Blink, Talking
interface EmotionBlendShapes {
  Smile?: number;
  Thinking?: number;
  Surprised?: number;
  Sad?: number;
  Neutral?: number;
}

// Emotion presets mapped to actual shape keys in the model
const EMOTION_PRESETS: { [key in EmotionType]: EmotionBlendShapes } = {
  neutral: { Neutral: 1 },
  happy: { Smile: 0.8, Neutral: 0.2 },
  focused: { Thinking: 0.5, Neutral: 0.5 },
  excited: { Smile: 1, Surprised: 0.3 },
  surprised: { Surprised: 0.9 },
  thinking: { Thinking: 0.8, Neutral: 0.2 },
};

// All shape keys for resetting
const ALL_SHAPE_KEYS = ['Smile', 'Thinking', 'Surprised', 'Sad', 'Neutral'];

interface JudeEmotionsProps {
  mesh: THREE.SkinnedMesh | null;
  currentEmotion: EmotionType;
  transitionSpeed?: number;
}

export const JudeEmotions = ({ mesh, currentEmotion, transitionSpeed = 0.1 }: JudeEmotionsProps) => {
  const targetWeights = useRef<EmotionBlendShapes>({});
  const blinkTimer = useRef(0);
  const isBlinking = useRef(false);

  // Update target weights when emotion changes
  useEffect(() => {
    targetWeights.current = EMOTION_PRESETS[currentEmotion] || EMOTION_PRESETS.neutral;
  }, [currentEmotion]);

  useFrame((state, delta) => {
    if (!mesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

    // Handle blinking using the Blink shape key
    blinkTimer.current += delta;
    if (!isBlinking.current && blinkTimer.current > 3 + Math.random() * 2) {
      isBlinking.current = true;
      blinkTimer.current = 0;
    }
    
    // Blink animation using Blink shape key
    const blinkIndex = mesh.morphTargetDictionary['Blink'];
    
    if (isBlinking.current) {
      const blinkProgress = blinkTimer.current / 0.15; // 150ms blink
      let blinkValue = 0;
      
      if (blinkProgress < 0.5) {
        blinkValue = blinkProgress * 2; // Close
      } else if (blinkProgress < 1) {
        blinkValue = 2 - blinkProgress * 2; // Open
      } else {
        isBlinking.current = false;
        blinkTimer.current = 0;
      }
      
      if (blinkIndex !== undefined) {
        mesh.morphTargetInfluences[blinkIndex] = blinkValue;
      }
    }

    // Reset all emotion shape keys first, then apply targets
    ALL_SHAPE_KEYS.forEach(key => {
      const morphIndex = mesh.morphTargetDictionary![key];
      if (morphIndex !== undefined) {
        const target = (targetWeights.current as any)[key] || 0;
        const current = mesh.morphTargetInfluences![morphIndex] || 0;
        mesh.morphTargetInfluences![morphIndex] = THREE.MathUtils.lerp(
          current,
          target,
          transitionSpeed
        );
      }
    });
  });

  // This component doesn't render anything
  return null;
};

// Helper to map backend emotion strings to EmotionType
export const mapEmotionString = (emotion: string): EmotionType => {
  const emotionMap: { [key: string]: EmotionType } = {
    neutral: 'neutral',
    happy: 'happy',
    focused: 'focused',
    excited: 'excited',
    surprised: 'surprised',
    thinking: 'thinking',
    joyful: 'happy',
    curious: 'focused',
    enthusiastic: 'excited',
    amazed: 'surprised',
    contemplative: 'thinking',
  };
  
  return emotionMap[emotion.toLowerCase()] || 'neutral';
};
