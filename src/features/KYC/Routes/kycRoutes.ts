import express, { Response, NextFunction } from "express";
import {
  getKYCByUser,
  submitKYC,
  verifyKYC,
  getKycById,
  DeleteKYCDocument,
} from "../Controllers/kycController";
import {
  protect,
  isAdmin,
  isCustomer,
  AuthRequest,
} from "../../Middlewares/Auth/authMiddleware";
import { uploadKYC } from "../../Middlewares/UploadImage/uploadMiddleware";

const router = express.Router();

router.post("/submit", protect, isCustomer, uploadKYC, submitKYC);

router.get("/me", protect, (req: AuthRequest, res: Response) => {
  return getKYCByUser(req.user?.id.toString(), res);
});

router.get(
  "/user/kyc/:userId",
  protect,
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (
      req.user?.role === "admin" ||
      req.user?._id.toString() === req.params.userId
    ) {
      return next();
    }
    return res.status(403).json({ message: "Forbidden" });
  },
  getKYCByUser
);

router.get("/kyc/:kycId", protect, getKycById);

router.delete("/:kycId/document/:documentId", protect, isAdmin, DeleteKYCDocument);

router.post("/verify", protect, isAdmin, verifyKYC);

export default router;
