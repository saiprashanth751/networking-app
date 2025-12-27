import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { buildCloudinaryUrl, getBlurPlaceholderUrl } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none';
    onLoad?: () => void;
    onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Optimized Image Component
 * 
 * Features:
 * - Lazy loading with Intersection Observer
 * - Cloudinary transformations (auto-format, quality, sizing)
 * - Blur placeholder while loading
 * - Error fallback
 */
export function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    objectFit = 'cover',
    onLoad,
    onError,
    ...props
}: OptimizedImageProps) {
    const imgRef = useRef<HTMLImageElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Lazy loading with Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px', // Start loading slightly before visible
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Generate optimized URLs
    const optimizedSrc = buildCloudinaryUrl(src, { width, height });
    const blurPlaceholder = getBlurPlaceholderUrl(src);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        setHasError(true);
        setIsLoaded(true); // Stop showing loading state
        onError?.(e);
    };

    return (
        <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
            {/* Blur placeholder - always visible until main image loads */}
            {!isLoaded && (
                <img
                    src={blurPlaceholder}
                    alt=""
                    aria-hidden="true"
                    className={cn(
                        'absolute inset-0 w-full h-full',
                        `object-${objectFit}`,
                        'blur-sm scale-110 transition-opacity duration-300'
                    )}
                />
            )}

            {/* Main image - only loads when in view */}
            {isInView && (
                <img
                    {...props}
                    src={optimizedSrc}
                    alt={alt}
                    className={cn(
                        'w-full h-full',
                        `object-${objectFit}`,
                        'transition-opacity duration-300',
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading="lazy" // Native lazy loading as backup
                />
            )}

            {/* Error fallback */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-neutral-500 text-xs">
                    <span>Failed to load image</span>
                </div>
            )}
        </div>
    );
}
