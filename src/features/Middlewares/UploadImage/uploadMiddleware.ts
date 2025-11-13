import multer from "multer";
import path from "path";
import fs from "fs";

// Allowed MIME types
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use absolute path to avoid ENOENT errors
    const uploadDir = path.resolve(__dirname, "../uploads/kyc");

    // Ensure the folder exists before saving
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter to allow only specific types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only JPG, PNG, PDF, DOCX allowed."));
};

// Export multer middleware with limits
export const uploadKYC = multer({
  storage,
  fileFilter,
  limits: {
    files: 5,                  // Maximum 5 files per request
    fileSize: 10 * 1024 * 1024 // 10 MB per file
  },
});
