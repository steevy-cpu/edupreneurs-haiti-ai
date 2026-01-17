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
  /** Optional WebP version of the image */
  webpSrc?: string;
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

// Generate WebP URL from original URL (for public images)
const getWebPUrl = (url: string): string | null => {
  // Only auto-generate WebP URLs for local images in /images/ or assets
  if (url.startsWith('/images/') && (url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg'))) {
    return url.replace(/\.(png|jpe?g)$/i, '.webp');
  }
  return null;
};

// Check if browser supports WebP
let webpSupported: boolean | null = null;
const checkWebPSupport = (): Promise<boolean> => {
  if (webpSupported !== null) return Promise.resolve(webpSupported);
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      webpSupported = img.width > 0 && img.height > 0;
      resolve(webpSupported);
    };
    img.onerror = () => {
      webpSupported = false;
      resolve(false);
    };
    // Tiny WebP test image
    img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });
};

/**
 * Progressive image component optimized for 3G connections
 * - Shows blur placeholder immediately
 * - Uses WebP format when available for 40-60% bandwidth savings
 * - Uses IntersectionObserver for true lazy loading
 * - Smooth fade-in transition on load
 * - Network-aware quality adjustments
 * - Fallback for browsers without IntersectionObserver or WebP
 */
export const ProgressiveImage = ({
  src,
  alt,
  className,
  placeholderClassName,
  placeholder = DEFAULT_PLACEHOLDER,
  priority = false,
  webpSrc,
  ...props
}: ProgressiveImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : placeholder);
  const [hasError, setHasError] = useState(false);
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Get network-aware settings
  const connectionType = typeof window !== 'undefined' ? getConnectionType() : 'fast';
  const skipBlur = connectionType === 'slow';

  // Check WebP support on mount
  useEffect(() => {
    checkWebPSupport().then(setSupportsWebP);
  }, []);

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
    if (!isInView || hasError || supportsWebP === null) return;

    // Determine the best source to use
    let bestSrc = src;
    
    if (supportsWebP) {
      // Use explicit webpSrc if provided, otherwise try to auto-generate
      if (webpSrc) {
        bestSrc = webpSrc;
      } else {
        const autoWebP = getWebPUrl(src);
        if (autoWebP) {
          bestSrc = autoWebP;
        }
      }
    }

    // Preload the image
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(bestSrc);
      // Small delay for smooth transition
      requestAnimationFrame(() => {
        setIsLoaded(true);
      });
    };
    img.onerror = () => {
      // If WebP failed, fallback to original
      if (bestSrc !== src) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setCurrentSrc(src);
          requestAnimationFrame(() => {
            setIsLoaded(true);
          });
        };
        fallbackImg.onerror = () => {
          console.error(`Failed to load image: ${src}`);
          setHasError(true);
        };
        fallbackImg.src = src;
      } else {
        console.error(`Failed to load image: ${src}`);
        setHasError(true);
      }
    };
    img.src = bestSrc;
  }, [isInView, src, webpSrc, hasError, supportsWebP]);

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
