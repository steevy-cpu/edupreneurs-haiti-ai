import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  className,
  fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23999'%3ELoading...%3C/text%3E%3C/svg%3E",
  ...props 
}: OptimizedImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    console.error(`Failed to load image: ${src}`);
    setImgSrc(fallback);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={handleError}
      onLoad={handleLoad}
      className={cn(
        "transition-opacity duration-300",
        isLoading ? "opacity-0" : "opacity-100",
        className
      )}
      {...props}
    />
  );
};
