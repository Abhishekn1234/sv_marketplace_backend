import { Response } from "express";
import { KYC } from "./KYC";
import { User } from "../Auth/User";
import { AuthRequest } from "../middlewares/authMiddleware";

const mapFileToKYC = (fileName: string) => {
  const lower = fileName.toLowerCase();

  // Determine category
  let category: string;
  if (lower.includes("aadhaar")) category = "identity";
  else if (lower.includes("pan")) category = "identity";
  else if (lower.includes("passport")) category = "identity";
  else if (lower.includes("electricity") || lower.includes("bill") || lower.includes("rent"))
    category = "address";
  else if (lower.includes("salary") || lower.includes("offer") || lower.includes("income"))
    category = "income";
  else category = "other";

  // Determine document type based on extension
  let documentType: string;
  if (lower.endsWith(".pdf")) documentType = "PDF Document";
  else if (lower.endsWith(".doc") || lower.endsWith(".docx")) documentType = "Word Document";
  else if (lower.endsWith(".jpeg") || lower.endsWith(".jpg")) documentType = "JPEG Image";
  else if (lower.endsWith(".png")) documentType = "PNG Image";
  else documentType = "Unknown";

  return { category, documentType };
};

export const submitKYC = async (req: AuthRequest, res: Response) => {
  try {
    const { aadhaarNumber, panNumber } = req.body;
    const documentsMeta = req.body.documentsMeta ? JSON.parse(req.body.documentsMeta) : [];

    if (!req.files || !(req.files instanceof Array))
      return res.status(400).json({ message: "No KYC files uploaded" });

    const uploadedFiles = (req.files as Express.Multer.File[]).map((f, i) => {
      const meta = documentsMeta[i] || {};
      const autoMeta = mapFileToKYC(f.originalname);

      return {
        category: meta.category || autoMeta.category,
        documentType: meta.documentType || autoMeta.documentType,
        fileName: f.originalname,
        filePath: f.path,
        fileType: f.mimetype,
        uploadedAt: new Date(),
      };
    });

    const kyc = await KYC.create({
      user: req.user!._id,
      aadhaarNumber,
      panNumber,
      documents: uploadedFiles,
      status: "pending",
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user!._id,
      { kycStatus: "submitted" },
      { new: true }
    ).select("fullName email phone kycStatus");

    res.status(201).json({ message: "KYC submitted successfully", kyc, user: updatedUser });
  } catch (err: any) {
    console.error("KYC submission error:", err);
    res.status(500).json({ message: err.message });
  }
};




export const verifyKYC = async (req: AuthRequest, res: Response) => {
  try {
    const { kycId, status, remarks } = req.body;

    // 1️⃣ Find KYC by ID
    const kyc = await KYC.findById(kycId);
    if (!kyc) return res.status(404).json({ message: "KYC not found" });

    // 2️⃣ Update KYC status and remarks
    kyc.status = status;
    kyc.remarks = remarks;
    await kyc.save();

    // 3️⃣ Update user's KYC status
    const user = await User.findByIdAndUpdate(
      kyc.user,
      { kycStatus: status },
      { new: true, select: 'fullName email phone kycStatus' } // return updated user fields
    );

    // 4️⃣ Respond with both KYC and user info
    res.json({
      message: `KYC ${status}`,
      kyc,
      user
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

