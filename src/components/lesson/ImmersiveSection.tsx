import { useRef, useState, useEffect, useCallback } from 'react';
import { MathContent } from '@/components/MathContent';
import { sanitizeHtml } from '@/lib/sanitize';
import { cn } from '@/lib/utils';
import type { LoadingStrategy } from '@/hooks/useNetworkAwareLoading';

interface ImmersiveSectionProps {
  content: string;
  type: 'heading' | 'paragraph' | 'list' | 'box' | 'other';
  isMath: boolean;
  /** Stagger delay in ms for sequential reveal */
  delay?: number;
  /** Network-aware loading strategy controls animation intensity */
  loadingStrategy: LoadingStrategy;
}

/**
 * Wraps a single lesson section with immersive visual effects.
 * Uses IntersectionObserver to trigger animations only when visible.
 * Respects network conditions — no animations on slow connections.
 */
export function ImmersiveSection({
  content,
  type,
  isMath,
  delay = 0,
  loadingStrategy
}: ImmersiveSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Observe visibility to trigger animation only when in viewport
  useEffect(() => {
    if (loadingStrategy === 'minimal') {
      // Skip observer on minimal — render immediately without animation
      setIsVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadingStrategy]);

  // Determine animation class based on network strategy
  const animationClass = useCallback(() => {
    if (!isVisible) return 'opacity-0';
    if (loadingStrategy === 'minimal') return ''; // no animation
    if (loadingStrategy === 'reduced') return 'animate-fade-in'; // simple fade only
    return 'animate-immersive-in'; // full fade+slide
  }, [isVisible, loadingStrategy]);

  // Compute delay style for stagger effect (full strategy only)
  const delayStyle = loadingStrategy === 'full' && delay > 0
    ? { animationDelay: `${delay}ms` }
    : undefined;

  const renderContent = () => {
    if (isMath) {
      return <MathContent content={content} />;
    }
    return (
      <div
        className="lesson-content prose prose-sm sm:prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />
    );
  };

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all',
        animationClass(),
        // Heading: animated underline decoration
        type === 'heading' && isVisible && loadingStrategy === 'full' && 'immersive-heading',
        // Box: pulsing left border highlight
        type === 'box' && isVisible && loadingStrategy !== 'minimal' && 'animate-box-highlight',
        // Paragraph: subtle materialization
        type === 'paragraph' && isVisible && loadingStrategy === 'full' && 'immersive-paragraph'
      )}
      style={delayStyle}
    >
      {renderContent()}
    </div>
  );
}
