import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = multer.memoryStorage();

const upload = multer({ storage });


export const uploadToCloudinary = (fieldName: string) => {
    return async (req: any, res: any, next: any) => {
        if (!req.file) {
            req.file = {};  // Ensure req.file exists
            req.file.cloudinaryUrl = null;  // Default value
            return next();
        }

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "profile-pics",
                public_id: `profilePic-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
            },
            (error, result) => {
                if (error) {
                    console.error("Error uploading to Cloudinary:", error);
                    return res.status(500).json({ error: "Cloudinary upload failed" });
                }

                req.file.cloudinaryUrl = result?.secure_url || null;
                next();
            }
        );

        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(stream);
    };
};


export default upload;