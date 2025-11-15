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

// ------------------- Public Routes -------------------
// User registration (customer/employee)
router.post("/register", registerUser);
router.post("/send-otp", sendOtpController);
router.post("/verify-otp", verifyOtpController);

// Admin registration
router.post("/register/admin", registerAdmin);

// Coordinator registration
router.post("/register/coordinator", registerCoordinator);

// Login
router.post("/login", loginUser);
router.put(
  "/bio/update",
  protect,
  isCustomer,
   uploadProfile,  // Handles image upload
  submitBio
);

// Change Password (current + new password)
router.put(
  "/password/update",
  protect,
  isCustomer,
  changePassword
);
// Social login
router.post("/social-login", socialLogin);
router.get("/profile", protect,getProfileController);
router.post("/logout",protect,logoutUser);
// Refresh access token
router.post("/refresh-token", Accesstoken);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password (token in params)
router.post("/reset-password", resetPassword);




// ------------------- Protected Routes -------------------
// Admin creates users (customer/employee/coordinator)
 router.use(protect,isAdmin);
router.post("/admin/create-user",  adminCreateUser);
router.put("/admin/users/:userId", adminEditUser);
router.delete("/admin/users/:userId", adminDeleteUser);
router.put("/admin/users/:userId/verify",  adminVerifyUser);
export default router;

