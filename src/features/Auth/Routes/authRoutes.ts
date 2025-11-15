import express from "express";
import {
  registerUser,
  loginUser,
  adminCreateUser,
  registerAdmin,
  Accesstoken,
  registerCoordinator,
  forgotPassword,
  resetPassword,
  socialLogin,
  sendOtpController,
  verifyOtpController,
  adminEditUser,
  adminDeleteUser,
  adminVerifyUser,
  getProfileController,
  logoutUser,
  submitBio,
  changePassword
} from "../Controllers/auth.controller";

import { protect, isAdmin, isCustomer } from "../../Middlewares/Auth/authMiddleware";
import { uploadProfile } from "../../Middlewares/UploadImage/uploadProfile";

const router = express.Router();

router.post("/register", registerUser);
router.post("/send-otp", sendOtpController);
router.post("/verify-otp", verifyOtpController);

router.post("/register/admin", registerAdmin);
router.post("/register/coordinator", registerCoordinator);

router.post("/login", loginUser);
router.post("/social-login", socialLogin);

router.put("/bio/update", protect, isCustomer, uploadProfile, submitBio);
router.put("/password/update", protect, isCustomer, changePassword);

router.get("/profile", protect, getProfileController);
router.post("/logout", protect, logoutUser);
router.post("/refresh-token", Accesstoken);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.use(protect, isAdmin);

router.post("/admin/create-user", adminCreateUser);
router.put("/admin/users/:userId", adminEditUser);
router.delete("/admin/users/:userId", adminDeleteUser);
router.put("/admin/users/:userId/verify", adminVerifyUser);

export default router;
