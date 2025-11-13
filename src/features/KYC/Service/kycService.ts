// src/modules/KYC/services/kycService.ts

import { KYC } from "../Models/KYC";
import { User } from "../../Auth/Models/User";

const mapFileToKYC = (fileName: string) => {
  const lower = fileName.toLowerCase();

  let category: string;
  if (lower.includes("aadhaar")) category = "identity";
  else if (lower.includes("pan")) category = "identity";
  else if (lower.includes("passport")) category = "identity";
  else if (lower.includes("electricity") || lower.includes("bill") || lower.includes("rent"))
    category = "address";
  else if (lower.includes("salary") || lower.includes("offer") || lower.includes("income"))
    category = "income";
  else category = "other";

  let documentType: string;
  if (lower.endsWith(".pdf")) documentType = "PDF Document";
  else if (lower.endsWith(".doc") || lower.endsWith(".docx")) documentType = "Word Document";
  else if (lower.endsWith(".jpeg") || lower.endsWith(".jpg")) documentType = "JPEG Image";
  else if (lower.endsWith(".png")) documentType = "PNG Image";
  else documentType = "Unknown";

  return { category, documentType };
};

export const KYCService = {
  async getKYCByUser(userId: string) {
    const kycs = await KYC.find({ user: userId }).sort({ createdAt: -1 });
    return kycs;
  },

  async submitKYC(userId: string, body: any, files: Express.Multer.File[]) {
    const { aadhaarNumber, panNumber } = body;
    const documentsMeta = body.documentsMeta ? JSON.parse(body.documentsMeta) : [];

    const uploadedFiles = files.map((f, i) => {
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
      user: userId,
      aadhaarNumber,
      panNumber,
      documents: uploadedFiles,
      status: "pending",
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { kycStatus: "submitted" },
      { new: true }
    ).select("fullName email phone kycStatus");

    return { kyc, user: updatedUser };
  },

  async verifyKYC(kycId: string, status: string, remarks: string) {
    const kyc = await KYC.findById(kycId);
    if (!kyc) throw new Error("KYC not found");

    kyc.status = status as "pending" | "approved" | "rejected" | "verified";
    kyc.remarks = remarks;
    await kyc.save();

    const user = await User.findByIdAndUpdate(
      kyc.user,
      { kycStatus: status },
      { new: true }
    ).select("fullName email phone kycStatus");

    return { kyc, user };
  },
};
