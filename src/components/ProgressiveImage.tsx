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

// Check network connection speed
const getConnectionType = (): 'slow' | 'medium' | 'fast' => {
  const nav = navigator as Navigator & { 
    connection?: { effectiveType?: string; saveData?: boolean } 
  };
  
  if (nav.connection?.saveData) return 'slow';
  
  const effectiveType = nav.connection?.effectiveType;
  if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
  if (effectiveType === '3g') return 'medium';
  return 'fast';
};

// Generate WebP/AVIF URLs for Supabase storage images
const getOptimizedImageUrl = (url: string, quality: number = 80): string => {
  if (!url.includes('supabase.co/storage')) return url;
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}quality=${quality}`;
};

/**
 * Progressive image component optimized for 3G connections
 * - Shows blur placeholder immediately
 * - Uses IntersectionObserver for true lazy loading
 * - Smooth fade-in transition on load
 * - Network-aware quality adjustments
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
  
  // Get network-aware settings
  const connectionType = typeof window !== 'undefined' ? getConnectionType() : 'fast';
  const skipBlur = connectionType === 'slow';
  const imageQuality = connectionType === 'slow' ? 60 : connectionType === 'medium' ? 75 : 80;

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

    // Apply network-aware quality for Supabase images
    const optimizedSrc = getOptimizedImageUrl(src, imageQuality);

    // Preload the image
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(optimizedSrc);
      // Small delay for smooth transition
      requestAnimationFrame(() => {
        setIsLoaded(true);
      });
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setHasError(true);
    };
    img.src = optimizedSrc;
  }, [isInView, src, hasError, imageQuality]);

  // On slow connections, skip blur effect to reduce GPU work
  const showBlurPlaceholder = !skipBlur && !isLoaded && !hasError;

  return (
    <div 
      ref={imgRef as React.RefObject<HTMLDivElement>}
      className={cn("relative overflow-hidden", placeholderClassName)}
    >
      {/* Placeholder/blur background - skip on slow connections */}
      {showBlurPlaceholder && (
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
      )}
      
      {/* Simple skeleton for slow connections */}
      {skipBlur && !isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          aria-hidden="true"
        />
      )}
      
      {/* Actual image - always in DOM to preserve layout */}
      <img
        src={currentSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
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
