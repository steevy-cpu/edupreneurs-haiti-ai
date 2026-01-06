import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, RootState } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF } from '@react-three/drei';
import { JudeModel, JudeModelRef } from './JudeModel';
import { JudePlaceholder } from './JudePlaceholder';
import { Phoneme } from './JudeLipSync';

// Preload the Jude model for faster loading
useGLTF.preload('/models/jude.glb');

interface Jude3DCanvasProps {
  modelUrl?: string;
  currentAnimation?: string;
  currentEmotion?: string;
  phonemes?: Phoneme[];
  audioElement?: HTMLAudioElement | null;
  isPlaying?: boolean;
  usePlaceholder?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// Loading fallback component
const LoadingFallback = () => (
  <mesh>
    <sphereGeometry args={[0.5, 16, 16]} />
    <meshStandardMaterial color="#10b981" wireframe />
  </mesh>
);

// WebGL support check
const checkWebGLSupport = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
};

export const Jude3DCanvas = ({
  modelUrl,
  currentAnimation = 'idle',
  currentEmotion = 'neutral',
  phonemes = [],
  audioElement = null,
  isPlaying = false,
  usePlaceholder = false,
  className = '',
  onLoad,
  onError
}: Jude3DCanvasProps) => {
  const modelRef = useRef<JudeModelRef>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Check WebGL support on mount
  useEffect(() => {
    setWebGLSupported(checkWebGLSupport());
  }, []);

  // Handle WebGL context loss
  const handleCreated = (state: RootState) => {
    const canvas = state.gl.domElement;
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      setHasError(true);
      onError?.(new Error('WebGL context lost'));
    });
    onLoad?.();
  };

  // Fallback for no WebGL support
  if (!webGLSupported || hasError) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-primary/30 flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <p className="text-xs text-muted-foreground">3D non disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <Canvas
        camera={{ position: [0, 0.5, 2.5], fov: 45 }}
        onCreated={handleCreated}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8} 
          castShadow
        />
        <directionalLight 
          position={[-3, 3, 2]} 
          intensity={0.4}
          color="#bfdbfe"
        />

        {/* Environment for reflections */}
        <Environment preset="apartment" />

        {/* Shadow */}
        <ContactShadows 
          position={[0, -1.4, 0]} 
          opacity={0.4} 
          scale={3} 
          blur={2} 
        />

        {/* Main content with Suspense */}
        <Suspense fallback={<LoadingFallback />}>
          {usePlaceholder || !modelUrl ? (
            <JudePlaceholder 
              animation={currentAnimation}
              emotion={currentEmotion}
              isSpeaking={isPlaying}
            />
          ) : (
            <JudeModel
              ref={modelRef}
              modelUrl={modelUrl}
              currentAnimation={currentAnimation}
              currentEmotion={currentEmotion}
              phonemes={phonemes}
              audioElement={audioElement}
              isPlaying={isPlaying}
              scale={1}
              position={[0, -1, 0]}
            />
          )}
        </Suspense>

        {/* Camera Controls - limited for chat widget */}
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
          minAzimuthAngle={-Math.PI / 6}
          maxAzimuthAngle={Math.PI / 6}
        />
      </Canvas>
    </div>
  );
};
