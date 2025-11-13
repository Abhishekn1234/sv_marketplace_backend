import express from "express";
import { submitKYC, verifyKYC } from "./kycController";
import { protect, isAdmin } from "../middlewares/authMiddleware";
import { uploadKYC } from "../middlewares/uploadMiddleware";

const router = express.Router();

router.post("/submit", protect,uploadKYC.array("documents", 10), submitKYC);
router.post("/verify", protect, isAdmin, verifyKYC);

export default router;
