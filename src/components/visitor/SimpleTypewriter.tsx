import { useState, useEffect } from 'react';

interface SimpleTypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

const SimpleTypewriter = ({
  text,
  speed = 80,
  onComplete,
  className = ""
}: SimpleTypewriterProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
      onComplete?.();
    }
  }, [displayedText, text, speed, onComplete, isComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && <span className="animate-pulse ml-0.5">|</span>}
    </span>
  );
};

export default SimpleTypewriter;
