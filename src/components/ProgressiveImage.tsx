import { useState, useEffect, useRef, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ProgressiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  /** Low quality placeholder - tiny inline base64 or blur hash */
  placeholder?: string;
  /** Skip lazy loading for LCP images */
  priority?: boolean;
}

// Default blur placeholder - tiny gray square
const DEFAULT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 4'%3E%3Crect fill='%23e5e7eb' width='4' height='4'/%3E%3C/svg%3E";

/**
 * Progressive image component optimized for 3G connections
 * - Shows blur placeholder immediately
 * - Uses IntersectionObserver for true lazy loading
 * - Smooth fade-in transition on load
 * - Fallback for browsers without IntersectionObserver
 */
export const ProgressiveImage = ({
  src,
  alt,
  className,
  placeholderClassName,
  placeholder = DEFAULT_PLACEHOLDER,
  priority = false,
  ...props
}: ProgressiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : placeholder);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Use IntersectionObserver for lazy loading (unless priority)
  useEffect(() => {
    if (priority || !imgRef.current) {
      setIsInView(true);
      return;
    }

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before visible
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Load actual image when in view
  useEffect(() => {
    if (!isInView || hasError) return;

    // Preload the image
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      // Small delay for smooth transition
      requestAnimationFrame(() => {
        setIsLoaded(true);
      });
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setHasError(true);
    };
    img.src = src;
  }, [isInView, src, hasError]);

  return (
    <div 
      ref={imgRef as React.RefObject<HTMLDivElement>}
      className={cn("relative overflow-hidden", placeholderClassName)}
    >
      {/* Placeholder/blur background - always render to maintain layout */}
      <div 
        className={cn(
          "absolute inset-0 bg-muted transition-opacity duration-300",
          isLoaded || hasError ? "opacity-0" : "opacity-100 animate-pulse"
        )}
        style={{
          backgroundImage: `url(${placeholder})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(10px)',
          transform: 'scale(1.1)'
        }}
        aria-hidden="true"
      />
      
      {/* Actual image - always in DOM to preserve layout */}
      <img
        src={currentSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          "relative w-full h-auto transition-opacity duration-500 ease-out",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
    </div>
  );
};

export default ProgressiveImage;
