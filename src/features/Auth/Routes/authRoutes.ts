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

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to user email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "john@gmail.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "OTP sent successfully"
 */

router.post("/send-otp", sendOtpController);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify user OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: "john@gmail.com"
 *             otp: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "OTP verified successfully"
 */

router.post("/verify-otp", verifyOtpController);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               identifier: "john@gmail.com"
 *               password: "Test@123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *             example:
 *               
 *               user:
 *                 _id: "676ffcaa123"
 *                 fullName: "John Doe"
 *                 email: "john@gmail.com"
 *                 phone: "9876543210"
 *                 role: "customer"
 *                 isVerified: true
 *               accessToken: "your.jwt.token"
 *               refreshToken: "refresh.jwt.token"
 */


router.post("/login", loginUser);

/**
 * @swagger
 * /auth/bio/update:
 *   put:
 *     summary: Update user bio
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               dob:
 *                 type: string
 *               address:
 *                 type: string
 *               bio:
 *                 type: string
 *               profileImage:
 *                 type: file
 *                 
 *     responses:
 *       200:
 *         description: Bio updated successfully
 */
router.put("/bio/update", protect, isCustomer, uploadProfile, submitBio);

/**
 * @swagger
 * /auth/password/update:
 *   put:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             currentPassword: "Old@123"
 *             newPassword: "New@123"
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Password updated successfully"
 */

router.put("/password/update", protect, isCustomer, changePassword);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Fetch logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile details
 *         content:
 *           application/json:
 *             example:
 *               _id: "userId"
 *               fullName: "John Doe"
 *               email: "john@gmail.com"
 *               phone: "9876543210"
 */

router.get("/profile", protect, getProfileController);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post("/logout", protect, logoutUser);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Generate a new access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             refreshToken: "your.refresh.token"
 *     responses:
 *       200:
 *         example:
 *           accessToken: "new.jwt.token"
 */

router.post("/refresh-token", Accesstoken);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Send password reset OTP or link
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             email: "john@gmail.com"
 *     responses:
 *       200:
 *         description: Reset email sent
 */

router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           example:
 *             token: "reset_token_here"
 *             password: "New@123"
 *     responses:
 *       200:
 *         example:
 *           success: true
 *           message: "Password reset successful"
 */

router.post("/reset-password", resetPassword);

// Admin protected routes
router.use(protect, isAdmin);

export default router;
