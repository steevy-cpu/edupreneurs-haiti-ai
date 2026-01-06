import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type EmotionType = 'neutral' | 'happy' | 'focused' | 'excited' | 'surprised' | 'thinking';

interface EmotionBlendShapes {
  browInnerUp?: number;
  browDownLeft?: number;
  browDownRight?: number;
  browOuterUpLeft?: number;
  browOuterUpRight?: number;
  eyeSquintLeft?: number;
  eyeSquintRight?: number;
  eyeWideLeft?: number;
  eyeWideRight?: number;
  cheekSquintLeft?: number;
  cheekSquintRight?: number;
  mouthSmileLeft?: number;
  mouthSmileRight?: number;
  mouthFrownLeft?: number;
  mouthFrownRight?: number;
  mouthPucker?: number;
  jawOpen?: number;
}

// Emotion presets
const EMOTION_PRESETS: { [key in EmotionType]: EmotionBlendShapes } = {
  neutral: {},
  happy: {
    mouthSmileLeft: 0.7,
    mouthSmileRight: 0.7,
    cheekSquintLeft: 0.4,
    cheekSquintRight: 0.4,
    eyeSquintLeft: 0.2,
    eyeSquintRight: 0.2,
  },
  focused: {
    browInnerUp: 0.3,
    browDownLeft: 0.2,
    browDownRight: 0.2,
    eyeSquintLeft: 0.1,
    eyeSquintRight: 0.1,
  },
  excited: {
    eyeWideLeft: 0.5,
    eyeWideRight: 0.5,
    browOuterUpLeft: 0.6,
    browOuterUpRight: 0.6,
    mouthSmileLeft: 0.8,
    mouthSmileRight: 0.8,
    jawOpen: 0.2,
  },
  surprised: {
    eyeWideLeft: 0.8,
    eyeWideRight: 0.8,
    browInnerUp: 0.7,
    browOuterUpLeft: 0.5,
    browOuterUpRight: 0.5,
    jawOpen: 0.4,
  },
  thinking: {
    browInnerUp: 0.4,
    browDownLeft: 0.1,
    eyeSquintLeft: 0.15,
    mouthPucker: 0.2,
  },
};

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
    targetWeights.current = EMOTION_PRESETS[currentEmotion] || {};
  }, [currentEmotion]);

  useFrame((state, delta) => {
    if (!mesh || !mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

    // Handle blinking
    blinkTimer.current += delta;
    if (!isBlinking.current && blinkTimer.current > 3 + Math.random() * 2) {
      isBlinking.current = true;
      blinkTimer.current = 0;
    }
    
    // Blink animation
    const blinkLeftIndex = mesh.morphTargetDictionary['eyeBlinkLeft'];
    const blinkRightIndex = mesh.morphTargetDictionary['eyeBlinkRight'];
    
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
      
      if (blinkLeftIndex !== undefined) {
        mesh.morphTargetInfluences[blinkLeftIndex] = blinkValue;
      }
      if (blinkRightIndex !== undefined) {
        mesh.morphTargetInfluences[blinkRightIndex] = blinkValue;
      }
    }

    // Interpolate emotion blend shapes
    Object.entries(EMOTION_PRESETS.neutral).forEach(([key]) => {
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

    // Also handle current emotion shapes
    Object.entries(targetWeights.current).forEach(([key, target]) => {
      const morphIndex = mesh.morphTargetDictionary![key];
      if (morphIndex !== undefined && target !== undefined) {
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
