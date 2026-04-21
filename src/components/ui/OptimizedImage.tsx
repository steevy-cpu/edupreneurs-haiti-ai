import { ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Set true for above-the-fold LCP images — disables lazy loading */
  priority?: boolean;
}

/**
 * Drop-in <img> replacement with automatic WebP fallback.
 * - Wraps raster images in <picture> with a .webp <source>
 * - Browser uses WebP if supported, falls back to original PNG/JPG
 * - lazy + async by default; priority=true for LCP images
 */
export const OptimizedImage = ({
  src,
  alt,
  priority = false,
  ...props
}: OptimizedImageProps) => {
  const isRaster = /\.(png|jpe?g)$/i.test(src);

  if (!isRaster) {
    return (
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        {...props}
      />
    );
  }

  const webpSrc = src.replace(/\.(png|jpe?g)$/i, '.webp');

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        {...props}
      />
    </picture>
  );
};
