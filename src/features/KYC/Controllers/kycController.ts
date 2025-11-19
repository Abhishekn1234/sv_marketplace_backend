import { Response } from "express";
import { AuthRequest } from "../../Auth/Middlewares/authMiddleware";
import { KYCService } from "../Services/kycService";
import { mergeMulterFiles } from "../utils/fileUtils";
import { formatKycResponse } from "../Repositories/kycResponseFormatter";
export const getKYCByUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId || req.user?._id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const documents = await KYCService.getKYCByUser(userId.toString());

    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: "No KYC documents found" });
    }

    return res.json({ documents });
  } catch (err: any) {
    console.error("Error fetching KYC =>", err);
    res.status(500).json({ message: err.message });
  }
};



export const submitKYC = async (req: AuthRequest, res: Response) => {
  try {
    const files = mergeMulterFiles(
      req.files as Record<string, Express.Multer.File[]>
    );

    if (!files.length)
      return res.status(400).json({ message: "No KYC files uploaded" });

    const kyc = await KYCService.submitKYC(req.user!.id, req.body, files);

    return res.status(201).json(formatKycResponse(kyc));

  } catch (err: any) {
    console.error("KYC submission error:", err);
    res.status(500).json({ message: err.message });
  }   
};

export const verifyKYC = async (req: AuthRequest, res: Response) => {
  try {
    const { kycId, status, remarks } = req.body;

    const result = await KYCService.verifyKYC(kycId, status, remarks);

    return res.json({
      message: `KYC ${status}`,
      kyc: result.kyc,
      user: result.user,
    });

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const DeleteKYCDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { kycId, documentId } = req.params;

    const result = await KYCService.deleteKYCDocument(kycId, documentId);

    return res.status(200).json(result);

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getKycById = async (req: AuthRequest, res: Response) => {
  try {
    const kycId = req.params.kycId;
    const kyc = await KYCService.getKycById(kycId);

    return res.json(kyc);

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
