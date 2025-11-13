import express from "express";
import { getKYCByUser, submitKYC, verifyKYC } from "../Controllers/kycController";
import { protect, isAdmin,isCustomer } from "../../../middlewares/authMiddleware";
import { uploadKYC } from "../../../middlewares/uploadMiddleware";

const router = express.Router();
router.use(protect,isAdmin);
router.post("/submit",uploadKYC.array("documents", 10), submitKYC);
router.post("/verify",  verifyKYC);
router.get('/user/kyc/:userId',isCustomer,getKYCByUser);

export default router;
