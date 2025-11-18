import { KYC, IKYCDocument } from "../Models/KYC";

export const KYCRepo = {
  findByUserId(userId: string) {
    return KYC.find({ userId }).sort({ createdAt: -1 }).lean();
  },

  findOneByUser(userId: string) {
    return KYC.findOne({ userId });
  },

  findLatestByUser(userId: string) {
    return KYC.findOne({ userId }).sort({ createdAt: -1 }).lean();
  },

  createEmpty(userId: string) {
    return new KYC({
      userId,
      documents: [],
      overallStatus: "pending",
    });
  },

  findById(kycId: string) {
    return KYC.findById(kycId);
  },

  findByIdWithUser(kycId: string) {
    return KYC.findById(kycId).populate(
      "userId",
      "fullName email phone kycStatus"
    );
  },

  deleteById(kycId: string) {
    return KYC.findByIdAndDelete(kycId);
  },

  deleteAllByUser(userId: string) {
    return KYC.deleteMany({ userId });
  },

  save(kyc: any) {
    return kyc.save();
  },
};




