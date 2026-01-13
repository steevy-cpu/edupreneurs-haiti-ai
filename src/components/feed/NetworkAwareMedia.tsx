import { useState, useCallback } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { ProgressiveImage } from '@/components/ProgressiveImage';
import { useNetworkAwareLoading } from '@/hooks/useNetworkAwareLoading';

interface NetworkAwareImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

/**
 * Network-aware image component that uses ProgressiveImage
 * and applies dynamic quality based on connection speed.
 */
export function NetworkAwareImage({ src, alt, className, priority = false }: NetworkAwareImageProps) {
  const { imageQuality } = useNetworkAwareLoading();
  
  // Apply quality parameter to Supabase storage URLs
  const optimizedSrc = getOptimizedImageUrl(src, imageQuality);
  
  return (
    <ProgressiveImage
      src={optimizedSrc}
      alt={alt}
      priority={priority}
      className={className}
      placeholderClassName={className}
    />
  );
}

interface NetworkAwareVideoProps {
  src: string;
  className?: string;
  poster?: string;
}

/**
 * Network-aware video component that shows a tap-to-load
 * placeholder on slow connections to save bandwidth.
 */
export function NetworkAwareVideo({ src, className, poster }: NetworkAwareVideoProps) {
  const { isSlowConnection } = useNetworkAwareLoading();
  const [shouldLoad, setShouldLoad] = useState(!isSlowConnection);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleTapToLoad = useCallback(() => {
    setIsLoading(true);
    setShouldLoad(true);
  }, []);
  
  // On slow connections, show tap-to-load placeholder
  if (!shouldLoad) {
    return (
      <div 
        className={`relative bg-muted/30 cursor-pointer group overflow-hidden ${className}`}
        onClick={handleTapToLoad}
        role="button"
        aria-label="Appuyez pour charger la vidéo"
      >
        {/* Poster image or placeholder */}
        {poster ? (
          <img 
            src={poster} 
            alt="Video thumbnail" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-muted/50 to-muted/80 flex items-center justify-center">
            <div className="text-muted-foreground/60 text-sm">Vidéo</div>
          </div>
        )}
        
        {/* Play overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
          <div className="bg-black/60 rounded-full p-4 group-hover:bg-black/80 group-hover:scale-110 transition-all duration-200 shadow-xl">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
          <p className="text-white text-xs mt-3 bg-black/60 px-3 py-1.5 rounded-full font-medium">
            Appuyez pour charger
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      <video 
        src={src} 
        controls 
        className="w-full max-h-full object-contain bg-muted/20"
        preload="metadata"
        onLoadedData={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
      />
    </div>
  );
}

/**
 * Get optimized image URL with quality parameter for Supabase storage.
 * @param url - Original image URL
 * @param quality - Image quality (1-100)
 */
export function getOptimizedImageUrl(url: string, quality: number): string {
  if (!url) return url;
  
  // Supabase storage supports image transformations via query params
  // Only apply to Supabase storage URLs
  if (url.includes('supabase.co/storage') || url.includes('supabase.in/storage')) {
    const separator = url.includes('?') ? '&' : '?';
    // Supabase uses 'quality' param for image optimization
    return `${url}${separator}quality=${Math.round(quality)}`;
  }
  
  return url;
}

export default {
  NetworkAwareImage,
  NetworkAwareVideo,
  getOptimizedImageUrl
};
