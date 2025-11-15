import express, { Response, NextFunction } from "express";
import {
  getKYCByUser,
  submitKYC,
  verifyKYC,
  DeleteKYC,
  getKycById
} from "../Controllers/kycController";

import {
  protect,
  isAdmin,
  isCustomer,
} from "../../Middlewares/Auth/authMiddleware";

import { AuthRequest } from "../../Middlewares/Auth/authMiddleware";
import { uploadKYC } from "../../Middlewares/UploadImage/uploadMiddleware";
import { uploadProfile } from "../../Middlewares/UploadImage/uploadProfile";

const router = express.Router();

/* ---------------------------
   KYC ROUTES (Customer)
---------------------------- */

// Submit KYC (User uploads documents)
router.post("/submit", protect, isCustomer, uploadKYC, submitKYC);

// Update Bio (Name, email, phone, dob, nationality, address, bio, profilePicture)


// Get logged-in user's KYC
router.get("/me", protect, (req: AuthRequest, res: Response) => {
  return getKYCByUser(req.user?.id.toString(), res);
});

// Get KYC by specific user ID (admin or same user only)
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
router.get('/kyc/:kycId',protect,getKycById);
router.delete("/delete/:kycId",protect,isCustomer,DeleteKYC);
/* ---------------------------
   ADMIN ROUTES
---------------------------- */

// Admin verifies, rejects, approves KYC
router.post("/verify", protect, isAdmin, verifyKYC);

/* ---------------------------
   EXPORT ROUTER
---------------------------- */

export default router;
