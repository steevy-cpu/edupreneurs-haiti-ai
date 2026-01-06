import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Capsule } from '@react-three/drei';
import * as THREE from 'three';

interface JudePlaceholderProps {
  animation?: string;
  emotion?: string;
  isSpeaking?: boolean;
}

export const JudePlaceholder = ({ animation = 'idle', emotion = 'neutral', isSpeaking = false }: JudePlaceholderProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);

  // Idle animation - gentle bobbing
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      
      // Idle bobbing
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.05;
      
      // Subtle rotation based on animation
      if (animation === 'thinking') {
        groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.1;
      } else if (animation === 'celebrating') {
        groupRef.current.position.y = Math.abs(Math.sin(t * 4)) * 0.2;
        groupRef.current.rotation.z = Math.sin(t * 3) * 0.15;
      } else if (animation === 'waving') {
        groupRef.current.rotation.z = Math.sin(t * 2) * 0.1;
      } else {
        groupRef.current.rotation.z = 0;
      }
    }

    // Mouth animation when speaking
    if (mouthRef.current) {
      if (isSpeaking) {
        const t = state.clock.elapsedTime;
        mouthRef.current.scale.y = 0.5 + Math.abs(Math.sin(t * 15)) * 0.5;
      } else {
        mouthRef.current.scale.y = 0.3;
      }
    }
  });

  // Get color based on emotion
  const getEmotionColor = () => {
    switch (emotion) {
      case 'happy':
      case 'excited':
        return '#22c55e';
      case 'focused':
        return '#3b82f6';
      case 'surprised':
        return '#f59e0b';
      default:
        return '#10b981';
    }
  };

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Body */}
      <Capsule args={[0.4, 0.8, 8, 16]} position={[0, -0.6, 0]}>
        <meshStandardMaterial color="#1e40af" />
      </Capsule>

      {/* Head */}
      <Sphere ref={headRef} args={[0.5, 32, 32]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color={getEmotionColor()} />
      </Sphere>

      {/* Eyes */}
      <Sphere args={[0.08, 16, 16]} position={[-0.15, 0.55, 0.4]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      <Sphere args={[0.08, 16, 16]} position={[0.15, 0.55, 0.4]}>
        <meshStandardMaterial color="white" />
      </Sphere>
      
      {/* Pupils */}
      <Sphere args={[0.04, 16, 16]} position={[-0.15, 0.55, 0.47]}>
        <meshStandardMaterial color="#1e293b" />
      </Sphere>
      <Sphere args={[0.04, 16, 16]} position={[0.15, 0.55, 0.47]}>
        <meshStandardMaterial color="#1e293b" />
      </Sphere>

      {/* Mouth */}
      <Sphere ref={mouthRef} args={[0.1, 16, 16]} position={[0, 0.35, 0.4]} scale={[1, 0.3, 0.5]}>
        <meshStandardMaterial color="#dc2626" />
      </Sphere>

      {/* Hair / Cap */}
      <Sphere args={[0.52, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#1e293b" />
      </Sphere>
    </group>
  );
};
