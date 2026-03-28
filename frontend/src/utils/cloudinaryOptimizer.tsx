import React from 'react';

interface CloudinaryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    width?: number;
    height?: number;
    quality?: 'auto' | 'best' | 'good' | 'eco' | 'low';
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
}

/**
 * Optimizes Cloudinary image URLs with transformations
 * @param url - Original Cloudinary URL
 * @param width - Desired width in pixels
 * @param height - Desired height in pixels
 * @param quality - Image quality level
 * @param format - Image format
 * @param crop - Crop mode
 * @returns Optimized URL with transformations
 */
export const getOptimizedCloudinaryUrl = (
    url: string,
    width?: number,
    height?: number,
    quality: string = 'auto',
    format: string = 'auto',
    crop: string = 'fill'
): string => {
    if (!url || !url.includes('cloudinary.com')) {
        return url;
    }

    const transformations: string[] = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);
    if (crop && (width || height)) transformations.push(`c_${crop}`);

    const transformString = transformations.join(',');

    // Insert transformations after /upload/
    return url.replace('/upload/', `/upload/${transformString}/`);
};

/**
 * CloudinaryImage component with automatic optimization
 */
export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
    src,
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    alt,
    className,
    loading = 'lazy',
    ...props
}) => {
    const optimizedSrc = getOptimizedCloudinaryUrl(
        src,
        width,
        height,
        quality,
        format,
        crop
    );

    return (
        <img
            src={optimizedSrc}
            alt={alt}
            className={className}
            loading={loading}
            {...props}
        />
    );
};
