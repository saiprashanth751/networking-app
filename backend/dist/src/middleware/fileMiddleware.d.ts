import multer from 'multer';
declare const upload: multer.Multer;
export declare const uploadToCloudinary: (fieldName: string) => (req: any, res: any, next: any) => Promise<void>;
export default upload;
