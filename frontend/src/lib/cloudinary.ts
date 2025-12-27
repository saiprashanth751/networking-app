/**
 * Cloudinary URL Transformation Utilities
 * 
 * Optimizes image URLs from Cloudinary with transformations:
 * - Auto-format (WebP, AVIF)
 * - Auto-quality
 * - Responsive sizing
 * - Blur placeholders
 */

export interface CloudinaryOptions {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
    crop?: 'scale' | 'fill' | 'fit' | 'crop';
    blur?: number;
}

const CLOUDINARY_CLOUD_NAME = 'dko9q9xsk'; // From backend .env

/**
 * Check if URL is from Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
    return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
}

/**
 * Build optimized Cloudinary URL with transformations
 * 
 * @example
 * buildCloudinaryUrl('https://res.cloudinary.com/demo/image/upload/sample.jpg', { width: 800 })
 * // => 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800,c_scale/sample.jpg'
 */
export function buildCloudinaryUrl(
    originalUrl: string,
    options: CloudinaryOptions = {}
): string {
    // Non-Cloudinary URLs pass through unchanged
    if (!isCloudinaryUrl(originalUrl)) {
        return originalUrl;
    }

    const {
        width,
        height,
        quality = 'auto',
        format = 'auto',
        crop = 'scale',
        blur,
    } = options;

    try {
        // Parse Cloudinary URL structure
        // Format: https://res.cloudinary.com/{cloud}/image/upload/{transformations}/{publicId}
        const uploadIndex = originalUrl.indexOf('/upload/');
        if (uploadIndex === -1) return originalUrl;

        const baseUrl = originalUrl.substring(0, uploadIndex + 8); // Include '/upload/'
        const publicIdWithParams = originalUrl.substring(uploadIndex + 8);

        // Build transformation string
        const transformations: string[] = [];

        if (format) transformations.push(`f_${format}`);
        if (quality) transformations.push(`q_${quality}`);
        if (width) transformations.push(`w_${width}`);
        if (height) transformations.push(`h_${height}`);
        if (crop && (width || height)) transformations.push(`c_${crop}`);
        if (blur) transformations.push(`e_blur:${blur}`);

        // No transformations needed
        if (transformations.length === 0) return originalUrl;

        // Build final URL
        return `${baseUrl}${transformations.join(',')}/${publicIdWithParams}`;
    } catch (error) {
        console.error('Failed to build Cloudinary URL:', error);
        return originalUrl; // Fallback to original
    }
}

/**
 * Generate blur placeholder URL (tiny, blurred version)
 */
export function getBlurPlaceholderUrl(url: string): string {
    return buildCloudinaryUrl(url, {
        width: 50,
        quality: 10,
        blur: 1000,
    });
}

/**
 * Generate responsive srcset for different screen sizes
 */
export function getResponsiveSrcSet(url: string, sizes: number[]): string {
    if (!isCloudinaryUrl(url)) return '';

    return sizes
        .map((size) => {
            const optimizedUrl = buildCloudinaryUrl(url, { width: size });
            return `${optimizedUrl} ${size}w`;
        })
        .join(', ');
}
