import { useEffect, useRef } from 'react';
import { AnimationAction, AnimationMixer } from 'three';

interface JudeAnimationControllerProps {
  mixer: AnimationMixer | null;
  actions: { [key: string]: AnimationAction | null };
  currentAnimation: string;
  previousAnimation?: string;
  transitionDuration?: number;
}

export const JudeAnimationController = ({
  mixer,
  actions,
  currentAnimation,
  previousAnimation,
  transitionDuration = 0.3
}: JudeAnimationControllerProps) => {
  const currentActionRef = useRef<AnimationAction | null>(null);

  useEffect(() => {
    if (!mixer || !actions) return;

    const newAction = actions[currentAnimation];
    const prevAction = currentActionRef.current;

    if (newAction && newAction !== prevAction) {
      // Crossfade to new animation
      newAction.reset();
      newAction.setEffectiveTimeScale(1);
      newAction.setEffectiveWeight(1);
      
      if (prevAction) {
        // Smooth crossfade
        newAction.crossFadeFrom(prevAction, transitionDuration, true);
      }
      
      newAction.play();
      currentActionRef.current = newAction;
    }

    return () => {
      // Cleanup if needed
    };
  }, [mixer, actions, currentAnimation, transitionDuration]);

  // This component doesn't render anything - it just controls animations
  return null;
};

// Animation priority map for interruption handling
export const ANIMATION_PRIORITY: { [key: string]: number } = {
  idle: 0,
  talking: 1,
  thinking: 2,
  pointing: 2,
  waving: 3,
  celebrating: 4,
  explaining: 2,
  greeting: 3,
};

// Get animation name from trigger
export const getAnimationFromTrigger = (animation: string): string => {
  const animationMap: { [key: string]: string } = {
    idle: 'idle',
    talking: 'talking',
    thinking: 'thinking',
    celebrating: 'celebrating',
    waving: 'waving',
    pointing: 'pointing',
    explaining: 'explaining',
    greeting: 'greeting',
  };
  
  return animationMap[animation] || 'idle';
};
