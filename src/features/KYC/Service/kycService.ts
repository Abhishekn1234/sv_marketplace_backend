import { KYCRepo } from "../Repositories/kyc.repo";
import { userRepo } from "../../Auth/Repositories/user";
import { KYCMapper } from "../Repositories/kyc.mapper";
import { mapFileToKYC } from "../utils/fileUtils";
import { IKYCDocument, IKYC } from "../Models/KYC";
import { IUser } from "../../Auth/Models/User";
import { Express } from "express";

// -------- Types --------
import { SubmitKYCBody,KYCStatus } from "../Types/Kyc";
import { validateKYCSubmissionstatus } from "../Validators/statusvalidation";


export const KYCService = {
  // Get latest KYC for a user
  

async getKYCByUser(userId: string): Promise<IKYCDocument[]> {
  const kyc: IKYC | null = await KYCRepo.findOneByUser(userId);
  if (!kyc) return [];
  
  const mappedKYC = KYCMapper.mapKYC(kyc); // returns object
  return mappedKYC.documents; // <-- only return the array
},

  // Submit or update KYC documents
  async submitKYC(userId: string, body: SubmitKYCBody, files: Express.Multer.File[]): Promise<IKYC> {
    const user: IUser | null = await userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    let kyc: IKYC | null = await KYCRepo.findOneByUser(userId);
    if (!kyc) kyc = KYCRepo.createEmpty(userId);
    validateKYCSubmissionstatus(kyc.overallStatus,user.kycStatus);
    
    const newDocs: IKYCDocument[] = mapFileToKYC(files);

    // Replace or add new documents
    newDocs.forEach(newDoc => {
      const index = kyc!.documents.findIndex(d => d.documentType === newDoc.documentType);
      if (index > -1) {
        kyc!.documents[index] = newDoc;
      } else {
        kyc!.documents.push(newDoc);
      }
    });

    kyc.overallStatus = "pending";
    user.kycStatus = "pending";
    
    await user.save();

    return KYCRepo.save(kyc);
  },

  // Verify KYC
  async verifyKYC(
    kycId: string,
    status: "pending" | "verified" | "rejected",
    remarks: string
  ): Promise<{ kyc: IKYC; user: IUser | null }> {
    const kyc: IKYC | null = await KYCRepo.findById(kycId);
    if (!kyc) throw new Error("KYC not found");

    kyc.overallStatus = status;
    kyc.remarks = remarks;

    await KYCRepo.save(kyc);

    const userStatusMap: Record<"pending" | "verified" | "rejected", KYCStatus> = {
      pending: "pending",
      verified: "verified",
      rejected: "rejected",
    };

    const user: IUser | null = await userRepo.updateKYCStatus(
      kyc.userId.toString(),
      userStatusMap[status]
    );

    return { kyc, user };
  },

  // Delete single KYC document
  async deleteKYCDocument(userId: string, docId: string): Promise<{ message: string }> {
    const kyc: IKYC | null = await KYCRepo.findOneByUser(userId);
    if (!kyc) throw new Error("KYC not found");

    const index = kyc.documents.findIndex(d => d._id?.toString() === docId);
    if (index === -1) throw new Error("Document not found");

    kyc.documents.splice(index, 1);

    if (kyc.documents.length === 0) kyc.overallStatus = "rejected";

    await KYCRepo.save(kyc);

    return { message: "Document deleted successfully" };
  },

  // Get KYC by ID
  async getKycById(kycId: string): Promise<IKYC> {
    const kyc: IKYC | null = await KYCRepo.findByIdWithUser(kycId);
    if (!kyc) throw new Error("KYC not found");
    return kyc;
  },
};

