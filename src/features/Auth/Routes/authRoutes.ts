import express from "express";
import {
  registerUser,
  loginUser,

  Accesstoken,
 
  forgotPassword,
  resetPassword,

  sendOtpController,
  verifyOtpController,
  
  getProfileController,
  logoutUser,
  submitBio,
  changePassword
} from "../Controllers/auth.controller";

import { protect, isAdmin, isCustomer, isEmployee } from "../Middlewares/authMiddleware";
import { uploadProfile } from "../Middlewares/uploadProfile";

const router = express.Router();

router.post("/register", registerUser);
router.post("/send-otp", sendOtpController);
router.post("/verify-otp", verifyOtpController);




router.post("/login", loginUser);


router.put("/bio/update", protect, isCustomer, uploadProfile, submitBio);
router.put("/password/update", protect, isCustomer, changePassword);

router.get("/profile", protect, getProfileController);
router.post("/logout", protect, logoutUser);
router.post("/refresh-token", Accesstoken);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.use(protect, isAdmin);


export default router;
