"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadKYC = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const cloudinary_1 = __importDefault(require("../../../config/cloudinary"));
const allowedTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req, file) => {
        return {
            resource_type: file.mimetype.startsWith("image/") ? "image" : "raw",
            public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`,
            folder: "kyc_documents", // ✅ folder goes here inside returned object
        };
    },
});
const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype))
        cb(null, true);
    else
        cb(new Error("Invalid file type. Only JPG, PNG, PDF, DOC, DOCX allowed."));
};
exports.uploadKYC = (0, multer_1.default)({ storage, fileFilter }).fields([
    { name: "idProof", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
    { name: "photo", maxCount: 1 }
]);
//# sourceMappingURL=uploadMiddleware.js.map