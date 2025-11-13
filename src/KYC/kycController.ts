import { Response } from "express";
import { KYC } from "./KYC";
import { User } from "../Auth/User";
import { AuthRequest } from "../middlewares/authMiddleware";

export const submitKYC = async (req: AuthRequest, res: Response) => {
  try {
    const { aadhaarNumber, panNumber } = req.body;
    const documentsMeta = req.body.documentsMeta ? JSON.parse(req.body.documentsMeta) : [];

    if (!req.files || !(req.files instanceof Array))
      return res.status(400).json({ message: "No KYC files uploaded" });

    const uploadedFiles = (req.files as Express.Multer.File[]).map((f, i) => ({
      category: documentsMeta[i]?.category || "other",
      documentType: documentsMeta[i]?.documentType || "unknown",
      fileName: f.originalname,
      filePath: f.path,
      fileType: f.mimetype,
      uploadedAt: new Date(),
    }));

    // ✅ Create KYC entry
    const kyc = await KYC.create({
      user: req.user!._id,
      aadhaarNumber,
      panNumber,
      documents: uploadedFiles,
      status: "pending", // default status
    });

    // ✅ Update user KYC status
    const updatedUser = await User.findByIdAndUpdate(
      req.user!._id,
      { kycStatus: "submitted" },
      { new: true } // return the updated user
    ).select("fullName email phone kycStatus"); // select only required fields

    res.status(201).json({
      message: "KYC submitted successfully",
      kyc,
      user: updatedUser, // include user details
    });
  } catch (err: any) {
    console.error("KYC submission error:", err);
    res.status(500).json({ message: err.message });
  }
};



export const verifyKYC = async (req: AuthRequest, res: Response) => {
  try {
    const { kycId, status, remarks } = req.body;

    const kyc = await KYC.findById(kycId);
    if (!kyc) return res.status(404).json({ message: "KYC not found" });

    kyc.status = status;
    kyc.remarks = remarks;
    await kyc.save();

    await User.findByIdAndUpdate(kyc.user, { kycStatus: status });
    res.json({ message: `KYC ${status}`, kyc });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
