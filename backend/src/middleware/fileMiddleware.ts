import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';


interface StorageParams {
    folder: string;
    format: (req: Express.Request, file: Express.Multer.File) => Promise<string> | string;
    public_id: (req: Express.Request, file: Express.Multer.File) => string;
}

const storage: CloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile-pics',
        format: async (req: Express.Request, file: Express.Multer.File): Promise<string> => 'jpg',
        public_id: (req: Express.Request, file: Express.Multer.File): string => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            return `${file.fieldname}-${uniqueSuffix}`;
        },
    } as StorageParams,
});

const upload = multer({ storage });
export default upload;