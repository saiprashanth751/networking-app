import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import CustomError from '../utils/customError';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { Readable } from 'stream';
import prisma from '../../prisma/prisma_client';

// Extend Express Request with auth user ID
interface AuthRequest extends Request {
    id?: string;
}

// Helper to upload compressed buffer to Cloudinary
const uploadCompressedToCloudinary = (
    buffer: Buffer,
    folder: string,
    format: 'jpeg' | 'png' | 'webp'
): Promise<{ url: string; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                format,
                public_id: `${folder}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        url: result?.secure_url || '',
                        width: result?.width || 0,
                        height: result?.height || 0,
                    });
                }
            }
        );

        const bufferStream = new Readable();
        bufferStream.push(buffer);
        bufferStream.push(null);
        bufferStream.pipe(stream);
    });
};

// ============================================================================
// UPLOAD MEDIA WITH SHARP COMPRESSION
// ============================================================================

export const uploadMedia = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Production Workflow: Require postId
    const { postId } = req.body;

    console.log('🔍 [uploadMedia] Request file:', req.file);
    console.log('🔍 [uploadMedia] Request body:', req.body);
    console.log('🔍 [uploadMedia] postId:', postId);

    if (!req.file) {
        throw new CustomError('No file uploaded', 400);
    }

    if (!postId) {
        throw new CustomError('postId is required - create draft post first', 400);
    }

    // Verify post exists and belongs to user
    const post = await prisma.post.findFirst({
        where: {
            id: postId,
            userId: req.id,
            status: 'DRAFT', // Only allow uploads to draft posts
        },
    });

    if (!post) {
        throw new CustomError('Draft post not found or unauthorized', 404);
    }

    // Validate file type
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
        throw new CustomError('Only images are allowed (JPEG, PNG, WebP, GIF)', 400);
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
        throw new CustomError('File too large (max 10MB)', 413);
    }

    const { optimize = 'true', quality = '80', maxWidth = '1920', maxHeight = '1080' } = req.query;

    try {
        let processedBuffer = req.file.buffer;
        let format: 'jpeg' | 'png' | 'webp' = 'jpeg';
        let fileSize = req.file.size;

        // Image optimization with Sharp
        if (optimize === 'true') {
            const sharpInstance = sharp(req.file.buffer);
            const metadata = await sharpInstance.metadata();

            // Determine optimal format
            // Keep PNG if it has transparency, otherwise convert to WebP for best compression
            format = metadata.format === 'png' && metadata.hasAlpha ? 'png' : 'webp';

            // Resize and compress
            processedBuffer = await sharpInstance
                .resize(Number(maxWidth), Number(maxHeight), {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .toFormat(format, {
                    quality: Number(quality),
                    progressive: true,
                })
                .toBuffer();

            fileSize = processedBuffer.length;

            console.log(
                `✅ Image optimized: ${req.file.size} → ${fileSize} bytes (${Math.round((1 - fileSize / req.file.size) * 100)}% reduction)`
            );
        }

        // Upload to Cloudinary
        const { url, width, height } = await uploadCompressedToCloudinary(
            processedBuffer,
            'media-uploads',
            format
        );

        // Save media record in database (without postId - will be attached later)
        const media = await prisma.postMedia.create({
            data: {
                type: 'IMAGE',
                url,
                fileName: req.file.originalname,
                fileSize,
                mimeType: `image/${format}`,
                width,
                height,
                order: 0,
                postId, // Production workflow - linked from start
            },
        });

        return res.status(201).json({
            message: 'Media uploaded successfully',
            media: {
                id: media.id,
                type: media.type,
                url: media.url,
                fileName: media.fileName,
                fileSize: media.fileSize,
                mimeType: media.mimeType,
                width: media.width,
                height: media.height,
            },
            optimization: {
                originalSize: req.file.size,
                compressedSize: fileSize,
                savingsPercentage: Math.round((1 - fileSize / req.file.size) * 100),
                format,
            },
        });
    } catch (error: any) {
        console.error('❌ Media upload error:', error);
        throw new CustomError(error.message || 'Failed to upload media', 500);
    }
});

// ============================================================================
// GET MEDIA BY ID
// ============================================================================

export const getMediaById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const media = await prisma.postMedia.findUnique({
        where: { id },
    });

    if (!media) {
        throw new CustomError('Media not found', 404);
    }

    return res.status(200).json({
        message: 'Media retrieved successfully',
        media,
    });
});

// ============================================================================
// DELETE MEDIA
// ============================================================================

export const deleteMedia = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const media = await prisma.postMedia.findUnique({
        where: { id },
        include: { post: true },
    });

    if (!media) {
        throw new CustomError('Media not found', 404);
    }

    // Check if user owns the post (if media is attached)
    if (media.post && media.post.userId !== req.id) {
        throw new CustomError('Unauthorized to delete this media', 403);
    }

    // Delete from Cloudinary
    try {
        const publicId = media.url.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
        console.log(`🗑️ Deleted from Cloudinary: ${publicId}`);
    } catch (error) {
        console.error('⚠️ Failed to delete from Cloudinary:', error);
    }

    // Delete from database
    await prisma.postMedia.delete({
        where: { id },
    });

    return res.status(200).json({
        message: 'Media deleted successfully',
    });
});
