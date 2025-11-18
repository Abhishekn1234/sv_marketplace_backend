import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../../config/cloudinary";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    resource_type: file.mimetype.startsWith("image/") ? "image" : "raw", // auto handles PDF/DOC/images
    folder: "kyc_documents",
    public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`,
  }),
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type. Only JPG, PNG, PDF, DOC, DOCX allowed."));
};

export const uploadKYC = multer({ storage, fileFilter }).fields([
  { name: "idProof", maxCount: 1 },
  { name: "addressProof", maxCount: 1 },
  { name: "photo", maxCount: 1 },
]);
