import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { JudeAnimationController } from './JudeAnimationController';
import { JudeLipSync, Phoneme } from './JudeLipSync';
import { JudeEmotions, EmotionType, mapEmotionString } from './JudeEmotions';

interface JudeModelProps {
  modelUrl: string;
  currentAnimation: string;
  currentEmotion: string;
  phonemes: Phoneme[];
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  scale?: number;
  position?: [number, number, number];
}

export interface JudeModelRef {
  playAnimation: (name: string) => void;
  setEmotion: (emotion: EmotionType) => void;
}

export const JudeModel = forwardRef<JudeModelRef, JudeModelProps>(({
  modelUrl,
  currentAnimation = 'idle',
  currentEmotion = 'neutral',
  phonemes = [],
  audioElement = null,
  isPlaying = false,
  scale = 1,
  position = [0, -1, 0]
}, ref) => {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelUrl);
  const { actions, mixer } = useAnimations(animations, group);
  const headMeshRef = useRef<THREE.SkinnedMesh | null>(null);

  // Find the head mesh with blend shapes for lip sync and emotions
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary) {
        // Look for mesh with viseme shapes
        if (child.morphTargetDictionary['viseme_aa'] !== undefined) {
          headMeshRef.current = child;
        }
        // Or any mesh with morph targets as fallback
        if (!headMeshRef.current && Object.keys(child.morphTargetDictionary).length > 0) {
          headMeshRef.current = child;
        }
      }
    });
  }, [scene]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    playAnimation: (name: string) => {
      const action = actions[name];
      if (action) {
        // Stop all other actions
        Object.values(actions).forEach(a => a?.fadeOut(0.3));
        action.reset().fadeIn(0.3).play();
      }
    },
    setEmotion: (emotion: EmotionType) => {
      // Emotions are handled by JudeEmotions component
    }
  }));

  // Initial animation setup
  useEffect(() => {
    if (actions['idle']) {
      actions['idle'].play();
    }
  }, [actions]);

  return (
    <group ref={group} position={position} scale={scale}>
      <primitive object={scene} />
      
      {/* Animation Controller */}
      <JudeAnimationController
        mixer={mixer}
        actions={actions}
        currentAnimation={currentAnimation}
      />
      
      {/* Lip Sync Controller */}
      <JudeLipSync
        mesh={headMeshRef.current}
        phonemes={phonemes}
        audioElement={audioElement}
        isPlaying={isPlaying}
      />
      
      {/* Emotions Controller */}
      <JudeEmotions
        mesh={headMeshRef.current}
        currentEmotion={mapEmotionString(currentEmotion)}
      />
    </group>
  );
});

JudeModel.displayName = 'JudeModel';

// Preload function for the model
export const preloadJudeModel = (url: string) => {
  useGLTF.preload(url);
};
