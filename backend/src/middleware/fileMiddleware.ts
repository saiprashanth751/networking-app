import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { Request, Response, NextFunction } from 'express';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max per file
        files: 10, // Max 10 files total
    },
    fileFilter: (req, file, cb) => {
        // Only allow images for project uploads
        const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}. Only images (JPEG, PNG, GIF, WebP) are allowed.`));
        }
    }
});

// Helper function to upload single file to Cloudinary
const uploadToCloudinaryHelper = (
    buffer: Buffer,
    folder: string,
    resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto'
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: resourceType as any,
                public_id: `${folder}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result?.secure_url || '');
                }
            }
        );

        const bufferStream = new Readable();
        bufferStream.push(buffer);
        bufferStream.push(null);
        bufferStream.pipe(stream);
    });
};

// Middleware for handling multiple named fields (coverImage + images)
export const uploadToCloudinary = (...fieldNames: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Handle single file upload (req.file)
            if (req.file) {
                const folder = fieldNames[0] || 'uploads';
                const fileUrl = await uploadToCloudinaryHelper(
                    req.file.buffer,
                    folder,
                    'auto'
                );
                (req.file as any).cloudinaryUrl = fileUrl;
                return next();
            }

            // Handle multiple files upload (req.files)
            if (!req.files || typeof req.files !== 'object') {
                return next();
            }

            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            // Process coverImage (single file)
            if (files.coverImage && files.coverImage[0]) {
                const coverImageUrl = await uploadToCloudinaryHelper(
                    files.coverImage[0].buffer,
                    'project-covers',
                    'auto'
                );
                (files.coverImage[0] as any).cloudinaryUrl = coverImageUrl;
            }

            // Process images (multiple files)
            if (files.images && files.images.length > 0) {
                const uploadPromises = files.images.map(file =>
                    uploadToCloudinaryHelper(file.buffer, 'project-images', 'auto')
                );
                const imageUrls = await Promise.all(uploadPromises);

                files.images = files.images.map((file, index) => ({
                    ...file,
                    cloudinaryUrl: imageUrls[index],
                } as any));
            }

            next();
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            res.status(500).json({ error: 'File upload failed' });
        }
    };
};

export default upload;