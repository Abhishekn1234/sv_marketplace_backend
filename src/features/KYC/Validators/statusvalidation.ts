import { userRepo } from "../../Auth/Repositories/user";
import { KYCRepo } from "../Repositories/kyc.repo";

export const validateKYCSubmissionstatus = async (userId: string) => {
  const kycUser = await KYCRepo.findOneByUser(userId);
  const user = await userRepo.findById(userId);
   if (!user) throw new Error("USER NOT FOUND");
  if (!kycUser || user.kycStatus === "not_submitted") {
    return true;
  }
  if (kycUser.overallStatus === "pending" || user.kycStatus === "pending") {
    throw new Error("KYC is already pending and cannot be submitted again");
  }
  if (kycUser.overallStatus === "approved") {
    throw new Error("KYC is already approved. Resubmission not allowed");
  }
  if (kycUser.overallStatus === "rejected") {
    return true;
  }

  return true;
};



