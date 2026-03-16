import { useState, useRef, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  threshold?: number;
  sizes?: string;
  srcSet?: string;
}

export const LazyImage = ({ 
  src, 
  alt, 
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3C/svg%3E",
  threshold = 0.1,
  className = "",
  sizes = "100vw",
  srcSet,
  ...props 
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div 
      className={`relative overflow-hidden bg-muted ${className}`} 
      ref={imgRef}
      style={{ aspectRatio: '1/1' }}
    >
      {/* Placeholder/skeleton */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse" 
          aria-hidden="true"
        />
      )}
      
      {isInView && (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          loading="lazy"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

/**
 * Generate responsive srcSet for images from Unsplash
 */
export const generateUnsplashSrcSet = (baseUrl: string, widths: number[] = [400, 800, 1200, 1600]) => {
  return widths
    .map(w => `${baseUrl}&w=${w}&auto=format&fit=crop ${w}w`)
    .join(', ');
};

/**
 * Generate sizes attribute for different breakpoints
 */
export const generateResponsiveSizes = (
  breakpoints: { size: string; width: number }[]
) => {
  return breakpoints
    .map(b => `(max-width: ${b.width}px) ${b.size}`)
    .join(', ');
};
