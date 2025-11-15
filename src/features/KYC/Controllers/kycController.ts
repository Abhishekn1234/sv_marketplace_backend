// src/modules/KYC/controllers/kycController.ts

import { Response } from "express";
import { AuthRequest } from "../../Middlewares/Auth/authMiddleware";
import { KYCService } from "../Service/kycService";

export const getKYCByUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId || req.user?._id;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const kycs = await KYCService.getKYCByUser(userId.toString());
    if (!kycs.length)
      return res.status(404).json({ message: "No KYC documents found for this user" });

    res.json(kycs);
  } catch (err: any) {
    console.error("Error fetching KYC documents:", err);
    res.status(500).json({ message: err.message });
  }
};




export const submitKYC = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.files || !(req.files instanceof Array))
      return res.status(400).json({ message: "No KYC files uploaded" });

    const { kyc, user } = await KYCService.submitKYC(req.user!.id, req.body, req.files);
    res.status(201).json( {kyc,user} );
  } catch (err: any) {
    console.error("KYC submission error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const verifyKYC = async (req: AuthRequest, res: Response) => {
  try {
    const { kycId, status, remarks } = req.body;
    const { kyc, user } = await KYCService.verifyKYC(kycId, status, remarks);

    res.json({ message: `KYC ${status}`, kyc, user });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
export const DeleteKYCDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { kycId, documentId } = req.params;

    const result = await KYCService.deleteKYCDocument(kycId, documentId);

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getKycById=async(req:AuthRequest,res:Response)=>{
  try{
  const KycId=req.params.kycId;
  const kyc=await KYCService.getKycById(KycId);
  res.json(kyc);
  }catch(err:any){
    res.status(500).json({message:err.message});
  }
}
