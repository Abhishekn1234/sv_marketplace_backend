import { KYCRepo, KYCMapper, mapFileToKYC, validateKYCSubmissionstatus } from "shared-lib";
import { userRepo } from "shared-lib/dist/Repositories/User/userRepo";
import { IKYCDocument, IKYC } from "shared-lib";
import { IUser } from "shared-lib";
import { SubmitKYCBody, KYCStatus } from "shared-lib/dist/Types/kyc";

export const KYCService = {
  async getKYCByUser(userId: string): Promise<IKYCDocument[]> {
    const kyc = await KYCRepo.findOneByUser(userId);
    if (!kyc) return [];
    return KYCMapper.mapKYC(kyc).documents;
  },

  async submitKYC(userId: string, body: SubmitKYCBody, files: Express.Multer.File[]): Promise<IKYC> {
    const user = await userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    await validateKYCSubmissionstatus(userId);

    let kyc = await KYCRepo.findOneByUser(userId);
    if (!kyc) kyc = KYCRepo.createEmpty(userId);

    const newDocs = mapFileToKYC(files);
    kyc.documents = this.mergeDocuments(kyc.documents, newDocs);
    kyc.overallStatus = "pending";

    const savedKyc = await KYCRepo.save(kyc);

    const updatedDocuments = [...(user.documents || []), savedKyc._id];
    await userRepo.updateKycdocuments(userId, {
      documents: updatedDocuments,
      kycStatus: "pending",
    });

    return savedKyc;
  },

  mergeDocuments(existingDocs: IKYCDocument[], newDocs: IKYCDocument[]): IKYCDocument[] {
    const updatedDocs = [...existingDocs];

    newDocs.forEach((doc) => {
      const index = updatedDocs.findIndex(d => d.documentType === doc.documentType);
      if (index >= 0) updatedDocs[index] = doc;
      else updatedDocs.push(doc);
    });

    return updatedDocs;
  },

  async verifyKYC(kycId: string, status: KYCStatus, remarks: string): Promise<{ kyc: IKYC; user: IUser | null }> {
    const kyc = await KYCRepo.findById(kycId);
    if (!kyc) throw new Error("KYC not found");

    kyc.overallStatus = status;
    kyc.remarks = remarks;
    await KYCRepo.save(kyc);

    const user = await userRepo.updateKYCStatus(kyc.userId.toString(), status);
    return { kyc, user };
  },

  async deleteKYCDocument(userId: string, docId: string): Promise<{ message: string }> {
    const kyc = await KYCRepo.findOneByUser(userId);
    if (!kyc) throw new Error("KYC not found");

  const index = kyc.documents.findIndex((d: IKYCDocument) => d._id?.toString() === docId );
    if (index === -1) throw new Error("Document not found");

    kyc.documents.splice(index, 1);
    if (kyc.documents.length === 0) kyc.overallStatus = "rejected";
    await KYCRepo.save(kyc);

    const user = await userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    user.documents = user.documents?.filter(d => d.toString() !== docId);
    if (user.documents?.length === 0) user.kycStatus = "rejected";

    await userRepo.updateKycdocuments(userId, {
      documents: user.documents,
      kycStatus: user.kycStatus,
    });

    return { message: "Document deleted successfully" };
  },

  async getKycById(kycId: string): Promise<IKYC> {
    const kyc = await KYCRepo.findByIdWithUser(kycId);
    if (!kyc) throw new Error("KYC not found");
    return kyc;
  },
};


