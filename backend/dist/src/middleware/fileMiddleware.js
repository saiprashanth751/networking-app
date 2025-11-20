"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const uploadToCloudinary = (fieldName) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.file) {
            const stream = cloudinary_1.v2.uploader.upload_stream({
                folder: "profile-pics",
                public_id: `profilePic-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
            }, (error, result) => {
                if (error) {
                    console.error("Error uploading to Cloudinary:", error);
                    return res.status(500).json({ error: "Cloudinary upload failed" });
                }
                req.file.cloudinaryUrl = (result === null || result === void 0 ? void 0 : result.secure_url) || null;
                next();
            });
            const bufferStream = new stream_1.Readable();
            bufferStream.push(req.file.buffer);
            bufferStream.push(null);
            bufferStream.pipe(stream);
        }
        else if (req.files && req.files.length > 0) {
            const cloudinaryUrls = [];
            const uploadFile = (file) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary_1.v2.uploader.upload_stream({
                        folder: "posts",
                        public_id: `post-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
                    }, (error, result) => {
                        if (error) {
                            console.error("Error uploading to Cloudinary:", error);
                            reject(error);
                        }
                        else {
                            cloudinaryUrls.push((result === null || result === void 0 ? void 0 : result.secure_url) || "");
                            resolve(result);
                        }
                    });
                    const bufferStream = new stream_1.Readable();
                    bufferStream.push(file.buffer);
                    bufferStream.push(null);
                    bufferStream.pipe(stream);
                });
            };
            try {
                yield Promise.all(req.files.map((file) => uploadFile(file)));
                req.files = req.files.map((file, index) => (Object.assign(Object.assign({}, file), { cloudinaryUrl: cloudinaryUrls[index] })));
                next();
            }
            catch (error) {
                console.error("Error uploading files to Cloudinary:", error);
                res.status(500).json({ error: "Cloudinary upload failed" });
            }
        }
        else {
            req.file = { cloudinaryUrl: null };
            req.files = [];
            next();
        }
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
exports.default = upload;
