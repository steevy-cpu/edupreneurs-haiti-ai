import { useState, useEffect } from 'react';

interface FloatingReactionProps {
  emoji: string;
  onComplete: () => void;
}

/**
 * Renders a floating emoji animation when a reaction is added.
 * Auto-removes after animation completes (600ms).
 */
export const FloatingReaction = ({ emoji, onComplete }: FloatingReactionProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleAnimationEnd = () => {
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <span
      className="floating-reaction pointer-events-none select-none text-2xl"
      onAnimationEnd={handleAnimationEnd}
      style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        animation: 'floatUp 600ms ease-out forwards',
        zIndex: 50,
      }}
    >
      {emoji}
    </span>
  );
};

interface FloatingReactionsContainerProps {
  reactions: string[];
  onReactionComplete: (index: number) => void;
}

/**
 * Container for managing multiple floating reactions
 */
export const FloatingReactionsContainer = ({ 
  reactions, 
  onReactionComplete 
}: FloatingReactionsContainerProps) => {
  return (
    <div className="relative">
      {reactions.map((emoji, index) => (
        <FloatingReaction
          key={`${emoji}-${index}-${Date.now()}`}
          emoji={emoji}
          onComplete={() => onReactionComplete(index)}
        />
      ))}
    </div>
  );
};
