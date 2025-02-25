"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Define the upload directory path
const uploadDir = path_1.default.join(__dirname, '../uploads');
// Create the uploads directory if it doesn't exist
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Configure storage for uploaded files
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    },
});
// Initialize Multer with the storage configuration
const upload = (0, multer_1.default)({ storage });
exports.default = upload;
