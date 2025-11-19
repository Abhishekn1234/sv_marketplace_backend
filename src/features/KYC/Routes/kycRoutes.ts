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
} from "../../Auth/Middlewares/authMiddleware";
import { uploadKYC } from "../Middlewares/uploadMiddleware";

const router = express.Router();

/**
 * @swagger
 * /kyc/submit:
 *   post:
 *     summary: Submit KYC documents
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               idProof:
 *                 type: string
 *                 format: binary
 *                 description: Upload ID Proof (JPG, PNG, PDF, DOC, DOCX)
 *               addressProof:
 *                 type: string
 *                 format: binary
 *                 description: Upload Address Proof (JPG, PNG, PDF, DOC, DOCX)
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Upload Passport-Size Photo (JPG, PNG only)
 *     responses:
 *       200:
 *         description: KYC submitted successfully
 */


router.post("/submit", protect, isCustomer, uploadKYC, submitKYC);

/**
 * @swagger
 * /kyc/me:
 *   get:
 *     summary: Get logged in user's KYC
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user's KYC details
 */
router.get("/me", protect, getKYCByUser);

/**
 * @swagger
 * /kyc/user/kyc/{userId}:
 *   get:
 *     summary: Get KYC by userId (Admin or Owner only)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns KYC details for the user
 *       403:
 *         description: Forbidden
 */
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

/**
 * @swagger
 * /kyc/kyc/{kycId}:
 *   get:
 *     summary: Get KYC by KYC ID
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: kycId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KYC found
 */
router.get("/kyc/:kycId", protect, getKycById);

/**
 * @swagger
 * /kyc/{kycId}/document/{documentId}:
 *   delete:
 *     summary: Delete a specific KYC document (Admin only)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: kycId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: documentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully
 */
router.delete("/:kycId/document/:documentId", protect, isAdmin, DeleteKYCDocument);

/**
 * @swagger
 * /kyc/verify:
 *   post:
 *     summary: Verify a user's KYC (Admin only)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC verified successfully
 */
router.post("/verify", protect, isAdmin, verifyKYC);

export default router;
