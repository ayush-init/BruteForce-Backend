"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingle = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// Storage configuration (memory storage for S3 upload)
const storage = multer_1.default.memoryStorage();
// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, JPG, PNG, are allowed.'));
    }
};
// General upload middleware (for files like PDFs, documents)
exports.upload = (0, multer_1.default)({
    storage,
});
// Image upload middleware with file filter and size limits
exports.uploadSingle = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
}).single('file'); // 'file' is the field name in the form
