import { IUser } from "../../Auth/Models/User";

export const KYCMapper = {
  mapUser(user: IUser | any) {
    if (!user) return null;

    const { __v, createdAt, updatedAt, ...rest } = user;
    return rest;
  },

  mapDocuments(documents: any[]) {
    return documents.map((doc) => ({
      category: doc.category,
      documentType: doc.documentType,
      fileName: doc.fileName,
      publicId: doc.publicId,
      filePath: doc.filePath,
      fileType: doc.fileType,
      uploadedAt: doc.uploadedAt,
      remarks: doc.remarks,
    }));
  },

  mapKYC(kyc: any) {
    return {
      _id: kyc._id,
      nationality: kyc.nationality,
      address: kyc.address,
      overallStatus: kyc.overallStatus,
      remarks: kyc.remarks,
      user: this.mapUser(kyc.userId),
      documents: this.mapDocuments(kyc.documents || []),
    };
  },
};
