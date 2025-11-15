import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "profile_pictures", // Cloudinary folder
    resource_type: "image",
    public_id: `PROFILE_${Date.now()}`, // unique filename
  }),
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extName = allowedTypes.test(file.originalname.toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) cb(null, true);
  else cb(new Error("Only JPEG, JPG, PNG, WEBP image formats are allowed!"));
};

export const uploadProfile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
}).single("profilePicture");
