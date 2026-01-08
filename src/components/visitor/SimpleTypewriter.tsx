import { useState, useEffect, useRef, useCallback } from 'react';

interface SimpleTypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  enableSound?: boolean;
  soundVolume?: number;
}

const SimpleTypewriter = ({
  text,
  speed = 100,
  onComplete,
  className = "",
  enableSound = false,
  soundVolume = 0.08
}: SimpleTypewriterProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Create typing sound - subtle soft click
  const playTypingSound = useCallback(() => {
    if (!enableSound) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Soft mechanical click sound
      oscillator.frequency.value = 1200 + Math.random() * 400; // Slight randomness
      oscillator.type = 'sine';
      
      const now = ctx.currentTime;
      gainNode.gain.setValueAtTime(soundVolume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      
      oscillator.start(now);
      oscillator.stop(now + 0.03);
    } catch (error) {
      // Silently fail - audio not critical
    }
  }, [enableSound, soundVolume]);

  useEffect(() => {
    if (isComplete) return;

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
        
        // Play sound for each character (skip spaces for less noise)
        const nextChar = text[displayedText.length];
        if (nextChar && nextChar !== ' ') {
          playTypingSound();
        }
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
      onComplete?.();
    }
  }, [displayedText, text, speed, onComplete, isComplete, playTypingSound]);

  // Cleanup audio context
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && <span className="animate-pulse ml-0.5">|</span>}
    </span>
  );
};

export default SimpleTypewriter;
