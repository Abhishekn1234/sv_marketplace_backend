import { IKYCDocument } from "../Models/KYC";

export const formatKycResponse = (kyc: any) => ({
  documents: kyc.documents.map((doc: IKYCDocument) => ({
    category: doc.category,
    documentType: doc.documentType,
    fileName: doc.fileName,
    filePath: doc.filePath,
    fileType: doc.fileType,
    uploadedAt: doc.uploadedAt,
  })),
  overallStatus: kyc.overallStatus,
});
